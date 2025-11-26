<?php
/**
 * Plugin Name: SIMIT Estado de Cuenta
 * Plugin URI: https://simit-por-placa.com.co
 * Description: Plugin para consultar comparendos, multas y acuerdos de pago del SIMIT en un popup
 * Version: 1.0.0
 * Author: SIMIT-Por-Placa.com.co
 * Author URI: https://simit-por-placa.com.co
 * License: GPL v2 or later
 * Text Domain: simit-estado-cuenta
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class SIMIT_Estado_Cuenta {

    public function __construct() {
        // Add shortcode
        add_shortcode('simit_button', array($this, 'simit_button_shortcode'));

        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    /**
     * Shortcode to display SIMIT button
     * Usage: [simit_button text="Consultar SIMIT" icon="⚡" bg_color="#0066a1" text_color="#ffffff"]
     */
    public function simit_button_shortcode($atts) {
        $atts = shortcode_atts(array(
            'text' => 'Consultar SIMIT',
            'icon' => '⚡',
            'bg_color' => '#0066a1',
            'text_color' => '#ffffff',
            'margin_top' => '20px',
            'margin_bottom' => '20px',
            'margin_left' => '20px',
            'padding' => '18px 40px'
        ), $atts);

        ob_start();
        ?>
        <button class="simit-trigger-button"
                style="background-color: <?php echo esc_attr($atts['bg_color']); ?>;
                       color: <?php echo esc_attr($atts['text_color']); ?>;
                       margin-top: <?php echo esc_attr($atts['margin_top']); ?>;
                       margin-bottom: <?php echo esc_attr($atts['margin_bottom']); ?>;
                       margin-left: <?php echo esc_attr($atts['margin_left']); ?>;
                       padding: <?php echo esc_attr($atts['padding']); ?>;">
            <?php if (!empty($atts['icon'])): ?>
                <span class="simit-button-icon"><?php echo esc_html($atts['icon']); ?></span>
            <?php endif; ?>
            <?php echo esc_html($atts['text']); ?>
        </button>
        <?php
        return ob_get_clean();
    }

    /**
     * Enqueue CSS and JS
     */
    public function enqueue_assets() {
        // Enqueue styles
        wp_add_inline_style('wp-block-library', $this->get_inline_css());

        // Enqueue script
        wp_add_inline_script('jquery', $this->get_inline_js());

        // Add popup HTML to footer
        add_action('wp_footer', array($this, 'add_popup_html'));
    }

    /**
     * Get inline CSS
     */
    private function get_inline_css() {
        return '
        /* SIMIT Trigger Button */
        .simit-trigger-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            column-gap: 0.5em;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            text-align: center;
            padding: 18px 40px;
            margin-top: 20px;
            margin-bottom: 20px;
            margin-left: 20px;
            border-radius: 50px;
            border: none;
            cursor: pointer;
            font-size: 18px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            text-decoration: none;
            letter-spacing: 0.3px;
        }

        .simit-trigger-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .simit-trigger-button:active {
            transform: translateY(0);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
        }

        .simit-button-icon {
            font-size: 24px;
            font-weight: bold;
            line-height: 1;
        }

        /* SIMIT Popup Overlay */
        .simit-popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            animation: simitFadeIn 0.3s ease-out;
            padding: 10px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }

        .simit-popup-overlay.active {
            display: flex;
        }

        .simit-popup-container {
            background: white;
            border-radius: 16px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            animation: simitSlideUp 0.4s ease-out;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            -webkit-overflow-scrolling: touch;
            margin: auto;
        }

        .simit-popup-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            border: none;
            font-size: 32px;
            color: #9ca3af;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .simit-popup-close:hover {
            background: #f3f4f6;
            color: #6b7280;
            transform: rotate(90deg);
        }

        /* SIMIT Widget Styles */
        .simit-search-widget {
            padding: 40px 20px;
            position: relative;
            min-height: 400px;
        }

        .simit-search-widget * {
            box-sizing: border-box;
        }

        .simit-search-section {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            text-align: center;
            transition: opacity 0.3s ease;
        }

        .simit-search-section.hidden {
            opacity: 0;
            pointer-events: none;
            position: absolute;
        }

        .simit-page-title {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            line-height: 1.2;
        }

        .simit-page-subtitle {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.4;
        }

        .simit-search-container {
            display: flex;
            gap: 0;
            max-width: 600px;
            margin: 0 auto;
        }

        .simit-search-input {
            flex: 1;
            padding: 18px 24px;
            font-size: 16px;
            border: 2px solid #e5e7eb;
            border-right: none;
            border-radius: 12px 0 0 12px;
            outline: none;
            background: white;
            transition: all 0.3s ease;
        }

        .simit-search-input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .simit-search-input::placeholder {
            color: #9ca3af;
        }

        .simit-search-button {
            background: #3b82f6;
            border: none;
            padding: 18px 24px;
            border-radius: 0 12px 12px 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            min-width: 80px;
        }

        .simit-search-button:hover {
            background: #2563eb;
        }

        .simit-search-button:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }

        .simit-search-icon {
            width: 24px;
            height: 24px;
            fill: white;
        }

        /* Loading Container */
        .simit-loading-container {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 20px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: white;
        }

        .simit-loading-container.active {
            display: flex;
        }

        .simit-spinner-ring {
            width: 60px;
            height: 60px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: simitSpin 1s linear infinite;
        }

        /* Options Container */
        .simit-options-container {
            display: none;
            padding: 40px 20px;
            max-width: 600px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }

        .simit-options-container.active {
            display: block;
        }

        .simit-options-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 15px;
            text-align: center;
        }

        .simit-options-text {
            color: #666;
            margin-bottom: 25px;
            line-height: 1.5;
            text-align: center;
        }

        .simit-search-number-highlight {
            font-weight: 600;
            color: #1e40af;
        }

        .simit-option-group {
            margin-bottom: 20px;
        }

        .simit-option {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 10px;
        }

        .simit-option:hover {
            background: #f8fafc;
            border-color: #3b82f6;
        }

        .simit-option.selected {
            background: #eff6ff;
            border-color: #3b82f6;
        }

        .simit-option input[type="radio"] {
            margin: 0;
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #3b82f6;
        }

        .simit-option-text {
            flex: 1;
        }

        .simit-option-label {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 2px;
        }

        .simit-option-subtitle {
            font-size: 14px;
            color: #6b7280;
        }

        .simit-continue-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            transition: all 0.3s ease;
            margin-top: 10px;
        }

        .simit-continue-btn:hover:not(:disabled) {
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .simit-continue-btn:disabled {
            background: #cbd5e1;
            cursor: not-allowed;
        }

        /* Results Container */
        .simit-results-container {
            display: none;
            padding: 40px 20px;
            max-width: 600px;
            margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            text-align: center;
        }

        .simit-results-container.active {
            display: block;
        }

        .simit-results-icon {
            width: 80px;
            height: 80px;
            background: #dcfce7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }

        .simit-results-icon svg {
            width: 40px;
            height: 40px;
            fill: #16a34a;
        }

        .simit-results-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }

        .simit-results-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
        }

        .simit-view-results-link {
            display: inline-block;
            background: #16a34a;
            color: white;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);
        }

        .simit-view-results-link:hover {
            background: #15803d;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
            color: white;
        }

        .simit-new-search-btn {
            display: inline-block;
            background: transparent;
            color: #3b82f6;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            margin-top: 15px;
            border: 2px solid #3b82f6;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .simit-new-search-btn:hover {
            background: #eff6ff;
            color: #3b82f6;
        }

        @keyframes simitSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes simitFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes simitSlideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Remove tap highlight on mobile */
        * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .simit-popup-overlay {
                padding: 0;
                align-items: flex-start;
            }

            .simit-popup-container {
                width: 100%;
                max-height: 100vh;
                min-height: 100vh;
                border-radius: 0;
                margin: 0;
            }

            .simit-search-widget {
                padding: 20px 15px;
                min-height: auto;
            }

            .simit-search-section {
                padding: 15px 0;
            }

            .simit-page-title {
                font-size: 1.75rem;
                margin-bottom: 10px;
            }

            .simit-page-subtitle {
                font-size: 0.95rem;
                margin-bottom: 20px;
            }

            .simit-search-container {
                max-width: 100%;
            }

            .simit-search-input {
                font-size: 16px;
                padding: 14px 16px;
            }

            .simit-search-button {
                padding: 14px 20px;
                min-width: 60px;
            }

            .simit-popup-close {
                top: 15px;
                right: 15px;
                width: 44px;
                height: 44px;
                font-size: 28px;
            }

            .simit-options-container,
            .simit-results-container {
                padding: 20px 15px;
            }

            .simit-options-title {
                font-size: 18px;
            }

            .simit-options-text {
                font-size: 14px;
            }

            .simit-option {
                padding: 12px;
                margin-bottom: 8px;
            }

            .simit-continue-btn {
                padding: 14px 24px;
                font-size: 15px;
            }

            .simit-results-title {
                font-size: 20px;
            }

            .simit-results-subtitle {
                font-size: 14px;
            }

            .simit-view-results-link {
                padding: 14px 32px;
                font-size: 15px;
            }

            .simit-trigger-button {
                padding: 14px 32px;
                font-size: 16px;
                margin-left: 0;
                width: 100%;
                max-width: 100%;
            }
        }

        @media (max-width: 480px) {
            .simit-page-title {
                font-size: 1.5rem;
            }

            .simit-page-subtitle {
                font-size: 0.9rem;
            }

            .simit-search-input {
                padding: 12px 14px;
                font-size: 16px;
            }

            .simit-search-button {
                padding: 12px 16px;
                min-width: 54px;
            }

            .simit-option {
                padding: 10px;
            }

            .simit-option-label {
                font-size: 14px;
            }

            .simit-option-subtitle {
                font-size: 12px;
            }
        }

        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
            .simit-search-input {
                font-size: 16px !important;
            }

            .simit-popup-container {
                -webkit-overflow-scrolling: touch;
            }
        }
        ';
    }

    /**
     * Get inline JavaScript
     */
    private function get_inline_js() {
        return "
        jQuery(document).ready(function($) {
            let simitSelectedOption = null;
            let simitSearchValue = '';

            // Open popup when trigger button is clicked
            $(document).on('click', '.simit-trigger-button', function(e) {
                e.preventDefault();
                $('#simitPopupOverlay').addClass('active');

                // Better mobile scroll lock
                $('body').css({
                    'overflow': 'hidden',
                    'position': 'fixed',
                    'width': '100%',
                    'height': '100%'
                });

                // Reset to initial state
                resetSimitPopup();

                // Focus on input for better mobile UX
                setTimeout(function() {
                    $('#simitSearchInput').focus();
                }, 300);
            });

            // Reset popup to initial state
            function resetSimitPopup() {
                $('#simitSearchSection').removeClass('hidden');
                $('#simitLoadingContainer').removeClass('active');
                $('#simitOptionsContainer').removeClass('active');
                $('#simitResultsContainer').removeClass('active');
                $('#simitSearchInput').val('');
                simitSearchValue = '';
                simitSelectedOption = null;
            }

            // Close popup
            function closeSimitPopup() {
                $('#simitPopupOverlay').removeClass('active');

                // Restore body scroll
                $('body').css({
                    'overflow': '',
                    'position': '',
                    'width': '',
                    'height': ''
                });

                resetSimitPopup();
            }

            $(document).on('click', '.simit-popup-close', closeSimitPopup);
            $(document).on('click', '.simit-popup-overlay', function(e) {
                if (e.target === this) {
                    closeSimitPopup();
                }
            });

            // Handle Enter key in search input
            $(document).on('keypress', '#simitSearchInput', function(e) {
                if (e.key === 'Enter') {
                    performSimitSearch();
                }
            });

            // Perform search
            window.performSimitSearch = function() {
                const input = $('#simitSearchInput');
                const button = $('.simit-search-button');
                simitSearchValue = input.val().trim();

                if (!simitSearchValue) {
                    input.focus();
                    input.css('border-color', '#ef4444');
                    setTimeout(function() {
                        input.css('border-color', '#e5e7eb');
                    }, 2000);
                    return;
                }

                button.prop('disabled', true);

                // Hide search section and show loading
                $('#simitSearchSection').addClass('hidden');
                $('#simitLoadingContainer').addClass('active');

                // 10 seconds loading
                setTimeout(function() {
                    $('#simitLoadingContainer').removeClass('active');
                    $('#simitOptionsContainer').addClass('active');
                    button.prop('disabled', false);

                    $('#simitSearchNumber').text(simitSearchValue);

                    // Reset selection
                    simitSelectedOption = null;
                    $('#simitContinueBtn').prop('disabled', true);
                    $('.simit-option').removeClass('selected');
                    $('input[name=\"simitOption\"]').prop('checked', false);
                }, 10000);
            };

            // Select option
            window.selectSimitOption = function(index) {
                simitSelectedOption = index;

                $('.simit-option').each(function(i) {
                    if (i === index) {
                        $(this).addClass('selected');
                    } else {
                        $(this).removeClass('selected');
                    }
                });

                $('#simitOption' + (index + 1)).prop('checked', true);
                $('#simitContinueBtn').prop('disabled', false);
            };

            // Continue to results
            window.continueToResults = function() {
                if (simitSelectedOption === null || !simitSearchValue) {
                    return;
                }

                const continueBtn = $('#simitContinueBtn');
                continueBtn.prop('disabled', true);

                // Show loading again
                $('#simitOptionsContainer').removeClass('active');
                $('#simitLoadingContainer').addClass('active');

                // Random delay 10-15 seconds
                const randomDelay = Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000;

                setTimeout(function() {
                    // Hide loading and show results with button
                    $('#simitLoadingContainer').removeClass('active');
                    $('#simitResultsContainer').addClass('active');

                    // Set the link URL
                    const targetUrl = 'https://www.fcm.org.co/simit/#/estado-cuenta?numDocPlacaProp=' + encodeURIComponent(simitSearchValue);
                    $('#simitResultsLink').attr('href', targetUrl);
                    $('#simitResultNumber').text(simitSearchValue);

                    continueBtn.prop('disabled', false);
                }, randomDelay);
            };

            // New search button
            window.startNewSearch = function() {
                resetSimitPopup();
            };

            // Close with Escape key
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeSimitPopup();
                }
            });
        });
        ";
    }

    /**
     * Add popup HTML to footer
     */
    public function add_popup_html() {
        ?>
        <!-- SIMIT Popup Overlay -->
        <div class="simit-popup-overlay" id="simitPopupOverlay">
            <div class="simit-popup-container">
                <button class="simit-popup-close" aria-label="Cerrar">&times;</button>

                <div class="simit-search-widget">
                    <!-- Search Section -->
                    <div class="simit-search-section" id="simitSearchSection">
                        <h2 class="simit-page-title">Estado de cuenta</h2>
                        <p class="simit-page-subtitle">Consulta aquí comparendos, multas y acuerdos de pago</p>

                        <div class="simit-search-container">
                            <input type="text" class="simit-search-input" placeholder="Número de identificación o placa del vehículo" id="simitSearchInput">
                            <button class="simit-search-button" onclick="performSimitSearch()">
                                <svg class="simit-search-icon" viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Loading Container -->
                    <div class="simit-loading-container" id="simitLoadingContainer">
                        <div class="simit-spinner-ring"></div>
                    </div>

                    <!-- Options Container -->
                    <div class="simit-options-container" id="simitOptionsContainer">
                        <h3 class="simit-options-title">Estado de cuenta</h3>
                        <p class="simit-options-text">Se han encontrado varios resultados para la búsqueda del número <span class="simit-search-number-highlight" id="simitSearchNumber"></span>. Selecciona el que desees consultar.</p>

                        <div class="simit-option-group">
                            <div class="simit-option" onclick="selectSimitOption(0)">
                                <input type="radio" name="simitOption" id="simitOption1">
                                <div class="simit-option-text">
                                    <div class="simit-option-label">N* N*</div>
                                    <div class="simit-option-subtitle">Cédula</div>
                                </div>
                            </div>

                            <div class="simit-option" onclick="selectSimitOption(1)">
                                <input type="radio" name="simitOption" id="simitOption2">
                                <div class="simit-option-text">
                                    <div class="simit-option-label">Inconsi*******</div>
                                    <div class="simit-option-subtitle">Cédula Extranjera</div>
                                </div>
                            </div>

                            <div class="simit-option" onclick="selectSimitOption(2)">
                                <input type="radio" name="simitOption" id="simitOption3">
                                <div class="simit-option-text">
                                    <div class="simit-option-label">S** S**</div>
                                    <div class="simit-option-subtitle">Cédula Venezolana</div>
                                </div>
                            </div>
                        </div>

                        <button class="simit-continue-btn" onclick="continueToResults()" disabled id="simitContinueBtn">Continuar</button>
                    </div>

                    <!-- Results Container -->
                    <div class="simit-results-container" id="simitResultsContainer">
                        <div class="simit-results-icon">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </div>
                        <h3 class="simit-results-title">¡Resultados Encontrados!</h3>
                        <p class="simit-results-subtitle">Tu consulta para el número <strong id="simitResultNumber"></strong> está lista. Haz clic en el botón para ver tus resultados.</p>

                        <a href="#" id="simitResultsLink" class="simit-view-results-link" target="_blank" rel="nofollow noopener noreferrer">
                            Ver Resultados
                        </a>

                        <div>
                            <button class="simit-new-search-btn" onclick="startNewSearch()">Nueva Búsqueda</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}

// Initialize the plugin
new SIMIT_Estado_Cuenta();
