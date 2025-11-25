# Admin Panel - RDP.SALE

The administrative dashboard for managing customers, orders, servers, and system operations.

## Features

✅ **Secure Login** - Password-protected admin access
✅ **Dashboard** - Statistics and metrics overview
✅ **Order Management** - View, search, filter, and update orders
✅ **Customer Management** - View all customers and their order history
✅ **Server Management** - Add and manage server credentials
✅ **Action Requests** - Handle customer server control requests
✅ **Google Sheets Integration** - Embed and view sheets directly
✅ **Real-time Updates** - Auto-refresh data every 30 seconds
✅ **Responsive Design** - Works on all devices
✅ **Professional UI** - Modern admin dashboard design

## Technology Stack

- **React 18** - UI framework (loaded from CDN)
- **Tailwind CSS** - Styling (loaded from CDN)
- **Vanilla JavaScript** - No build process required
- **Google Apps Script** - Backend API
- **localStorage** - Sheet URLs and session management

## Quick Start

### 1. Update API URL

Open `index.html` and find this line (around line 38):

```javascript
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace with your Google Apps Script deployment URL:

```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

### 2. Update Admin Credentials (Optional)

Find the credentials section (around line 41):

```javascript
const ADMIN_CREDENTIALS = {
    email: 'admin@rdp.sale',
    password: 'Admin@RDP2025'
};
```

**⚠️ IMPORTANT:** Change these for production!

### 3. Deploy

Upload `index.html` to your web hosting.

**For Static Hosting:**
```bash
netlify deploy --prod --dir=.
```

**For cPanel/FTP:**
1. Upload to a separate subdomain (e.g., `admin.rdp.sale`)
2. Ensure it's different from customer panel
3. Configure subdomain in DNS

### 4. Configure Domain

Point your admin subdomain (e.g., `admin.rdp.sale`) to your hosting:
- Keep separate from customer panel domain
- Enable HTTPS (required for security)
- Consider IP whitelist if possible

### 5. Login and Test

1. Visit your admin domain
2. Login with credentials
3. Verify all pages work
4. Configure Google Sheets embeds

## Default Login Credentials

```
Email: admin@rdp.sale
Password: Admin@RDP2025
```

**⚠️ CHANGE THESE BEFORE PRODUCTION DEPLOYMENT!**

## File Structure

```
admin-panel/
├── index.html          # Complete single-file application
└── README.md          # This file
```

## Features in Detail

### Dashboard

**Statistics Cards:**
- Total Users
- Total Orders
- Pending Orders
- Active Servers
- Total Revenue
- Action Requests

**Recent Orders Table:**
- Last 10 orders
- Quick status overview
- Jump to full orders page

**Auto-Refresh:**
- Data refreshes every 30 seconds
- Manual refresh available

### Order Management

**View All Orders:**
- Complete order list
- Search by Order ID, email, or plan
- Filter by status
- View payment screenshots
- See transaction IDs

**Update Order Status:**
- Dropdown to change status
- Options: pending, processing, active, suspended
- Updates immediately
- Customer sees change in dashboard

**Order Details Modal:**
- Click "View Details" on any order
- See full order information
- View payment screenshot
- Check transaction ID
- Verify customer details

### Customer Management

**View All Customers:**
- List of all registered users
- Name, email, phone, registration date
- Search functionality

**Customer Orders:**
- Click "View Orders" on any customer
- See all orders from that customer
- Order status and amounts
- Customer history tracking

**Use Cases:**
- Verify customer information
- Check order history
- Identify repeat customers
- Customer support lookup

### Server Management

**View All Servers:**
- Table of all configured servers
- Order ID, customer, IP, credentials
- Server status

**Add Server Details:**
- Form to add new server credentials
- Order ID (must exist)
- Server IP address
- Username and password
- Auto-links to customer email

**Update Server Details:**
- Use same form with existing Order ID
- Updates credentials
- Customer sees updated info

### Action Requests

**View Requests:**
- List of all Start/Stop/Restart requests
- Customer email and order ID
- Request time and action type
- Current status

**Process Requests:**
1. See pending request
2. Perform action on actual server
3. Click "Mark Complete"
4. Status updates to completed

**Request Types:**
- 🟢 **Start** - Customer wants to start server
- 🔴 **Stop** - Customer wants to stop server
- 🔵 **Restart** - Customer wants to restart server

### Google Sheets Integration

**Purpose:**
- View raw data directly
- Use Google Sheets features
- Advanced filtering and sorting
- Data export
- Bulk operations

**Setup:**
1. Open your Google Sheet
2. Click specific sheet tab
3. File > Share > Publish to web
4. Select sheet and "Embed" format
5. Copy embed URL
6. In Admin Panel > Google Sheets
7. Select corresponding tab
8. Paste URL and save

**Available Sheets:**
- Users
- Orders
- Server Details
- Action Requests

**Note:** URLs saved per browser (localStorage)

## API Endpoints Used

The admin panel uses these backend endpoints:
- `GET /getAllUsers` - Fetch all customers
- `GET /getAllOrders` - Fetch all orders
- `GET /getAllServers` - Fetch all servers
- `GET /getAllActionRequests` - Fetch all action requests
- `POST /updateOrderStatus` - Update order status
- `POST /addServerDetails` - Add/update server credentials
- `POST /updateActionRequest` - Mark action as completed

## Workflows

### Processing a New Order

1. **Receive Email Notification**
   - Check email for new order alert
   - Note Order ID and customer details

2. **Login to Admin Panel**
   - Go to Dashboard or Orders page

3. **Find the Order**
   - Use search or filter
   - Click "View Details"

4. **Verify Payment**
   - Check payment screenshot
   - Verify transaction ID
   - Confirm amount matches

5. **Update to Processing**
   - Change status to "processing"
   - Customer sees "Installing Machine" message

6. **Set Up Server**
   - Create actual RDP server
   - Configure per plan specs
   - Test connection

7. **Add Server Details**
   - Go to Servers page
   - Click "Add Server Details"
   - Enter Order ID, IP, username, password
   - Submit

8. **Activate Order**
   - Go back to Orders
   - Change status to "active"
   - Customer now sees server details

### Handling Action Requests

1. **Receive Email Notification**
   - Note Order ID and action type

2. **Go to Action Requests Page**
   - See pending request

3. **Identify Server**
   - Note IP address from request
   - Access your server panel

4. **Perform Action**
   - Start/Stop/Restart the server
   - Wait for completion

5. **Mark as Completed**
   - Click "Mark Complete"
   - Customer notified via dashboard

## Customization

### Change Admin Credentials

Edit the credentials in code:
```javascript
const ADMIN_CREDENTIALS = {
    email: 'your-admin@domain.com',
    password: 'YourSecurePassword123!'
};
```

### Change Colors

Replace Tailwind color classes:
- Sidebar: `bg-gray-800` → Your color
- Primary: `cyan-600` → Your brand color
- Accents: Update throughout

### Add More Admins

**Current:** Single admin login

**To add multiple:**
1. Create array of admin credentials
2. Update login logic to check array
3. Or implement proper backend authentication

### Modify Statistics

Edit the stats array in Dashboard component:
```javascript
const stats = [
  { label: 'Your Stat', value: calculation, icon: 'svg-path', color: 'bg-color' },
  // Add more stats
];
```

## Security

### Current Implementation

⚠️ **Security Notes:**
- Hardcoded admin credentials
- No session tokens
- No multi-factor authentication
- No IP whitelisting
- No audit logs

### Production Recommendations

✅ **Essential Security:**
1. Change default credentials
2. Use strong password (16+ characters)
3. Enable HTTPS only
4. Use separate subdomain
5. Consider IP whitelist
6. Add session timeout
7. Implement proper authentication

✅ **Advanced Security:**
1. Multi-factor authentication (2FA)
2. Role-based access control (RBAC)
3. Audit logging
4. Rate limiting
5. CSRF protection
6. Security headers
7. Regular security audits

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Modern mobile browsers

## Performance

**Load Time:** ~2-3 seconds
**Data Refresh:** Every 30 seconds
**Concurrent Users:** Unlimited (limited by Google Apps Script)

## Monitoring

### Daily Checks
- [ ] Check pending orders
- [ ] Review action requests
- [ ] Verify email notifications
- [ ] Check statistics accuracy

### Weekly Checks
- [ ] Review all active servers
- [ ] Check customer growth
- [ ] Analyze revenue trends
- [ ] Backup Google Sheets

### Monthly Checks
- [ ] Review security
- [ ] Check for updates needed
- [ ] Analyze customer feedback
- [ ] Plan improvements

## Troubleshooting

### Can't Login
**Problem:** Invalid credentials error

**Solutions:**
- Verify email and password exactly match
- Check for extra spaces
- Verify code hasn't been modified
- Clear browser cache

### No Data Showing
**Problem:** Empty tables in all pages

**Solutions:**
- Check API URL is correct
- Verify backend is deployed
- Open browser console (F12)
- Check Network tab for errors
- Verify Google Sheets has data

### Can't Update Order Status
**Problem:** Status dropdown doesn't work

**Solutions:**
- Check console for errors
- Verify API endpoint works
- Test backend directly
- Check Google Sheets permissions

### Google Sheets Embed Not Working
**Problem:** Sheet doesn't appear in iframe

**Solutions:**
- Verify sheet is published to web
- Use "Embed" URL not "View" URL
- Check URL format
- Try republishing the sheet

### Auto-Refresh Not Working
**Problem:** Data doesn't update automatically

**Solutions:**
- Check if page is focused
- Verify interval is running
- Check console for errors
- Refresh page manually

## Testing

### Test Checklist

**Login:**
- [ ] Can login with correct credentials
- [ ] Can't login with wrong credentials
- [ ] Session persists on refresh

**Dashboard:**
- [ ] Statistics show correct numbers
- [ ] Recent orders table populated
- [ ] Cards display properly
- [ ] Responsive on mobile

**Orders:**
- [ ] All orders displayed
- [ ] Search works correctly
- [ ] Filter by status works
- [ ] Can view order details
- [ ] Can update order status
- [ ] Payment screenshot displays

**Customers:**
- [ ] All customers displayed
- [ ] Search works
- [ ] Can view customer orders
- [ ] Customer details correct

**Servers:**
- [ ] All servers displayed
- [ ] Can add new server
- [ ] Can update existing server
- [ ] Form validation works

**Action Requests:**
- [ ] All requests displayed
- [ ] Can mark as completed
- [ ] Request details correct

**Google Sheets:**
- [ ] Can save embed URLs
- [ ] Sheets display in iframe
- [ ] All 4 sheet tabs work
- [ ] Can interact with sheet

**General:**
- [ ] Sidebar navigation works
- [ ] Logout works
- [ ] Mobile responsive
- [ ] No console errors

## Maintenance

### Daily
- Process pending orders
- Handle action requests
- Respond to support emails

### Weekly
- Backup Google Sheets
- Review statistics
- Check for issues

### Monthly
- Update documentation
- Review security
- Plan improvements

## Support

**For Issues:**
1. Check browser console (F12)
2. Check Network tab for API errors
3. Verify Google Apps Script logs
4. Check Google Sheets data
5. Review backend setup

**Documentation:**
- Deployment Guide: `/docs/DEPLOYMENT-GUIDE.md`
- API Documentation: `/docs/API-DOCUMENTATION.md`
- Admin Workflow: `/docs/ADMIN-WORKFLOW.md`

## Version

**Version:** 1.0.0
**Last Updated:** January 2025
**Built for:** RDP.SALE

## License

Proprietary - All rights reserved
