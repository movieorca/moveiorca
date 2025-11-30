# SIMIT Search Widget - Usage Examples

## Basic Usage

### Simple Shortcode
The most basic way to use the widget:

```
[simit_search]
```

**Result:** Displays the widget with default title and subtitle.

---

## Custom Titles

### Example 1: Custom Title Only
```
[simit_search title="Consulta de Comparendos"]
```

### Example 2: Custom Title and Subtitle
```
[simit_search title="Consulta SIMIT" subtitle="Ingresa tu número de cédula o placa del vehículo"]
```

### Example 3: Shorter Version
```
[simit_search title="Estado de Cuenta SIMIT" subtitle="Búsqueda rápida y segura"]
```

---

## Integration Examples

### In a WordPress Page

**Step 1:** Create or edit a page
**Step 2:** Add the shortcode:

```
<h1>Bienvenido a Nuestro Portal</h1>
<p>Aquí puedes consultar el estado de tus comparendos.</p>

[simit_search]

<p>Si tienes preguntas, contáctanos.</p>
```

---

### In a Widget Area

**Classic Widgets:**
1. Go to `Appearance` → `Widgets`
2. Add a "Text" or "HTML" widget
3. Paste the shortcode:

```
[simit_search]
```

---

### In PHP Templates

If you're a developer and want to add it directly to your theme:

```php
<?php
// In any template file (page.php, front-page.php, etc.)
echo do_shortcode('[simit_search]');
?>
```

**With custom attributes:**
```php
<?php
echo do_shortcode('[simit_search title="Mi Título" subtitle="Mi Subtítulo"]');
?>
```

---

### In Elementor

**Step 1:** Edit a page with Elementor
**Step 2:** Add a "Shortcode" widget
**Step 3:** Enter the shortcode:

```
[simit_search]
```

**Optional:** Wrap it in a section for better styling:
1. Create a new section
2. Set section background color
3. Add padding
4. Insert the Shortcode widget

---

### In Divi Builder

**Step 1:** Edit a page with Divi
**Step 2:** Add a "Code" module
**Step 3:** Paste the shortcode in the "Code" field:

```
[simit_search]
```

---

### In WPBakery Page Builder

**Step 1:** Edit a page
**Step 2:** Click "Add Element"
**Step 3:** Select "Raw JS"
**Step 4:** Add the shortcode:

```
[simit_search]
```

---

## Advanced Usage

### Multiple Widgets on Same Page

You can add multiple widgets with different titles:

```
[simit_search title="Consulta por Cédula" subtitle="Ingresa tu número de identificación"]

<!-- Some content here -->

[simit_search title="Consulta por Placa" subtitle="Ingresa la placa de tu vehículo"]
```

**Note:** Each widget works independently.

---

### In Custom Post Types

The shortcode works in any post type:

- Pages ✅
- Posts ✅
- Custom Post Types ✅
- WooCommerce Products ✅

---

### With HTML Wrapper

Wrap the widget in a custom div for styling:

```html
<div class="my-custom-wrapper" style="background: #f5f5f5; padding: 30px; border-radius: 10px;">
    [simit_search title="Consulta Aquí"]
</div>
```

---

## Styling Examples

### Add Custom CSS

Go to `Appearance` → `Customize` → `Additional CSS` and add:

```css
/* Change the search button color */
.simit-search-button {
    background: #e74c3c !important;
}

.simit-search-button:hover {
    background: #c0392b !important;
}

/* Change title color */
.simit-page-title {
    color: #27ae60 !important;
}

/* Make the widget wider */
.simit-search-section {
    max-width: 900px;
}

/* Add shadow to the search input */
.simit-search-container {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

---

## Real-World Examples

### Example 1: Government Website
```
[simit_search title="Consulta de Infracciones" subtitle="Sistema Integrado de Multas e Infracciones de Tránsito"]
```

### Example 2: Legal Services Site
```
[simit_search title="Revisa tus Comparendos" subtitle="Servicio gratuito de consulta - Resultados inmediatos"]
```

### Example 3: Transportation Portal
```
[simit_search title="Estado de Cuenta SIMIT" subtitle="Consulta comparendos, multas y acuerdos de pago para tu vehículo"]
```

---

## Testing the Widget

### Test Data

Use these for testing (they won't return real data, just show the flow):

- ID Number: `12345678`
- Vehicle Plate: `ABC123`
- Any alphanumeric: `TEST001`

### Expected Behavior

1. **Initial State:** User sees search input and button
2. **After Search:** Modal opens with loading spinner (10 seconds)
3. **Options Display:** Three options appear for selection
4. **After Selection:** Click "Continuar" → loading again (10-15 seconds)
5. **Results:** Link to official SIMIT website appears
6. **New Search:** User can start over

---

## Tips & Best Practices

### ✅ DO:
- Use descriptive titles relevant to your audience
- Test the widget after adding it to a page
- Clear cache after installation or updates
- Use on pages with good SEO structure

### ❌ DON'T:
- Don't add multiple widgets on the same page unless needed
- Don't modify plugin files directly (use custom CSS instead)
- Don't forget to test on mobile devices
- Don't use special characters in title/subtitle

---

## Shortcode Reference

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `title` | string | "Estado de cuenta" | Main heading text |
| `subtitle` | string | "Consulta aquí..." | Subtitle text |

---

## Need Help?

- Check `README.md` for general information
- Check `INSTALLATION.md` for setup issues
- Contact your developer for custom modifications

---

**Happy Searching!** 🔍
