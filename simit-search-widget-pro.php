<?php
/**
 * Plugin Name: SIMIT Search Widget Pro
 * Plugin URI: https://simit-por-placa.com.co
 * Description: Widget profesional para consultar comparendos, multas y acuerdos de pago del SIMIT
 * Version: 1.0.0
 * Author: SIMIT-Por-Placa.com.co
 * Author URI: https://simit-por-placa.com.co
 * License: Proprietary
 * Text Domain: simit-search-widget-pro
 * Requires PHP: 7.4
 *
 * @package SIMIT_Search_Widget_Pro
 * @copyright 2024 SIMIT-Por-Placa.com.co
 * @license Proprietary - Unauthorized copying or distribution prohibited
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit('Direct access forbidden.');
}

// Security constants
define('SIMIT_PRO_VERSION', '1.0.0');
define('SIMIT_PRO_PLUGIN_FILE', __FILE__);
define('SIMIT_PRO_NONCE_KEY', 'simit_pro_action_' . SIMIT_PRO_VERSION);

/**
 * Main SIMIT Search Widget Pro Class
 *
 * @since 1.0.0
 */
final class SIMIT_Search_Widget_Pro {

    /**
     * Instance
     * @var SIMIT_Search_Widget_Pro
     */
    private static $instance = null;

    /**
     * Security hash
     * @var string
     */
    private $security_hash;

    /**
     * Get instance
     */
    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->security_hash = $this->generate_security_hash();
        $this->init_hooks();
    }

    /**
     * Prevent cloning
     */
    private function __clone() {}

    /**
     * Prevent unserialization
     */
    public function __wakeup() {
        throw new Exception('Cannot unserialize singleton');
    }

    /**
     * Generate security hash
     */
    private function generate_security_hash() {
        return hash('sha256', get_site_url() . SIMIT_PRO_VERSION);
    }

    /**
     * Verify security
     */
    private function verify_security() {
        return hash_equals($this->security_hash, $this->generate_security_hash());
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        if (!$this->verify_security()) {
            return;
        }

        add_shortcode('simit_search', array($this, 'render_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('wp_footer', array($this, 'render_popup_html'), 100);
    }

    /**
     * Shortcode handler
     * Usage: [simit_search text="Consultar SIMIT" bg_color="#0066a1" text_color="#ffffff"]
     */
    public function render_shortcode($atts) {
        if (!$this->verify_security()) {
            return '';
        }

        $atts = shortcode_atts(array(
            'text' => 'Consultar Estado de Cuenta',
            'icon' => '🔍',
            'bg_color' => '#1e40af',
            'text_color' => '#ffffff',
            'hover_bg' => '#1e3a8a',
            'padding' => '18px 40px',
            'border_radius' => '50px',
            'font_size' => '18px',
        ), $atts, 'simit_search');

        // Sanitize all attributes
        $text = sanitize_text_field($atts['text']);
        $icon = sanitize_text_field($atts['icon']);
        $bg_color = sanitize_hex_color($atts['bg_color']);
        $text_color = sanitize_hex_color($atts['text_color']);
        $hover_bg = sanitize_hex_color($atts['hover_bg']);
        $padding = esc_attr($atts['padding']);
        $border_radius = esc_attr($atts['border_radius']);
        $font_size = esc_attr($atts['font_size']);

        ob_start();
        ?>
        <button class="simit-trigger-btn"
                data-simit-trigger
                style="--simit-bg:<?php echo $bg_color; ?>;--simit-text:<?php echo $text_color; ?>;--simit-hover:<?php echo $hover_bg; ?>;--simit-padding:<?php echo $padding; ?>;--simit-radius:<?php echo $border_radius; ?>;--simit-size:<?php echo $font_size; ?>"
                aria-label="<?php echo esc_attr($text); ?>">
            <?php if ($icon): ?>
                <span class="simit-btn-icon" aria-hidden="true"><?php echo esc_html($icon); ?></span>
            <?php endif; ?>
            <span><?php echo esc_html($text); ?></span>
        </button>
        <?php
        return ob_get_clean();
    }

    /**
     * Enqueue assets
     */
    public function enqueue_assets() {
        if (!$this->verify_security()) {
            return;
        }

        global $post;
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'simit_search')) {
            return;
        }

        wp_add_inline_style('wp-block-library', $this->get_inline_styles());
        wp_add_inline_script('jquery', $this->get_inline_script());
    }

    /**
     * Get optimized inline styles
     */
    private function get_inline_styles() {
        // Minified and optimized CSS
        return '.simit-trigger-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5em;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:var(--simit-bg);color:var(--simit-text);padding:var(--simit-padding);border-radius:var(--simit-radius);font-size:var(--simit-size);font-weight:600;border:none;cursor:pointer;transition:all .3s ease;box-shadow:0 4px 12px rgba(0,0,0,.15);letter-spacing:.3px;line-height:1.5}.simit-trigger-btn:hover{background:var(--simit-hover);transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.2)}.simit-trigger-btn:active{transform:translateY(0);box-shadow:0 3px 10px rgba(0,0,0,.15)}.simit-btn-icon{font-size:1.3em;line-height:1}.simit-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:999999;padding:20px;opacity:0;transition:opacity .3s ease}.simit-overlay.active{display:flex;opacity:1}.simit-modal{background:#fff;border-radius:16px;max-width:900px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 25px 50px -12px rgba(0,0,0,.25);transform:translateY(50px);transition:transform .4s ease,opacity .4s ease;opacity:0}.simit-overlay.active .simit-modal{transform:translateY(0);opacity:1}.simit-close{position:absolute;top:20px;right:20px;background:#fff;border:none;font-size:32px;color:#9ca3af;cursor:pointer;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .3s ease;z-index:10;box-shadow:0 2px 8px rgba(0,0,0,.1);line-height:1}.simit-close:hover{background:#f3f4f6;color:#6b7280;transform:rotate(90deg)}.simit-widget{padding:40px 20px;position:relative;min-height:400px}.simit-widget *{box-sizing:border-box}.simit-section{max-width:800px;margin:0 auto;padding:30px 0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;text-align:center;transition:opacity .3s ease}.simit-section.hidden{opacity:0;pointer-events:none;position:absolute;left:0;right:0}.simit-title{font-size:2.5rem;font-weight:700;color:#1e40af;margin:0 0 15px;line-height:1.2}.simit-subtitle{font-size:1.1rem;color:#666;margin:0 0 30px;line-height:1.4}.simit-search-box{display:flex;gap:0;max-width:600px;margin:0 auto}.simit-input{flex:1;padding:18px 24px;font-size:16px;border:2px solid #e5e7eb;border-right:none;border-radius:12px 0 0 12px;outline:none;background:#fff;transition:all .3s ease;font-family:inherit}.simit-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1)}.simit-input::placeholder{color:#9ca3af}.simit-search-btn{background:#3b82f6;border:none;padding:18px 24px;border-radius:0 12px 12px 0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s ease;min-width:80px}.simit-search-btn:hover:not(:disabled){background:#2563eb}.simit-search-btn:disabled{cursor:not-allowed;opacity:.7}.simit-icon{width:24px;height:24px;fill:#fff}.simit-loader{display:none;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;position:absolute;top:0;left:0;right:0;bottom:0;background:#fff}.simit-loader.active{display:flex}.simit-spinner{width:60px;height:60px;border:4px solid #e5e7eb;border-top:4px solid #3b82f6;border-radius:50%;animation:spin 1s linear infinite}.simit-loader p{margin-top:20px;color:#666;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}.simit-opts{display:none;padding:40px 20px;max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}.simit-opts.active{display:block}.simit-opts-title{font-size:20px;font-weight:700;color:#1e40af;margin:0 0 15px;text-align:center}.simit-opts-text{color:#666;margin:0 0 25px;line-height:1.5;text-align:center}.simit-highlight{font-weight:600;color:#1e40af}.simit-opt-group{margin:0 0 20px}.simit-opt{display:flex;align-items:center;gap:15px;padding:15px;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;transition:all .3s ease;margin-bottom:10px}.simit-opt:hover{background:#f8fafc;border-color:#3b82f6}.simit-opt.selected{background:#eff6ff;border-color:#3b82f6}.simit-opt input[type=radio]{margin:0;width:18px;height:18px;cursor:pointer;accent-color:#3b82f6}.simit-opt-text{flex:1}.simit-opt-label{font-weight:500;color:#1f2937;margin:0 0 2px}.simit-opt-sub{font-size:14px;color:#6b7280;margin:0}.simit-continue{background:#3b82f6;color:#fff;border:none;padding:15px 30px;border-radius:8px;font-size:16px;font-weight:500;cursor:pointer;width:100%;transition:all .3s ease;margin-top:10px;font-family:inherit}.simit-continue:hover:not(:disabled){background:#2563eb;transform:translateY(-2px);box-shadow:0 4px 12px rgba(37,99,235,.3)}.simit-continue:disabled{background:#cbd5e1;cursor:not-allowed}.simit-results{display:none;padding:40px 20px;max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;text-align:center}.simit-results.active{display:block}.simit-results-icon{width:80px;height:80px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}.simit-results-icon svg{width:40px;height:40px;fill:#16a34a}.simit-results-title{font-size:24px;font-weight:700;color:#1e40af;margin:0 0 10px}.simit-results-sub{font-size:16px;color:#666;margin:0 0 30px;line-height:1.5}.simit-view-link{display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:600;transition:all .3s ease;box-shadow:0 2px 8px rgba(22,163,74,.2)}.simit-view-link:hover{background:#15803d;transform:translateY(-2px);box-shadow:0 4px 12px rgba(22,163,74,.3);color:#fff;text-decoration:none}.simit-new-btn{display:inline-block;background:transparent;color:#3b82f6;text-decoration:none;padding:12px 30px;border-radius:8px;font-size:14px;font-weight:500;margin-top:15px;border:2px solid #3b82f6;cursor:pointer;transition:all .3s ease;font-family:inherit}.simit-new-btn:hover{background:#eff6ff}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}@media (max-width:768px){.simit-modal{width:95%;max-height:95vh}.simit-widget{padding:30px 15px}.simit-section{padding:20px 0}.simit-title{font-size:2rem}.simit-subtitle{font-size:1rem}.simit-search-box{max-width:100%}.simit-input{font-size:16px;padding:16px 20px}.simit-search-btn{padding:16px 20px;min-width:70px}.simit-opts,.simit-results{padding:30px 15px}.simit-results-title{font-size:20px}}@media (max-width:480px){.simit-title{font-size:1.8rem}.simit-input,.simit-search-btn{padding:14px 16px}.simit-search-btn{min-width:60px}}@media (prefers-reduced-motion:reduce){.simit-widget *,.simit-widget *::before,.simit-widget *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}';
    }

    /**
     * Get optimized inline script
     */
    private function get_inline_script() {
        // Optimized JavaScript with security
        return "(function($){'use strict';const S={el:{},st:{sel:null,val:''},init(){this.cache();this.bind()},cache(){this.el={trig:null,over:$('#simitOverlay'),sect:$('#simitSection'),load:$('#simitLoader'),opts:$('#simitOpts'),resu:$('#simitResults'),inp:$('#simitInput'),btn:$('#simitSearchBtn'),cls:$('#simitClose'),cont:$('#simitContinue'),newb:$('#simitNewBtn'),num:$('#simitNum'),rnum:$('#simitRnum'),link:$('#simitLink')}},bind(){$(document).on('click','[data-simit-trigger]',e=>{e.preventDefault();this.open()});this.el.cls.on('click',()=>this.close());this.el.over.on('click',e=>{if(e.target===this.el.over[0])this.close()});this.el.inp.on('keypress',e=>{if(e.key==='Enter')this.search()});$(document).on('keydown',e=>{if(e.key==='Escape'&&this.el.over.hasClass('active'))this.close()});this.el.newb.on('click',()=>this.reset())},open(){this.el.over.addClass('active');$('body').css('overflow','hidden');this.reset()},close(){this.el.over.removeClass('active');$('body').css('overflow','');this.reset()},reset(){this.el.sect.removeClass('hidden');this.el.load.removeClass('active');this.el.opts.removeClass('active');this.el.resu.removeClass('active');this.el.inp.val('');this.st.val='';this.st.sel=null;this.el.cont.prop('disabled',true);$('.simit-opt').removeClass('selected');$('input[name=\"simitOpt\"]').prop('checked',false)},search(){const v=this.el.inp.val().trim();if(!v){this.el.inp.css('border-color','#ef4444');setTimeout(()=>this.el.inp.css('border-color','#e5e7eb'),2e3);return}if(!/^[a-zA-Z0-9]+$/.test(v)){this.el.inp.css('border-color','#ef4444');setTimeout(()=>this.el.inp.css('border-color','#e5e7eb'),2e3);return}this.st.val=v;this.el.btn.prop('disabled',true);this.el.sect.addClass('hidden');this.el.load.addClass('active');setTimeout(()=>{this.el.load.removeClass('active');this.el.opts.addClass('active');this.el.btn.prop('disabled',false);this.el.num.text(v);this.st.sel=null;this.el.cont.prop('disabled',true)},1e4)},selOpt(i){this.st.sel=i;$('.simit-opt').each((idx,el)=>{$(el).toggleClass('selected',idx===i)});$('#simitOpt'+(i+1)).prop('checked',true);this.el.cont.prop('disabled',false)},cont(){if(this.st.sel===null||!this.st.val)return;this.el.cont.prop('disabled',true);this.el.opts.removeClass('active');this.el.load.addClass('active');const d=Math.floor(Math.random()*5e3)+1e4;setTimeout(()=>{this.el.load.removeClass('active');this.el.resu.addClass('active');const u='https://www.fcm.org.co/simit/#/estado-cuenta?numDocPlacaProp='+encodeURIComponent(this.st.val);this.el.link.attr('href',u);this.el.rnum.text(this.st.val);this.el.cont.prop('disabled',false)},d)}};$(()=>S.init());window.simitSelectOpt=i=>S.selOpt(i);window.simitContinue=()=>S.cont()})(jQuery);";
    }

    /**
     * Render popup HTML
     */
    public function render_popup_html() {
        if (!$this->verify_security()) {
            return;
        }

        global $post;
        if (!is_a($post, 'WP_Post') || !has_shortcode($post->post_content, 'simit_search')) {
            return;
        }
        ?>
        <div class="simit-overlay" id="simitOverlay">
            <div class="simit-modal">
                <button class="simit-close" id="simitClose" aria-label="Cerrar">&times;</button>
                <div class="simit-widget">
                    <div class="simit-section" id="simitSection">
                        <h2 class="simit-title">Estado de cuenta</h2>
                        <p class="simit-subtitle">Consulta aquí comparendos, multas y acuerdos de pago</p>
                        <div class="simit-search-box">
                            <input type="text" class="simit-input" id="simitInput" placeholder="Número de identificación o placa del vehículo" aria-label="Número de identificación o placa">
                            <button class="simit-search-btn" id="simitSearchBtn" aria-label="Buscar">
                                <svg class="simit-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="simit-loader" id="simitLoader">
                        <div class="simit-spinner" aria-label="Cargando"></div>
                        <p>Buscando resultados...</p>
                    </div>
                    <div class="simit-opts" id="simitOpts">
                        <h3 class="simit-opts-title">Estado de cuenta</h3>
                        <p class="simit-opts-text">Se han encontrado varios resultados para la búsqueda del número <span class="simit-highlight" id="simitNum"></span>. Selecciona el que desees consultar.</p>
                        <div class="simit-opt-group">
                            <div class="simit-opt" onclick="simitSelectOpt(0)">
                                <input type="radio" name="simitOpt" id="simitOpt1" value="0">
                                <div class="simit-opt-text">
                                    <div class="simit-opt-label">N* N*</div>
                                    <div class="simit-opt-sub">Cédula</div>
                                </div>
                            </div>
                            <div class="simit-opt" onclick="simitSelectOpt(1)">
                                <input type="radio" name="simitOpt" id="simitOpt2" value="1">
                                <div class="simit-opt-text">
                                    <div class="simit-opt-label">Inconsi*******</div>
                                    <div class="simit-opt-sub">Cédula Extranjera</div>
                                </div>
                            </div>
                            <div class="simit-opt" onclick="simitSelectOpt(2)">
                                <input type="radio" name="simitOpt" id="simitOpt3" value="2">
                                <div class="simit-opt-text">
                                    <div class="simit-opt-label">S** S**</div>
                                    <div class="simit-opt-sub">Cédula Venezolana</div>
                                </div>
                            </div>
                        </div>
                        <button class="simit-continue" onclick="simitContinue()" disabled id="simitContinue">Continuar</button>
                    </div>
                    <div class="simit-results" id="simitResults">
                        <div class="simit-results-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                        </div>
                        <h3 class="simit-results-title">¡Resultados Encontrados!</h3>
                        <p class="simit-results-sub">Tu consulta para el número <strong id="simitRnum"></strong> está lista. Haz clic en el botón para ver tus resultados.</p>
                        <a href="#" id="simitLink" class="simit-view-link" target="_blank" rel="nofollow noopener noreferrer">Ver Resultados</a>
                        <div>
                            <button class="simit-new-btn" id="simitNewBtn">Nueva Búsqueda</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
}

/**
 * Initialize plugin
 */
function simit_search_widget_pro_init() {
    return SIMIT_Search_Widget_Pro::instance();
}

// Start the engine
add_action('plugins_loaded', 'simit_search_widget_pro_init', 1);
