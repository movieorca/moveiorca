<?php
/**
 * Plugin Name: Remote Mini Browser
 * Plugin URI: https://your-site.com/mini-browser
 * Description: Embeds a remote-controlled headless browser in your WordPress site. Supports both individual sessions and shared browser for high traffic.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://your-site.com
 * License: MIT
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class MiniBrowserPlugin {

    private $plugin_url;
    private $plugin_path;

    public function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->plugin_path = plugin_dir_path(__FILE__);

        // Add shortcode
        add_shortcode('mini_browser', array($this, 'render_mini_browser'));

        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));

        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Render the mini browser
     */
    public function render_mini_browser($atts) {
        // Parse attributes
        $atts = shortcode_atts(array(
            'url' => get_option('mini_browser_default_url', 'https://www.fcm.org.co/simit/'),
            'mode' => get_option('mini_browser_mode', 'shared'), // 'shared' or 'individual'
            'width' => '100%',
            'height' => '600px',
            'show_controls' => get_option('mini_browser_show_controls', 'false'),
        ), $atts);

        $server_url = get_option('mini_browser_server_url', 'http://localhost:3002');
        $ws_url = get_option('mini_browser_ws_url', 'ws://localhost:3002');
        $show_controls = ($atts['show_controls'] === 'true') ? 'true' : 'false';

        // Generate unique ID for this instance
        $instance_id = 'mini-browser-' . uniqid();

        ob_start();
        ?>
        <div class="mini-browser-wrapper" style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>; position: relative;">
            <div id="<?php echo esc_attr($instance_id); ?>" class="mini-browser-container"></div>
            <canvas id="<?php echo esc_attr($instance_id); ?>-canvas"
                    style="width: 100%; height: 100%; background: #1a1a1a; cursor: pointer; display: block;"></canvas>
        </div>

        <style>
            .mini-browser-wrapper {
                border: 2px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .mini-browser-container {
                position: relative;
                width: 100%;
                height: 100%;
            }
        </style>

        <script>
        (function() {
            const instanceId = '<?php echo esc_js($instance_id); ?>';
            const serverUrl = '<?php echo esc_js($server_url); ?>';
            const wsUrl = '<?php echo esc_js($ws_url); ?>';
            const mode = '<?php echo esc_js($atts['mode']); ?>';

            const canvas = document.getElementById(instanceId + '-canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = 1280;
            canvas.height = 720;

            let ws = null;
            let sessionId = null;

            // Draw loading screen
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Connecting...', canvas.width / 2, canvas.height / 2);

            // Connect to server
            async function connect() {
                try {
                    if (mode === 'individual') {
                        // Individual session mode
                        const response = await fetch(serverUrl + '/api/session/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        const data = await response.json();
                        if (data.success && data.sessionId) {
                            sessionId = data.sessionId;
                        }
                    }

                    // Connect WebSocket
                    ws = new WebSocket(wsUrl);

                    ws.onopen = () => {
                        console.log('Connected to mini browser');

                        if (mode === 'individual' && sessionId) {
                            ws.send(JSON.stringify({
                                type: 'connect',
                                sessionId: sessionId
                            }));
                        }
                    };

                    ws.onmessage = (event) => {
                        const message = JSON.parse(event.data);

                        if (message.type === 'screenshot') {
                            const img = new Image();
                            img.onload = () => {
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            };
                            img.src = 'data:image/jpeg;base64,' + message.data;
                        }
                    };

                    ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                    };

                    ws.onclose = () => {
                        console.log('Disconnected from mini browser');
                        // Attempt reconnect after 5 seconds
                        setTimeout(connect, 5000);
                    };

                } catch (error) {
                    console.error('Connection error:', error);
                    setTimeout(connect, 5000);
                }
            }

            // Handle click events (if enabled)
            canvas.addEventListener('click', (e) => {
                if (!ws || ws.readyState !== WebSocket.OPEN) return;

                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;

                const x = Math.round((e.clientX - rect.left) * scaleX);
                const y = Math.round((e.clientY - rect.top) * scaleY);

                ws.send(JSON.stringify({
                    type: 'click',
                    x: x,
                    y: y
                }));
            });

            // Handle scroll events (if enabled)
            canvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (!ws || ws.readyState !== WebSocket.OPEN) return;

                ws.send(JSON.stringify({
                    type: 'scroll',
                    deltaX: e.deltaX,
                    deltaY: e.deltaY
                }));
            });

            // Cleanup on page unload
            window.addEventListener('beforeunload', () => {
                if (ws) ws.close();
                if (mode === 'individual' && sessionId) {
                    fetch(serverUrl + '/api/session/' + sessionId, {
                        method: 'DELETE'
                    });
                }
            });

            // Start connection
            connect();
        })();
        </script>
        <?php

        return ob_get_clean();
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'Mini Browser Settings',
            'Mini Browser',
            'manage_options',
            'mini-browser-settings',
            array($this, 'render_settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('mini_browser_settings', 'mini_browser_server_url');
        register_setting('mini_browser_settings', 'mini_browser_ws_url');
        register_setting('mini_browser_settings', 'mini_browser_default_url');
        register_setting('mini_browser_settings', 'mini_browser_mode');
        register_setting('mini_browser_settings', 'mini_browser_show_controls');
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Mini Browser Settings</h1>

            <form method="post" action="options.php">
                <?php settings_fields('mini_browser_settings'); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="mini_browser_server_url">Server URL</label>
                        </th>
                        <td>
                            <input type="text"
                                   id="mini_browser_server_url"
                                   name="mini_browser_server_url"
                                   value="<?php echo esc_attr(get_option('mini_browser_server_url', 'http://localhost:3002')); ?>"
                                   class="regular-text" />
                            <p class="description">HTTP server URL (e.g., https://your-server.com:3002)</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="mini_browser_ws_url">WebSocket URL</label>
                        </th>
                        <td>
                            <input type="text"
                                   id="mini_browser_ws_url"
                                   name="mini_browser_ws_url"
                                   value="<?php echo esc_attr(get_option('mini_browser_ws_url', 'ws://localhost:3002')); ?>"
                                   class="regular-text" />
                            <p class="description">WebSocket URL (e.g., wss://your-server.com:3002)</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="mini_browser_default_url">Default URL to Load</label>
                        </th>
                        <td>
                            <input type="text"
                                   id="mini_browser_default_url"
                                   name="mini_browser_default_url"
                                   value="<?php echo esc_attr(get_option('mini_browser_default_url', 'https://www.fcm.org.co/simit/')); ?>"
                                   class="regular-text" />
                            <p class="description">The website to display in the browser</p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="mini_browser_mode">Browser Mode</label>
                        </th>
                        <td>
                            <select id="mini_browser_mode" name="mini_browser_mode">
                                <option value="shared" <?php selected(get_option('mini_browser_mode', 'shared'), 'shared'); ?>>
                                    Shared (Recommended for 100+ users)
                                </option>
                                <option value="individual" <?php selected(get_option('mini_browser_mode'), 'individual'); ?>>
                                    Individual (For <50 users)
                                </option>
                            </select>
                            <p class="description">
                                <strong>Shared:</strong> One browser for all users (low resources, high traffic)<br>
                                <strong>Individual:</strong> Separate browser per user (high resources, low traffic)
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="mini_browser_show_controls">Show Controls</label>
                        </th>
                        <td>
                            <input type="checkbox"
                                   id="mini_browser_show_controls"
                                   name="mini_browser_show_controls"
                                   value="true"
                                   <?php checked(get_option('mini_browser_show_controls', 'false'), 'true'); ?> />
                            <label for="mini_browser_show_controls">Show address bar and navigation controls</label>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr>

            <h2>Usage</h2>
            <p>Add this shortcode to any page or post:</p>
            <pre>[mini_browser]</pre>

            <p>Or customize it:</p>
            <pre>[mini_browser url="https://example.com" mode="shared" width="100%" height="800px"]</pre>

            <h3>Server Status</h3>
            <p id="server-status">Checking...</p>

            <script>
            (async function checkServerStatus() {
                const serverUrl = document.getElementById('mini_browser_server_url').value;
                const statusEl = document.getElementById('server-status');

                try {
                    const response = await fetch(serverUrl + '/health');
                    const data = await response.json();

                    if (data.status === 'ok') {
                        statusEl.innerHTML = '<span style="color: green;">✓ Server is online</span><br>' +
                            'Viewers: ' + (data.viewers || 0) + ' / ' + (data.maxViewers || 'unlimited') + '<br>' +
                            'Target URL: ' + (data.targetUrl || 'N/A');
                    } else {
                        statusEl.innerHTML = '<span style="color: red;">✗ Server error</span>';
                    }
                } catch (error) {
                    statusEl.innerHTML = '<span style="color: red;">✗ Cannot connect to server</span><br>' +
                        'Make sure the server is running and the URL is correct.';
                }
            })();
            </script>
        </div>
        <?php
    }
}

// Initialize plugin
new MiniBrowserPlugin();
