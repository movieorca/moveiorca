# E-Commerce Store - Complete Setup Guide

A fully functional multi-product e-commerce store built with HTML, CSS, JavaScript, and Google Apps Script backend with Google Sheets as database.

## Features

✅ **Unlimited Products** - Dynamically loaded from Google Sheets
✅ **User Authentication** - Signup, Login with password hashing
✅ **Shopping Cart** - Add, update, remove items with localStorage
✅ **Cash on Delivery (COD)** - No payment gateway required
✅ **Order Management** - Complete order tracking system
✅ **User Dashboard** - View order history and status
✅ **Admin Control** - Manage products and orders via Google Sheets
✅ **Email Notifications** - Automatic order emails to admin and customer
✅ **Mobile Responsive** - Modern, clean UI that works on all devices
✅ **Real-time Updates** - Product stock, order status updates

---

## Project Structure

```
├── index.html              # Main product listing page
├── cart.html               # Shopping cart page
├── checkout.html           # Checkout with COD
├── login.html              # User login page
├── signup.html             # User registration page
├── dashboard.html          # User order dashboard
├── app.js                  # Frontend JavaScript logic
├── styles.css              # Responsive CSS styling
├── Code.gs                 # Google Apps Script backend
├── README.md               # This file
└── GOOGLE_SHEETS_SETUP.md  # Detailed sheet setup guide
```

---

## Complete Deployment Guide

### Part 1: Setup Google Sheets Database

#### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **+ Blank** to create new spreadsheet
3. Name it: `E-Commerce Store Database`

#### Step 2: Create Three Sheets

Create these three separate tabs/sheets:

**Sheet 1: Products**
- Click the **+** button at bottom to add sheet
- Rename to exactly: `Products`
- Add these headers in Row 1:
  ```
  product_id | image_url | name | description | price | offer_price | stock_quantity | status | created_at
  ```

**Sheet 2: Users**
- Add another sheet
- Rename to exactly: `Users`
- Add these headers in Row 1:
  ```
  user_id | full_name | email | phone | password_hash | created_at
  ```

**Sheet 3: Orders**
- Add another sheet
- Rename to exactly: `Orders`
- Add these headers in Row 1:
  ```
  order_id | user_id | email | phone | city | address | items_json | total_amount | payment_method | status | created_at
  ```

#### Step 3: Add Sample Products

In the **Products** sheet, add some sample products (Row 2 onwards):

| product_id | image_url | name | description | price | offer_price | stock_quantity | status | created_at |
|-----------|-----------|------|-------------|-------|-------------|----------------|--------|------------|
| PROD_001 | https://via.placeholder.com/300 | Wireless Headphones | Premium noise-cancelling headphones | 2999 | 1999 | 50 | ACTIVE | 2024-01-15 |
| PROD_002 | https://via.placeholder.com/300 | Smart Watch | Fitness tracker with heart rate monitor | 4999 | 3499 | 30 | ACTIVE | 2024-01-15 |
| PROD_003 | https://via.placeholder.com/300 | Bluetooth Speaker | Portable waterproof speaker | 1499 | 999 | 100 | ACTIVE | 2024-01-15 |

> **Note:** For detailed sheet setup instructions, see [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)

#### Step 4: Get Your Spreadsheet ID

1. Look at your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
2. Copy the `SPREADSHEET_ID_HERE` part
3. Save it - you'll need it in Step 6

---

### Part 2: Deploy Google Apps Script Backend

#### Step 5: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor

#### Step 6: Add Backend Code

1. Copy the entire contents of `Code.gs` file
2. Paste it into the Apps Script editor
3. **IMPORTANT:** Update these two values at the top:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Paste your Spreadsheet ID
const ADMIN_EMAIL = 'your-admin@email.com';        // Your email for order notifications
```

#### Step 7: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Fill in the deployment settings:
   - **Description:** `E-Commerce API`
   - **Execute as:** `Me (your email)`
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. Click **Authorize access**
6. Choose your Google account
7. Click **Advanced** → **Go to [Project Name] (unsafe)**
8. Click **Allow**
9. **COPY THE WEB APP URL** - it looks like:
   ```
   https://script.google.com/macros/s/ABC123.../exec
   ```
10. Save this URL - you'll need it in Part 3

> **Important:** Every time you update Code.gs, you must create a **New deployment** (not manage deployments) to see changes.

---

### Part 3: Configure Frontend

#### Step 8: Update API URL

1. Open `app.js` in a text editor
2. Find this line near the top:
   ```javascript
   const CONFIG = {
     API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
   };
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with your Web App URL from Step 7
4. Save the file

**Example:**
```javascript
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/ABC123xyz.../exec',
};
```

---

### Part 4: Host Your Website

You can host the frontend files on any of these platforms:

#### Option A: GitHub Pages (Recommended - Free)

1. Create a GitHub account if you don't have one
2. Create a new repository named `ecommerce-store`
3. Upload all HTML, CSS, and JS files:
   - index.html
   - cart.html
   - checkout.html
   - login.html
   - signup.html
   - dashboard.html
   - app.js
   - styles.css
4. Go to **Settings** → **Pages**
5. Under **Source**, select `main` branch
6. Click **Save**
7. Your site will be live at: `https://yourusername.github.io/ecommerce-store/`

#### Option B: Netlify (Free)

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up for free account
3. Drag and drop your folder containing all files
4. Your site will be live with a URL like: `https://your-site.netlify.app/`

#### Option C: Vercel (Free)

1. Go to [Vercel](https://vercel.com/)
2. Sign up for free account
3. Click **New Project**
4. Import your project or drag files
5. Deploy

#### Option D: Google Sites (No Custom HTML Support)

**Note:** Google Sites doesn't support custom HTML/CSS/JS, so use GitHub Pages or Netlify instead.

---

## Testing Your Store

### Step 1: Test Product Loading

1. Open your hosted website URL
2. You should see the products from your Google Sheet
3. If not showing:
   - Check browser console (F12) for errors
   - Verify API_URL in app.js is correct
   - Check SPREADSHEET_ID in Code.gs is correct

### Step 2: Test User Registration

1. Click **Login** → **Create Account**
2. Fill in the signup form
3. Submit
4. Check the **Users** sheet - you should see your new user

### Step 3: Test Shopping Cart

1. Click **Add to Cart** on a product
2. Go to **Cart** page
3. Update quantity
4. Verify total amount

### Step 4: Test Checkout (Login Required)

1. Make sure you're logged in
2. Go to Cart → **Proceed to Checkout**
3. Fill delivery information
4. Click **Place Order**
5. Check:
   - **Orders** sheet should have your order
   - You should receive confirmation email
   - Admin should receive order notification

### Step 5: Test Order Dashboard

1. Click **Dashboard** from navigation
2. You should see your order with status "Pending"

### Step 6: Test Order Status Update (Admin)

1. Open your Google Sheet
2. Go to **Orders** sheet
3. Change status from `Pending` to `Processing`
4. Refresh the Dashboard page
5. Status should update

---

## Admin Guide

### Managing Products

**Add New Product:**
1. Open Google Sheets → Products tab
2. Add new row with product details
3. Set status = `ACTIVE`
4. Product appears immediately on website

**Update Product:**
- Just edit the cells directly in Google Sheets
- Changes reflect in real-time

**Remove Product from Website:**
- Change status to `HIDDEN` (product stays in database but hidden from site)

**Mark Out of Stock:**
- Set stock_quantity = `0`

### Managing Orders

**View Orders:**
- All orders appear in the Orders sheet
- You'll receive email for each new order

**Update Order Status:**
1. Find the order in Orders sheet
2. Change status column to one of:
   - `Pending` - Order received
   - `Processing` - Preparing order
   - `Out For Delivery` - Shipped
   - `Delivered` - Completed
   - `Cancelled` - Cancelled
3. Customer sees updated status in their dashboard

---

## Customization

### Change Store Name

Edit in all HTML files:
```html
<a href="index.html" class="logo">ShopNow</a>
```
Change `ShopNow` to your store name.

### Change Colors

Edit `styles.css`:
```css
:root {
  --primary-color: #2563eb;  /* Main brand color */
  --secondary-color: #10b981; /* Success/accent color */
}
```

### Change Currency

1. Edit `app.js` - Replace all `₹` with your currency symbol
2. Edit `Code.gs` - Replace all `₹` in email templates

### Add More Product Fields

1. Add new column in Products sheet
2. Update `getProducts()` function in Code.gs
3. Update `createProductCard()` in app.js
4. Update styles.css if needed

---

## Troubleshooting

### Products Not Showing

**Check:**
- [ ] SPREADSHEET_ID in Code.gs is correct
- [ ] Sheet name is exactly `Products` (case-sensitive)
- [ ] Column headers match exactly
- [ ] Products have status = `ACTIVE`
- [ ] API_URL in app.js is correct
- [ ] Web App deployed with access = "Anyone"

**Solution:**
1. Open browser console (F12)
2. Look for error messages
3. Check Network tab for API calls

### Login/Signup Not Working

**Check:**
- [ ] Sheet name is exactly `Users`
- [ ] API_URL is correct
- [ ] Apps Script has permissions
- [ ] No browser console errors

### Orders Not Saving

**Check:**
- [ ] User is logged in
- [ ] Sheet name is exactly `Orders`
- [ ] ADMIN_EMAIL is set correctly
- [ ] Email sending permissions granted

### CORS Errors

- Make sure Web App is deployed with access = "Anyone"
- Redeploy as new deployment if you made changes

### Email Not Sending

- Check Apps Script permissions
- Verify ADMIN_EMAIL is correct
- Check Gmail spam folder

---

## Security Notes

### Current Implementation

The current password hashing in Code.gs is **basic** and suitable for demo/learning purposes:

```javascript
function hashPassword(password) {
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return hash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
```

### For Production Use

1. **Use Stronger Hashing:**
   - Implement bcrypt or similar
   - Add salt to passwords

2. **Add HTTPS:**
   - Use HTTPS for your frontend hosting
   - GitHub Pages provides this automatically

3. **Add JWT Tokens:**
   - Replace simple token with proper JWT
   - Add token expiration

4. **Input Validation:**
   - Add server-side validation in Code.gs
   - Sanitize all inputs

5. **Rate Limiting:**
   - Add request limits to prevent abuse

---

## Features Explanation

### Product System
- Products loaded dynamically from Google Sheets
- Stock management (0 = out of stock)
- Product status (ACTIVE/HIDDEN)
- Discount pricing (offer_price)
- Real-time updates

### User System
- Signup with password hashing
- Login with token authentication
- User session management
- Persistent login (localStorage)

### Shopping Cart
- Add/remove items
- Update quantities
- Stock validation
- Persistent cart (localStorage)
- Real-time total calculation

### Checkout
- COD only (no payment gateway)
- Delivery information collection
- Order validation
- Email confirmations

### Order Tracking
- Order history
- Real-time status updates
- Order details view
- Multiple status levels

### Admin Control
- Manage products via Google Sheets
- Update order status
- View all orders
- Email notifications

---

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

---

## Performance

- Lightweight (no external frameworks)
- Fast loading
- Minimal API calls
- localStorage caching
- Mobile optimized

---

## License

Free to use for personal and commercial projects.

---

## Support

If you encounter issues:

1. Check [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for sheet setup
2. Verify all configuration steps
3. Check browser console for errors
4. Ensure Apps Script permissions are granted

---

## Credits

Built with:
- HTML5
- CSS3
- Vanilla JavaScript
- Google Apps Script
- Google Sheets

---

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test all features
3. ✅ Add your real products
4. ✅ Customize branding and colors
5. ✅ Share your store URL with customers!

---

**Happy Selling! 🚀**
