# Simple Single-Page E-Commerce Store

**Everything on ONE page. No loaders. Super simple. Super powerful.**

## ✨ What You Get

- 🎯 **Single HTML file** - Everything in `store.html`
- ⚡ **No loading screens** - Instant, smooth experience
- 📱 **Mobile responsive** - Works perfectly on all devices
- 🛒 **Full shopping cart** - Add, update, remove items
- 👤 **User accounts** - Signup, login, order tracking
- 💰 **Cash on Delivery** - No payment gateway needed
- 📦 **Unlimited products** - Managed via Google Sheets
- 📧 **Email notifications** - Auto emails for orders
- ⚙️ **Admin control** - Update everything in Google Sheets

## 🚀 Quick Setup (3 Steps)

### Step 1: Setup Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet: **E-Commerce Store**
3. Create 3 sheets with these exact names and columns:

**Products Sheet:**
```
product_id | image_url | name | description | price | offer_price | stock_quantity | status | created_at
```

**Users Sheet:**
```
user_id | full_name | email | phone | password_hash | created_at
```

**Orders Sheet:**
```
order_id | user_id | email | phone | city | address | items_json | total_amount | payment_method | status | created_at
```

4. Add sample products in Products sheet:

| product_id | image_url | name | description | price | offer_price | stock_quantity | status | created_at |
|-----------|-----------|------|-------------|-------|-------------|----------------|--------|------------|
| PROD_001 | https://via.placeholder.com/300 | Wireless Headphones | Premium noise-cancelling | 2999 | 1999 | 50 | ACTIVE | 2024-01-15 |
| PROD_002 | https://via.placeholder.com/300 | Smart Watch | Fitness tracker | 4999 | 3499 | 30 | ACTIVE | 2024-01-15 |

5. Copy your **Spreadsheet ID** from URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

### Step 2: Deploy Backend

1. In Google Sheet: **Extensions** → **Apps Script**
2. Delete existing code
3. Copy entire `Code.gs` file content and paste
4. Update these 2 lines at top:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   const ADMIN_EMAIL = 'your-admin@email.com';
   ```
5. Click **Deploy** → **New deployment**
6. Select **Web app**
7. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy** → **Authorize** → **Allow**
9. Copy the **Web App URL**

### Step 3: Deploy Store

1. Open `store.html` in text editor
2. Find this line (around line 630):
   ```javascript
   const CONFIG = {
     API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
   };
   ```
3. Replace with your Web App URL:
   ```javascript
   const CONFIG = {
     API_URL: 'https://script.google.com/macros/s/ABC123.../exec'
   };
   ```
4. Save the file

5. **Host it** - Choose one:

   **Option A: GitHub Pages (Free)**
   - Create GitHub repo
   - Upload `store.html`
   - Settings → Pages → Enable
   - Done! URL: `https://yourusername.github.io/repo/store.html`

   **Option B: Netlify (Free)**
   - Go to [Netlify](https://netlify.com)
   - Drag & drop `store.html`
   - Done! Instant URL

   **Option C: Vercel (Free)**
   - Go to [Vercel](https://vercel.com)
   - Upload `store.html`
   - Done!

**That's it! Your store is live! 🎉**

---

## 🎯 How It Works

### For Customers:

1. **Browse Products** - All products on main page
2. **Add to Cart** - Click "Add to Cart" button
3. **View Cart** - Click "Cart" button (badge shows item count)
4. **Login/Signup** - Click "Login" to create account
5. **Checkout** - Click "Checkout" in cart
6. **Place Order** - Fill delivery details, place COD order
7. **Track Order** - Click "Orders" to see order status

### For Admin (You):

1. **Add Products** - Add row in Products sheet (set status = ACTIVE)
2. **Update Prices** - Edit price/offer_price in sheet
3. **Manage Stock** - Set stock_quantity (0 = out of stock)
4. **Hide Product** - Change status to HIDDEN
5. **Process Orders** - Update status in Orders sheet:
   - Pending → Processing → Out For Delivery → Delivered
6. **Get Notified** - Auto email when new order comes

---

## 📦 Features

### Products
- ✅ Dynamic loading from Google Sheets
- ✅ Product images
- ✅ Original price + discounted price
- ✅ Discount percentage badge
- ✅ Stock management
- ✅ Out of stock handling
- ✅ ACTIVE/HIDDEN status

### Cart
- ✅ Add to cart
- ✅ Update quantity (+/-)
- ✅ Remove items
- ✅ Real-time total
- ✅ Saved in browser (persists)
- ✅ Stock validation

### User Account
- ✅ Signup with email/password
- ✅ Login authentication
- ✅ Password hashing (SHA-256)
- ✅ Session persistence
- ✅ User profile info
- ✅ Logout

### Checkout
- ✅ Pre-filled user details
- ✅ Delivery address form
- ✅ Cash on Delivery only
- ✅ Order confirmation
- ✅ Email to customer
- ✅ Email to admin

### Order Tracking
- ✅ View all orders
- ✅ Order details (items, total, address)
- ✅ Real-time status updates
- ✅ Order history
- ✅ Status badges with colors

### UI/UX
- ✅ Single page (no page loads)
- ✅ Modal popups (cart, login, checkout)
- ✅ Smooth animations
- ✅ Toast notifications
- ✅ Mobile responsive
- ✅ Clean modern design
- ✅ No loaders needed

---

## 🎨 Customization

### Change Store Name
Line 42 in `store.html`:
```html
<div class="logo">ShopNow</div>
```
Change `ShopNow` to your name.

### Change Colors
Lines 10-20 in `store.html`:
```css
:root {
  --primary: #2563eb;     /* Main blue */
  --success: #10b981;     /* Green */
  --danger: #ef4444;      /* Red */
}
```

### Change Currency
Search and replace `₹` with `$` or your currency symbol.

---

## 🔧 Troubleshooting

**Products not showing?**
- Check SPREADSHEET_ID in Code.gs
- Verify sheet name is exactly "Products"
- Check products have status = ACTIVE
- Check API_URL in store.html

**Can't login?**
- Check sheet name is exactly "Users"
- Clear browser cache
- Check browser console for errors

**Orders not saving?**
- Login first before checkout
- Check sheet name is exactly "Orders"
- Verify ADMIN_EMAIL in Code.gs

**CORS errors?**
- Redeploy Apps Script as NEW deployment
- Make sure access = "Anyone"

---

## 📊 File Structure

```
store.html          ← Single file with everything
Code.gs             ← Backend (Google Apps Script)
GOOGLE_SHEETS_SETUP.md  ← Detailed sheet guide
```

**That's all you need!**

---

## 🎯 What Makes This Simple?

1. **One HTML File** - No multiple pages, no confusion
2. **No Build Tools** - No npm, webpack, or compilers
3. **No Framework** - Pure HTML/CSS/JS (but modern)
4. **No Database** - Google Sheets is your database
5. **No Payment Gateway** - COD only
6. **No Loading Screens** - Everything instant
7. **Copy & Paste** - Just upload and go

---

## ✨ What Makes This Powerful?

1. **Full E-Commerce** - Complete shopping experience
2. **User Accounts** - Real authentication system
3. **Order Management** - Full order tracking
4. **Email Notifications** - Automated emails
5. **Admin Control** - Easy management via sheets
6. **Mobile Ready** - Works on all devices
7. **Production Ready** - Real business use

---

## 🚀 Go Live Checklist

- [ ] Create Google Sheet with 3 tabs
- [ ] Add sample products
- [ ] Copy Spreadsheet ID
- [ ] Deploy Code.gs as Web App
- [ ] Copy Web App URL
- [ ] Update API_URL in store.html
- [ ] Upload store.html to hosting
- [ ] Test: Add to cart
- [ ] Test: Create account
- [ ] Test: Place order
- [ ] Test: Check Orders sheet
- [ ] Share your store URL!

---

## 💡 Tips

**Best Image Hosting:**
- [Imgur](https://imgur.com) - Free, easy
- [Cloudinary](https://cloudinary.com) - Free tier
- Or use: `https://via.placeholder.com/300` for testing

**Product IDs:**
- Use format: PROD_001, PROD_002, etc.
- Must be unique

**Order Status Values:**
- Pending
- Processing
- Out For Delivery
- Delivered
- Cancelled

**Stock Management:**
- Set to 0 for out of stock
- Updates show in real-time

---

## 🎉 You're Done!

Your store is now live and ready to sell!

**Need help?** Check [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) for detailed sheet setup.

**Happy Selling! 🚀**
