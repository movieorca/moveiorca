# SIMIT Search Widget - Installation Guide

## Quick Start Installation

### Step 1: Upload the Plugin

**Option A: Via WordPress Dashboard**
1. Compress the `simit-search-widget` folder into a ZIP file
2. Login to your WordPress Admin Dashboard
3. Navigate to `Plugins` → `Add New`
4. Click the `Upload Plugin` button at the top
5. Click `Choose File` and select your ZIP file
6. Click `Install Now`
7. Click `Activate Plugin`

**Option B: Via FTP/File Manager**
1. Upload the entire `simit-search-widget` folder to `/wp-content/plugins/`
2. Login to your WordPress Admin Dashboard
3. Navigate to `Plugins` → `Installed Plugins`
4. Find "SIMIT Search Widget" in the list
5. Click `Activate`

### Step 2: Add the Widget to Your Site

**Using the Block Editor (Gutenberg):**
1. Edit any page or post
2. Click the `+` button to add a new block
3. Search for "Shortcode"
4. Add the Shortcode block
5. Type: `[simit_search]`
6. Update/Publish the page

**Using the Classic Editor:**
1. Edit any page or post
2. In the content area, type: `[simit_search]`
3. Update/Publish the page

**Using Elementor:**
1. Edit a page with Elementor
2. Drag a "Shortcode" widget to your page
3. In the shortcode field, enter: `[simit_search]`
4. Update the page

**Using Page Builders (Divi, Beaver Builder, etc.):**
1. Add a "Shortcode" or "Text" module
2. Enter: `[simit_search]`
3. Save and publish

### Step 3: Customize (Optional)

Change the title and subtitle:
```
[simit_search title="Tu Título Aquí" subtitle="Tu subtítulo aquí"]
```

## File Structure

After installation, your plugin folder should look like this:

```
wp-content/plugins/simit-search-widget/
├── assets/
│   ├── css/
│   │   ├── simit-widget.css
│   │   └── index.php
│   ├── js/
│   │   ├── simit-widget.js
│   │   └── index.php
│   └── index.php
├── simit-search-widget.php (main plugin file)
├── index.php
├── README.md
└── INSTALLATION.md
```

## Verification

To verify the plugin is working:

1. Go to a page where you added the shortcode
2. You should see the SIMIT search widget
3. Try entering a test number (e.g., "12345678")
4. The modal should open with a loading animation

## Common Issues

### Widget Not Showing?

**Check 1:** Verify the shortcode is correct
- Correct: `[simit_search]`
- Wrong: `[simit-search]` or `[simit_widget]`

**Check 2:** Clear cache
- Clear your browser cache (Ctrl+F5 or Cmd+Shift+R)
- If using a caching plugin (WP Rocket, W3 Total Cache, etc.), clear the cache

**Check 3:** Check plugin activation
- Go to `Plugins` → `Installed Plugins`
- Ensure "SIMIT Search Widget" shows "Deactivate" (meaning it's active)

### Styling Looks Broken?

**Issue:** Theme CSS conflicts

**Solution 1:** Clear cache and refresh
**Solution 2:** Add this to your theme's custom CSS:
```css
.simit-search-widget {
    clear: both;
    margin: 20px 0;
}
```

### Modal Not Opening?

**Check 1:** JavaScript errors
- Open browser console (F12)
- Look for red error messages
- If you see errors, they might be from plugin conflicts

**Check 2:** Plugin conflicts
- Temporarily deactivate other plugins
- Test if the widget works
- Reactivate plugins one by one to find the conflict

## Requirements

✅ WordPress 5.0 or higher
✅ PHP 7.0 or higher
✅ Modern web browser with JavaScript enabled
✅ No special server requirements

## Next Steps

After installation:
1. Test the widget with a sample search
2. Customize the title/subtitle if needed
3. Style it to match your site design (optional)
4. Add it to multiple pages as needed

## Support

If you encounter issues:
1. Check this installation guide
2. Review the README.md file
3. Verify WordPress and PHP requirements
4. Contact your developer for assistance

## Updates

When updating the plugin:
1. Backup your site (recommended)
2. Upload the new version
3. Overwrite existing files
4. Clear all caches
5. Test functionality

---

**Plugin Ready!** 🚀

Your SIMIT Search Widget is now installed and ready to use. Add `[simit_search]` to any page or post to display the search widget.
