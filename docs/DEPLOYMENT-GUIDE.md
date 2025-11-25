# Complete Deployment Guide - RDP.SALE

This guide will walk you through deploying the complete RDP sales management system from scratch.

## Overview

The system consists of three components:
1. **Customer Panel** - panel.rdp.sale (Single HTML file)
2. **Admin Panel** - admin.rdp.sale (Single HTML file)
3. **Backend** - Google Apps Script (Serverless)

## Prerequisites

- Google account for Google Sheets and Apps Script
- Web hosting for static HTML files (any provider)
- Domain names: panel.rdp.sale and admin.rdp.sale (or subdomains)
- FTP/File upload access to your hosting

## Part 1: Backend Setup (30 minutes)

### Step 1: Create Google Sheet Database

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named **"RDP Sales Database"**
3. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit
                                           ↑ This part ↑
   ```

### Step 2: Deploy Google Apps Script

1. Open **Extensions** > **Apps Script** in your Google Sheet
2. Delete default code and paste contents from `backend/google-apps-script.js`
3. Update configuration:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // From Step 1
   const ADMIN_EMAIL = 'your-email@example.com'; // Your admin email
   ```
4. Save the project (name it "RDP Sales API")
5. Run `initializeAllSheets` function:
   - Select it from the dropdown
   - Click Run ▶️
   - Authorize when prompted
   - Wait for completion
6. Verify 4 sheets were created in your spreadsheet
7. Deploy as web app:
   - Click **Deploy** > **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - **COPY THE WEB APP URL** - You'll need this!

### Step 3: Test the Backend

1. Visit your Web App URL in a browser:
   ```
   YOUR_WEB_APP_URL?action=getAllUsers
   ```
2. You should see a JSON response:
   ```json
   {"success":true,"users":[]}
   ```
3. If you see this, your backend is working! ✅

## Part 2: Update API URLs (5 minutes)

### Step 4: Configure Customer Panel

1. Open `customer-panel/index.html` in a text editor
2. Find line ~80:
   ```javascript
   const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace with your Web App URL:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
4. Save the file

### Step 5: Configure Admin Panel

1. Open `admin-panel/index.html` in a text editor
2. Find the same line and update with your Web App URL
3. Save the file

## Part 3: Deploy Customer Panel (15 minutes)

### Step 6: Upload Customer Panel

**Option A: Using cPanel File Manager**
1. Login to your cPanel
2. Go to **File Manager**
3. Navigate to `public_html` or your domain's root directory
4. Create a subdomain folder (e.g., `panel.rdp.sale`)
5. Upload `customer-panel/index.html` to this folder
6. Rename it to `index.html` if needed

**Option B: Using FTP**
1. Connect to your server via FTP (FileZilla, WinSCP, etc.)
2. Navigate to your web root directory
3. Upload `customer-panel/index.html`
4. Ensure it's named `index.html`

**Option C: Using Git**
1. Push the `customer-panel` folder to a Git repository
2. Deploy using Netlify, Vercel, or GitHub Pages:
   - Connect your repository
   - Set build directory to `customer-panel`
   - Deploy
   - Configure custom domain

### Step 7: Configure Domain/Subdomain

**For cPanel:**
1. Go to **Subdomains**
2. Create subdomain: `panel` under `rdp.sale`
3. Point it to the folder where you uploaded the file
4. Wait for DNS propagation (5-30 minutes)

**For Cloudflare/Other DNS:**
1. Add A record or CNAME for `panel.rdp.sale`
2. Point to your server IP or hosting
3. Wait for DNS propagation

### Step 8: Test Customer Panel

1. Visit `https://panel.rdp.sale` (or your domain)
2. You should see the RDP plans page
3. Try these tests:
   - Click "Order Now" on any plan ✅
   - Check cart badge updates ✅
   - Click cart icon to view cart ✅
   - Try signup (should work) ✅
   - Try login ✅
   - Try checkout (with login) ✅

## Part 4: Deploy Admin Panel (15 minutes)

### Step 9: Upload Admin Panel

Follow the same process as customer panel but for `admin-panel/index.html`:

1. Upload to a different subdomain folder (e.g., `admin.rdp.sale`)
2. Ensure API URL is configured correctly
3. Configure subdomain `admin.rdp.sale`

### Step 10: Test Admin Panel

1. Visit `https://admin.rdp.sale`
2. Login with credentials:
   - Email: `admin@rdp.sale`
   - Password: `Admin@RDP2025`
3. You should see the dashboard ✅
4. Check all pages work:
   - Dashboard ✅
   - Orders ✅
   - Customers ✅
   - Servers ✅
   - Action Requests ✅
   - Google Sheets ✅

## Part 5: Google Sheets Integration (10 minutes)

### Step 11: Publish Google Sheets for Embedding

For each sheet (Users, Orders, ServerDetails, ActionRequests):

1. Open your Google Sheet
2. Click on the specific sheet tab at the bottom
3. Go to **File** > **Share** > **Publish to web**
4. In the dropdown, select the specific sheet
5. Choose **Embed** format
6. Click **Publish**
7. Copy the embed URL (starts with `https://docs.google.com/spreadsheets/d/e/...`)
8. In admin panel, go to **Google Sheets** page
9. Select the corresponding tab
10. Paste the embed URL
11. Click **Save URL**
12. Repeat for all 4 sheets

**Note:** The embed URLs are saved in browser localStorage, so each admin needs to configure them once.

## Part 6: Final Testing (20 minutes)

### Step 12: Complete End-to-End Test

**Customer Flow:**
1. ✅ Visit customer panel
2. ✅ Click "Order Now" on Basic plan
3. ✅ Verify cart badge shows "1"
4. ✅ Click cart icon
5. ✅ See plan in cart with correct price
6. ✅ Click "Proceed to Checkout"
7. ✅ Should redirect to login
8. ✅ Click "Sign up"
9. ✅ Fill registration form and submit
10. ✅ Should auto-login after registration
11. ✅ Proceed to checkout page
12. ✅ See Easypaisa payment details
13. ✅ Upload a test image
14. ✅ Enter a transaction ID
15. ✅ Click "Submit Payment"
16. ✅ Should see success message
17. ✅ Redirected to dashboard
18. ✅ See order with "Pending" status

**Admin Flow:**
1. ✅ Check admin email for new user notification
2. ✅ Check admin email for new order notification
3. ✅ Login to admin panel
4. ✅ Go to Dashboard - see statistics updated
5. ✅ Go to Orders - see the new order
6. ✅ Click "View Details" on the order
7. ✅ See payment screenshot
8. ✅ See transaction ID
9. ✅ Close modal
10. ✅ Change status from "pending" to "processing"
11. ✅ Verify status updated
12. ✅ Go to Servers page
13. ✅ Click "Add Server Details"
14. ✅ Fill in order ID, IP, username, password
15. ✅ Click "Add Server"
16. ✅ Go back to Orders
17. ✅ Change status to "active"

**Customer Dashboard:**
1. ✅ Refresh customer dashboard
2. ✅ Order status should show "Active"
3. ✅ See server details card with IP, username, password
4. ✅ See Start, Restart, Stop buttons
5. ✅ Click "Start" button
6. ✅ Confirm action
7. ✅ See "Processing" message

**Admin Actions:**
1. ✅ Check admin email for action request notification
2. ✅ Go to Action Requests in admin panel
3. ✅ See the "Start" request
4. ✅ Click "Mark Complete"
5. ✅ Status updates to "completed"

### Step 13: Verify Google Sheets

1. Open your Google Sheet
2. Check each tab:
   - **Users**: Should have 1 user (your test user)
   - **Orders**: Should have 1 order
   - **ServerDetails**: Should have 1 server entry
   - **ActionRequests**: Should have 1 action request

## Part 7: Production Checklist

### Step 14: Security Hardening

- [ ] Change default admin password in code
- [ ] Enable HTTPS on both domains
- [ ] Set up SSL certificates
- [ ] Configure security headers
- [ ] Enable CORS properly
- [ ] Set up rate limiting (if possible)
- [ ] Keep Google Sheet private (only you can access)

### Step 15: Monitoring Setup

- [ ] Set up Google Analytics on both panels
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Set up email alerts for sheet changes
- [ ] Enable Google Sheets version history
- [ ] Create backup schedule

### Step 16: Documentation for Your Team

- [ ] Document admin login credentials (securely)
- [ ] Create process for adding server details
- [ ] Create process for handling action requests
- [ ] Document payment verification process
- [ ] Create customer support email templates

## Hosting Options

### Free Options
1. **Netlify** - Best for static sites, free SSL
2. **Vercel** - Similar to Netlify
3. **GitHub Pages** - Free, requires public repo
4. **Firebase Hosting** - Free tier available

### Paid Options
1. **Shared Hosting** (Namecheap, Hostinger, BlueHost)
2. **VPS** (DigitalOcean, Linode, Vultr)
3. **Cloudflare Pages** - Fast, global CDN

### Recommended: Netlify (Free)

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop `customer-panel` folder
3. Get a URL like `random-name-123.netlify.app`
4. Add custom domain in settings
5. Repeat for admin panel
6. Free SSL, automatic deployments

## Troubleshooting

### Customer Panel Issues

**Problem**: Plans not showing
- **Solution**: Clear browser cache, check console for errors

**Problem**: Cart not working
- **Solution**: Check localStorage is enabled, check console errors

**Problem**: Can't register/login
- **Solution**: Verify API URL is correct, check Network tab in browser DevTools

**Problem**: Payment upload fails
- **Solution**: Check file size (must be <5MB), check if base64 encoding works

### Admin Panel Issues

**Problem**: Can't login
- **Solution**: Verify credentials match exactly (case-sensitive)

**Problem**: No data showing
- **Solution**: Check API URL, verify backend is deployed, check Network tab

**Problem**: Can't update order status
- **Solution**: Check console errors, verify API endpoint works

**Problem**: Google Sheets embed not working
- **Solution**: Make sure sheet is published to web, use embed URL not view URL

### Backend Issues

**Problem**: API returns errors
- **Solution**: Check Apps Script execution logs, verify sheet structure

**Problem**: Emails not sending
- **Solution**: Verify email address, check spam, ensure script has permissions

**Problem**: Data not saving
- **Solution**: Check sheet permissions, verify SPREADSHEET_ID is correct

## Performance Optimization

### For Better Load Times:
1. Enable gzip compression on server
2. Use Cloudflare CDN
3. Optimize images before upload
4. Use browser caching headers

### For Better API Performance:
1. Minimize API calls (batch requests when possible)
2. Implement caching in frontend
3. Use pagination for large datasets

## Maintenance

### Daily:
- Check email notifications
- Process pending orders
- Respond to action requests

### Weekly:
- Review all orders
- Backup Google Sheet (File > Download)
- Check system logs

### Monthly:
- Update pricing if needed
- Review customer feedback
- Analyze sales data
- Check for security updates

## Scaling Considerations

When you grow:
1. Consider migrating to a real database (PostgreSQL, MySQL)
2. Implement proper authentication (OAuth, JWT)
3. Add payment gateway integration (Stripe, PayPal)
4. Set up automated server provisioning
5. Add automated testing
6. Implement proper error tracking (Sentry)

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check Google Apps Script execution logs
3. Verify all URLs are correct
4. Test API endpoints directly
5. Check email spam folder for notifications

## Next Steps

After successful deployment:
1. ✅ Add real RDP plans/pricing
2. ✅ Configure payment details
3. ✅ Test with real users
4. ✅ Set up customer support email
5. ✅ Create terms of service
6. ✅ Create privacy policy
7. ✅ Set up analytics
8. ✅ Market your service

Congratulations! Your RDP sales system is now live! 🎉
