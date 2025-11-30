<?php
/**
 * Plugin Name: SIMIT Search Widget
 * Plugin URI: https://example.com/simit-search-widget
 * Description: Professional search widget for SIMIT account status queries (comparendos, multas y acuerdos de pago)
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: simit-search-widget
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('SIMIT_WIDGET_VERSION', '1.0.0');
define('SIMIT_WIDGET_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SIMIT_WIDGET_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main SIMIT Search Widget Class
 */
class SIMIT_Search_Widget {

    /**
     * Instance of this class
     */
    private static $instance = null;

    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_shortcode('simit_search', array($this, 'render_widget'));
    }

    /**
     * Enqueue CSS and JavaScript
     */
    public function enqueue_assets() {
        // Only enqueue if shortcode is present
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'simit_search')) {
            wp_enqueue_style(
                'simit-widget-styles',
                SIMIT_WIDGET_PLUGIN_URL . 'assets/css/simit-widget.css',
                array(),
                SIMIT_WIDGET_VERSION,
                'all'
            );

            wp_enqueue_script(
                'simit-widget-script',
                SIMIT_WIDGET_PLUGIN_URL . 'assets/js/simit-widget.js',
                array(),
                SIMIT_WIDGET_VERSION,
                true
            );
        }
    }

    /**
     * Render the widget via shortcode
     */
    public function render_widget($atts) {
        // Parse attributes
        $atts = shortcode_atts(array(
            'title' => 'Estado de cuenta',
            'subtitle' => 'Consulta aquí comparendos, multas y acuerdos de pago',
        ), $atts, 'simit_search');

        // Sanitize attributes
        $title = sanitize_text_field($atts['title']);
        $subtitle = sanitize_text_field($atts['subtitle']);

        // Start output buffering
        ob_start();
        ?>
        <div class="simit-search-widget">
            <div class="simit-search-section">
                <h2 class="simit-page-title"><?php echo esc_html($title); ?></h2>
                <p class="simit-page-subtitle"><?php echo esc_html($subtitle); ?></p>

                <div class="simit-search-container">
                    <input type="text"
                           class="simit-search-input"
                           placeholder="Número de identificación o placa de vehículo"
                           id="simitSearchInput"
                           aria-label="Número de identificación o placa">
                    <button class="simit-search-button"
                            id="simitSearchButton"
                            aria-label="Buscar">
                        <svg class="simit-search-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Selection Modal -->
            <div class="simit-selection-modal" id="simitSelectionModal" role="dialog" aria-modal="true" aria-labelledby="simitModalTitle">
                <div class="simit-modal-content">
                    <button class="simit-close-btn"
                            id="simitCloseBtn"
                            aria-label="Cerrar modal">×</button>

                    <!-- Loading Container -->
                    <div class="simit-loading-container" id="simitLoadingContainer" aria-live="polite">
                        <div class="simit-spinner-ring" aria-label="Cargando"></div>
                        <p style="margin-top: 20px; color: #666;">Buscando resultados...</p>
                    </div>

                    <!-- Options Container -->
                    <div id="simitOptionsContainer">
                        <h3 class="simit-modal-title" id="simitModalTitle">Estado de cuenta</h3>
                        <p class="simit-modal-text">Se han encontrado varios resultados para la búsqueda del número <span id="simitSearchNumber"></span>. Selecciona el que desees consultar.</p>

                        <div class="simit-option-group" role="radiogroup" aria-label="Opciones de búsqueda">
                            <div class="simit-option" data-option="0">
                                <input type="radio" name="simitOption" id="simitOption1" value="0">
                                <div class="simit-option-text">
                                    <div class="simit-option-label">X*** XX*** X**</div>
                                    <div class="simit-option-subtitle">Cédula</div>
                                </div>
                            </div>

                            <div class="simit-option" data-option="1">
                                <input type="radio" name="simitOption" id="simitOption2" value="1">
                                <div class="simit-option-text">
                                    <div class="simit-option-label">JE*** ALE*** MEN****</div>
                                    <div class="simit-option-subtitle">Cédula Extranjera</div>
                                </div>
                            </div>

                            <div class="simit-option" data-option="2">
                                <input type="radio" name="simitOption" id="simitOption3" value="2">
                                <div class="simit-option-text">
                                    <div class="simit-option-label">JH** FA*** VICT****</div>
                                    <div class="simit-option-subtitle">Tarjeta Identidad</div>
                                </div>
                            </div>
                        </div>

                        <button class="simit-continue-btn"
                                id="simitContinueBtn"
                                disabled>Continuar</button>
                    </div>

                    <!-- Results Container -->
                    <div class="simit-results-container" id="simitResultsContainer">
                        <div class="simit-results-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                            </svg>
                        </div>
                        <h3 class="simit-results-title">¡Resultados Encontrados!</h3>
                        <p class="simit-results-subtitle">Tu consulta para el número <strong id="simitResultNumber"></strong> está lista. Haz clic en el botón para ver tus resultados.</p>

                        <a href="#"
                           id="simitResultsLink"
                           class="simit-view-results-link"
                           target="_blank"
                           rel="nofollow noopener noreferrer">
                            Ver Resultados
                        </a>

                        <div>
                            <button class="simit-new-search-btn" id="simitNewSearchBtn">Nueva Búsqueda</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

/**
 * Initialize the plugin
 */
function simit_search_widget_init() {
    return SIMIT_Search_Widget::get_instance();
}

// Start the plugin
add_action('plugins_loaded', 'simit_search_widget_init');
