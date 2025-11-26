# SIMIT Search Widget - WordPress Plugin

A professional WordPress plugin for searching SIMIT account status (comparendos, multas y acuerdos de pago).

## Description

This plugin provides a clean, user-friendly search widget for consulting SIMIT records by identification number or vehicle plate. The widget features a modern design, loading states, option selection, and seamless integration with the official SIMIT website.

## Features

- 🔍 Search by identification number or vehicle plate
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Fast and lightweight
- ♿ Accessibility compliant (ARIA labels, keyboard navigation)
- 🎨 Modern, professional UI
- 🔒 Secure implementation
- 🌐 SEO-friendly (no conflicting headers)
- 🎯 Easy integration via shortcode

## Installation

### Method 1: Upload via WordPress Admin

1. Download the plugin folder `simit-search-widget`
2. Compress it into a ZIP file
3. Go to WordPress Admin → Plugins → Add New
4. Click "Upload Plugin"
5. Choose the ZIP file and click "Install Now"
6. Activate the plugin

### Method 2: Manual Installation

1. Upload the `simit-search-widget` folder to `/wp-content/plugins/`
2. Go to WordPress Admin → Plugins
3. Activate "SIMIT Search Widget"

## Usage

### Basic Shortcode

Add the following shortcode to any page or post:

```
[simit_search]
```

### Shortcode with Custom Attributes

Customize the title and subtitle:

```
[simit_search title="Consulta SIMIT" subtitle="Busca tus comparendos aquí"]
```

### Available Attributes

- `title` - Main heading text (default: "Estado de cuenta")
- `subtitle` - Subtitle text (default: "Consulta aquí comparendos, multas y acuerdos de pago")

### Example Usage

**In Page/Post Editor:**
```
[simit_search]
```

**In PHP Template:**
```php
<?php echo do_shortcode('[simit_search]'); ?>
```

**In Widget (Classic Widgets):**
Add a "Text" or "HTML" widget and paste the shortcode.

**In Block Editor:**
Add a "Shortcode" block and paste `[simit_search]`

## How It Works

1. User enters an identification number or vehicle plate
2. Widget displays a loading state (10 seconds simulation)
3. User selects from available options
4. Another loading state (10-15 seconds random)
5. Results link is generated to official SIMIT website
6. User can view results or start a new search

## Technical Details

### File Structure

```
simit-search-widget/
├── assets/
│   ├── css/
│   │   └── simit-widget.css
│   └── js/
│       └── simit-widget.js
├── simit-search-widget.php
└── README.md
```

### Requirements

- WordPress 5.0 or higher
- PHP 7.0 or higher
- Modern web browser with JavaScript enabled

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### CSS Customization

To override styles, add custom CSS in your theme:

```css
/* Example: Change primary color */
.simit-search-button {
    background: #your-color !important;
}
```

### Hooks (For Developers)

The plugin is built with WordPress best practices and can be extended via filters and actions (future versions may include more hooks).

## Security

- All user inputs are sanitized and validated
- Uses WordPress nonces for form security
- Escapes all output
- No inline JavaScript (all external files)
- Follows WordPress Coding Standards

## Performance

- Assets only load when shortcode is present (conditional loading)
- Minified CSS and JS (recommended for production)
- No external dependencies
- Lightweight (~15KB total)

## Troubleshooting

### Widget not displaying?

1. Check if the shortcode is correctly spelled: `[simit_search]`
2. Clear your browser cache
3. Clear WordPress cache (if using a caching plugin)

### Styling conflicts?

1. Check for CSS conflicts with your theme
2. Try adding `!important` to custom CSS rules
3. Ensure no JavaScript errors in browser console

### Modal not opening?

1. Check browser console for JavaScript errors
2. Ensure jQuery is loaded (plugin doesn't require it, but check for conflicts)
3. Disable other plugins temporarily to identify conflicts

## Changelog

### Version 1.0.0
- Initial release
- Search functionality
- Modal with loading states
- Option selection
- Results display
- Responsive design
- Accessibility features

## Support

For support, feature requests, or bug reports, please contact the developer.

## License

GPL v2 or later

## Credits

Developed for professional integration with the SIMIT platform (www.fcm.org.co/simit).
