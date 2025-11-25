# Customer Panel - RDP.SALE

The customer-facing e-commerce platform for browsing, purchasing, and managing RDP services.

## Features

✅ **Browse RDP Plans** - View all 7 plans with detailed specifications
✅ **Shopping Cart** - Add multiple plans, view cart, remove items
✅ **User Authentication** - Signup and login functionality
✅ **Secure Checkout** - Upload payment screenshot and transaction ID
✅ **User Dashboard** - View orders and server details
✅ **Server Controls** - Start, Stop, Restart buttons for active servers
✅ **Order Tracking** - Real-time status updates (Pending, Processing, Active, Suspended)
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Modern UI** - Clean design with Tailwind CSS

## Technology Stack

- **React 18** - UI framework (loaded from CDN)
- **Tailwind CSS** - Styling (loaded from CDN)
- **Vanilla JavaScript** - No build process required
- **Google Apps Script** - Backend API
- **localStorage** - Session management and cart storage

## Quick Start

### 1. Update API URL

Open `index.html` and find this line (around line 80):

```javascript
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace with your Google Apps Script deployment URL:

```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

### 2. Deploy

Simply upload `index.html` to your web hosting.

**For Static Hosting (Netlify, Vercel, GitHub Pages):**
```bash
# Deploy to Netlify (example)
netlify deploy --prod --dir=.
```

**For cPanel/FTP:**
1. Upload `index.html` to your web root
2. Rename to `index.html` if needed
3. Access via your domain

**For GitHub Pages:**
1. Push to repository
2. Enable GitHub Pages in repository settings
3. Select branch and folder
4. Access via `username.github.io/repo-name`

### 3. Configure Domain

Point your domain (e.g., `panel.rdp.sale`) to your hosting:
- Add A record or CNAME in DNS settings
- Wait for DNS propagation (5-30 minutes)
- Enable SSL/HTTPS

### 4. Test

Visit your domain and test:
- [ ] Plans page loads
- [ ] Can add items to cart
- [ ] Cart badge updates
- [ ] Cart page shows items
- [ ] Can register new account
- [ ] Can login
- [ ] Can checkout (with login)
- [ ] Dashboard shows orders

## File Structure

```
customer-panel/
├── index.html          # Complete single-file application
└── README.md          # This file
```

## Configuration

### API Endpoints Used

The customer panel uses these backend endpoints:
- `POST /register` - Create new user account
- `POST /login` - Authenticate user
- `POST /createOrder` - Create new order
- `GET /getOrders` - Get user's orders
- `POST /serverAction` - Create server action request

### Payment Configuration

Update payment details in `index.html` (around line 100):

```javascript
const PAYMENT_INFO = {
    accountNumber: '03316873505',
    accountHolder: 'Shaista Nawaz'
};
```

### RDP Plans

Plans are defined in `index.html` (around line 88). To modify:

```javascript
const PLANS = [
  {
    id: 1,
    name: 'Mini',
    price: 1999,
    cpu: '4 vCPU',
    ram: '6GB RAM',
    storage: '120GB SSD',
    traffic: '3TB Traffic/Month'
  },
  // ... more plans
];
```

## Features in Detail

### Shopping Cart

**Location:** Navbar (cart icon with badge)

**Features:**
- Add multiple items from plans page
- View cart with all items
- Remove individual items
- See subtotal and total
- Proceed to checkout

**Storage:** localStorage (persists across sessions until order completion)

### Authentication

**Signup:**
- Name, email, phone, address, password required
- Email validation
- Password minimum 6 characters
- Auto-login after signup

**Login:**
- Email and password
- Session stored in localStorage
- Persists until logout

### Checkout Process

**Requirements:**
- User must be logged in
- Cart must have items

**Steps:**
1. View order summary
2. See Easypaisa payment details
3. Upload payment screenshot (max 5MB)
4. Enter transaction ID
5. Submit payment

**Result:**
- Orders created in backend
- Cart cleared
- Redirect to dashboard

### User Dashboard

**Features:**
- List all user's orders
- Color-coded status badges
- Server details (when active)
- Server control buttons

**Order Statuses:**
- 🟡 **Pending** - Payment under review
- 🔵 **Processing** - Server being set up (~30 mins)
- 🟢 **Active** - Server ready to use
- 🔴 **Suspended** - Server suspended

**Server Controls** (Active orders only):
- 🟢 **Start** - Start the server
- 🔵 **Restart** - Restart the server
- 🔴 **Stop** - Stop the server

**Control Logic:**
- Confirmation dialog before action
- Loading state during processing
- ~9 minutes estimated time
- Disabled appropriately (can't start if active)

## Customization

### Change Colors

Find and replace color classes in `index.html`:
- `cyan-500` → Your primary color
- `cyan-600` → Your primary hover color
- Update gradient background classes

### Change Logo

Replace the cloud SVG icon (around line 150):
```html
<svg className="w-8 h-8 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
  <!-- Replace with your logo SVG -->
</svg>
```

### Change Branding

Replace "RDP.SALE" text throughout the file with your brand name.

### Add More Plans

Add to the `PLANS` array:
```javascript
{
  id: 8,
  name: 'Your Plan',
  price: 5000,
  cpu: '8 vCPU',
  ram: '32GB RAM',
  storage: '500GB SSD',
  traffic: '50TB Traffic',
  popular: true // Optional
}
```

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Required Features:**
- ES6 JavaScript
- localStorage
- FileReader API (for image upload)
- Fetch API

## Performance

**Load Time:** ~2-3 seconds (first load)
**Page Size:** ~100KB (all dependencies from CDN)
**Mobile Optimized:** Yes

**CDN Dependencies:**
- React 18 (from unpkg.com)
- React DOM 18 (from unpkg.com)
- Babel Standalone (from unpkg.com)
- Tailwind CSS (from cdn.tailwindcss.com)

## Security Considerations

⚠️ **Current Implementation:**
- Passwords stored in plain text in backend
- No CSRF protection
- No rate limiting
- Open API access

✅ **For Production:**
- Implement proper authentication (JWT, OAuth)
- Hash passwords with bcrypt
- Add CSRF tokens
- Implement rate limiting
- Use HTTPS only
- Sanitize all inputs
- Add Content Security Policy headers

## Troubleshooting

### Cart Not Working
- Check browser console for errors
- Ensure localStorage is enabled
- Clear localStorage: `localStorage.clear()`
- Refresh page

### Can't Login/Signup
- Check API URL is correct
- Open Network tab in DevTools
- Verify backend is deployed
- Check CORS settings

### Images Not Uploading
- Check file size (max 5MB)
- Check file type (images only)
- Check browser console for errors
- Ensure FileReader API supported

### Orders Not Showing
- Verify user is logged in
- Check API response in Network tab
- Verify orders exist in Google Sheets
- Check email matches exactly

## Testing

### Manual Test Checklist

- [ ] Plans page loads correctly
- [ ] All 7 plans displayed
- [ ] "Basic" plan shows "MOST POPULAR" badge
- [ ] Click "Order Now" adds to cart
- [ ] Cart badge shows correct count
- [ ] Cart page shows all items
- [ ] Can remove items from cart
- [ ] Subtotal calculates correctly
- [ ] "Continue Shopping" returns to plans
- [ ] "Proceed to Checkout" requires login
- [ ] Signup form validates inputs
- [ ] Signup creates account
- [ ] Login form validates inputs
- [ ] Login authenticates correctly
- [ ] Checkout shows order summary
- [ ] Checkout shows payment details
- [ ] Can upload payment screenshot
- [ ] Can enter transaction ID
- [ ] Submit payment creates order
- [ ] Dashboard shows all user orders
- [ ] Active orders show server details
- [ ] Control buttons work correctly
- [ ] Logout clears session

### Browser Testing

Test on:
- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac/iOS)
- [ ] Edge (Windows)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Responsive Testing

Test at these breakpoints:
- [ ] 320px (Mobile S)
- [ ] 375px (Mobile M)
- [ ] 425px (Mobile L)
- [ ] 768px (Tablet)
- [ ] 1024px (Laptop)
- [ ] 1440px (Desktop)

## Support

**Issues with the panel:**
1. Check browser console (F12)
2. Check Network tab for API errors
3. Verify API URL is correct
4. Test backend directly
5. Check Google Apps Script logs

**Contact:**
- Email: support@rdp.sale
- Documentation: See `/docs` folder

## License

Proprietary - All rights reserved

## Version

**Version:** 1.0.0
**Last Updated:** January 2025
**Built for:** RDP.SALE
