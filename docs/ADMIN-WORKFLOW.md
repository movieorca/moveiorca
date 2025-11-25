# Admin Workflow Guide - RDP.SALE

Complete guide for administrators on how to manage the RDP sales system.

## Table of Contents

1. [Daily Tasks](#daily-tasks)
2. [Order Processing Workflow](#order-processing-workflow)
3. [Customer Management](#customer-management)
4. [Server Management](#server-management)
5. [Action Request Handling](#action-request-handling)
6. [Google Sheets Management](#google-sheets-management)
7. [Common Scenarios](#common-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## Daily Tasks

### Morning Routine (10-15 minutes)

1. **Check Email Notifications**
   - Review new order notifications
   - Review new action requests
   - Review new user registrations

2. **Login to Admin Panel**
   - Visit `https://admin.rdp.sale`
   - Email: `admin@rdp.sale`
   - Password: `Admin@RDP2025`

3. **Review Dashboard**
   - Check pending orders count
   - Review total revenue
   - Check active servers count
   - Note any unusual activity

4. **Process Pending Orders**
   - Go to Orders page
   - Filter by "Pending" status
   - Process each order (see Order Processing Workflow)

5. **Handle Action Requests**
   - Go to Action Requests page
   - Process any pending Start/Stop/Restart requests
   - Mark completed actions as done

### Evening Routine (5-10 minutes)

1. **Final Check**
   - Review any new orders from afternoon
   - Check for pending action requests
   - Verify all emails responded to

2. **Backup Data** (Weekly)
   - Go to Google Sheets
   - File > Download > CSV
   - Save each sheet separately
   - Store in secure location

---

## Order Processing Workflow

### Step 1: New Order Received

**Email Notification Contains:**
- Order ID
- Customer email
- Plan name
- Price
- Transaction ID
- Order date

**Action Required:**
1. Note the Order ID
2. Open Admin Panel > Orders
3. Find the order (use search if needed)

### Step 2: Verify Payment

1. **Click "View Details" on the order**
2. **Review Payment Screenshot:**
   - Is it a valid Easypaisa screenshot?
   - Does the transaction ID match?
   - Does the amount match the plan price?
   - Is the account number correct? (03316873505)
   - Is the account name correct? (Shaista Nawaz)

3. **Verify Transaction ID:**
   - Check if transaction ID looks valid
   - Cross-reference with Easypaisa statement if available
   - Ensure it's not a duplicate (search in Google Sheets)

### Step 3: Update Order Status

**If Payment is Valid:**
1. Change status from "pending" to "processing"
2. Customer receives automatic notification via dashboard
3. Customer sees "Installing Machine (~30 mins)" message

**If Payment is Invalid/Suspicious:**
1. Keep status as "pending"
2. Contact customer via email
3. Request clarification or additional proof
4. Document the issue in notes

### Step 4: Set Up RDP Server

**Actual Server Setup (Your existing process):**
1. Provision new RDP server on your infrastructure
2. Configure according to selected plan specs
3. Set up username and password
4. Test the connection
5. Note down credentials

**Example Server Setup:**
- Plan: Basic (4 vCPU, 10GB RAM, 200GB SSD)
- IP: 192.168.1.100
- Username: customer_basic_001
- Password: SecureP@ss2025

### Step 5: Add Server Details to System

1. **Go to Servers page in Admin Panel**
2. **Click "Add Server Details"**
3. **Fill in the form:**
   - Order ID: (from email notification)
   - Server IP: 192.168.1.100
   - Username: customer_basic_001
   - Password: SecureP@ss2025
4. **Click "Add Server"**
5. **Verify it appears in the servers table**

### Step 6: Activate the Order

1. **Go back to Orders page**
2. **Find the order**
3. **Change status from "processing" to "active"**
4. **Customer now sees:**
   - Green "Active" badge
   - Server details (IP, Username, Password)
   - Control buttons (Start, Stop, Restart)

### Step 7: Follow-Up (Optional)

1. **Send welcome email to customer** (manual or automated)
2. **Include:**
   - Server connection instructions
   - How to use RDP (Remote Desktop)
   - Support contact information
   - Terms of service reminder

**Sample Welcome Email:**
```
Subject: Your RDP Server is Ready! 🎉

Dear [Customer Name],

Your [Plan Name] RDP server is now active and ready to use!

Server Details:
- IP Address: [IP]
- Username: [Username]
- Password: [Password]

How to Connect:
1. Open Remote Desktop Connection on Windows
2. Enter the IP address
3. Click Connect
4. Enter username and password
5. Enjoy your RDP!

Need help? Reply to this email or contact support.

Best regards,
RDP.SALE Team
```

---

## Customer Management

### Viewing All Customers

1. **Go to Customers page**
2. **See all registered users:**
   - Name
   - Email
   - Phone
   - Registration date

### Searching for a Customer

1. **Use the search box**
2. **Search by:**
   - Name
   - Email
   - Phone number

### Viewing Customer Orders

1. **Click "View Orders" on any customer**
2. **See modal with:**
   - All orders from this customer
   - Order status
   - Total amount spent
3. **Use this to:**
   - Check customer history
   - Verify repeat customer
   - Identify VIP customers

### Customer Support Scenarios

**Scenario 1: Customer forgot password**
- Check Users sheet in Google Sheets
- Find their email
- View password (plain text)
- Send via secure method (email, SMS)

**Scenario 2: Customer wants to upgrade plan**
- They need to place new order
- You can offer discount manually
- Process as normal order
- Consider migration of data from old server

**Scenario 3: Customer requests refund**
- Check order status
- If pending: Easy to refund, mark as cancelled
- If active: Evaluate based on usage
- Update status to "suspended"
- Process refund via Easypaisa

---

## Server Management

### Viewing All Servers

1. **Go to Servers page**
2. **See table with:**
   - Order ID
   - Customer email
   - IP address
   - Username
   - Password
   - Status

### Adding Server Details

**When to add:**
- After setting up new RDP server
- After order status changed to "processing"
- Before changing status to "active"

**How to add:**
1. Click "Add Server Details"
2. Fill in Order ID (must match existing order)
3. Enter server IP, username, password
4. Click "Add Server"

**Tips:**
- Keep username consistent (e.g., user_001, user_002)
- Use strong passwords (min 12 characters, mix of chars)
- Document server location/provider for internal tracking
- Test connection before marking order as active

### Updating Server Details

**If you need to change credentials:**
1. Go to Servers page
2. Find the server
3. Click "Add Server Details" with same Order ID
4. Enter new credentials
5. System updates existing entry

**Notify customer:**
- Send email with new credentials
- Explain reason for change
- Provide connection instructions

### Server Status Management

**Active:**
- Server is running and accessible
- Customer can connect
- All features available

**Suspended:**
- Server access revoked
- Due to: non-payment, violation, request
- Update order status to "suspended"
- Customer sees red "Suspended" badge

**To suspend a server:**
1. Stop the actual server on your infrastructure
2. Update order status to "suspended"
3. Customer automatically loses access to controls
4. Send notification email explaining why

**To reactivate:**
1. Restart server on your infrastructure
2. Update order status to "active"
3. Customer regains access

---

## Action Request Handling

### Understanding Action Requests

Customers can request three actions:
1. **Start** - Start a stopped server
2. **Stop** - Stop a running server
3. **Restart** - Restart the server

### Viewing Action Requests

1. **Go to Action Requests page**
2. **See table with:**
   - Request ID
   - Order ID
   - Customer email
   - Action type (Start/Stop/Restart)
   - Request time
   - Status (pending/completed)

### Processing an Action Request

**Step 1: Receive Notification**
- Email notification sent immediately
- Contains all request details

**Step 2: Identify Server**
- Note the Order ID
- Find corresponding server in Servers page
- Or check ServerDetails sheet in Google Sheets

**Step 3: Perform Action**
- Access your server management panel
- Find the customer's server by IP
- Perform the requested action:
  - **Start**: Power on the server
  - **Stop**: Graceful shutdown
  - **Restart**: Reboot the server
- Wait for action to complete (~5-10 minutes typically)

**Step 4: Mark as Completed**
- Go back to Action Requests page
- Find the request
- Click "Mark Complete"
- Status changes to "completed"
- Timestamp recorded

**Step 5: Verify (Optional)**
- Test server connectivity
- Check server status in your panel
- Ensure customer can connect

### Typical Processing Time

- **Start**: 2-5 minutes
- **Stop**: 1-3 minutes
- **Restart**: 3-7 minutes

**Set customer expectations:**
- Tell them it takes ~9 minutes
- This accounts for processing + actual server action
- Better to over-promise and under-deliver

### Handling Special Cases

**Scenario 1: Server won't start**
- Check server logs
- Investigate issue
- Reply to customer explaining problem
- Offer troubleshooting or replacement

**Scenario 2: Multiple requests from same customer**
- Process in order received (FIFO)
- If conflicting (Start then immediately Stop), use latest
- Contact customer if seems unusual

**Scenario 3: Restart request during maintenance**
- Inform customer of maintenance window
- Process request after maintenance
- Or delay and notify customer

---

## Google Sheets Management

### Purpose of Sheets Integration

The admin panel can embed Google Sheets directly for:
- Real-time data viewing
- Advanced filtering and sorting
- Bulk operations
- Data analysis
- Backup verification

### Setting Up Sheet Embeds

**For each sheet (Users, Orders, ServerDetails, ActionRequests):**

1. **Open your Google Sheet**
2. **Click on the specific sheet tab** at bottom
3. **Go to File > Share > Publish to web**
4. **Select the specific sheet** from dropdown
5. **Choose "Embed" format**
6. **Click "Publish"**
7. **Copy the embed URL**
8. **In Admin Panel:**
   - Go to Google Sheets page
   - Click on corresponding tab
   - Paste the embed URL
   - Click "Save URL"
9. **Refresh page** to see the embedded sheet

### Using Embedded Sheets

**Benefits:**
- See all data at once
- Use Google Sheets features (filter, sort, search)
- Make quick edits directly
- Export data (CSV, Excel)
- Create charts and pivot tables

**When to use:**
- Bulk data review
- Advanced analysis
- Finding specific records
- Manual corrections
- Generating reports

### Direct Sheet Editing

**You can edit Google Sheets directly:**

1. **Open the Google Sheet** (not embedded)
2. **Make changes carefully:**
   - ⚠️ Don't delete header row
   - ⚠️ Don't change column order
   - ⚠️ Maintain data formats
   - ✅ Fix typos
   - ✅ Update values
   - ✅ Add notes (separate column)

3. **Common edits:**
   - Correct customer email
   - Fix transaction ID typo
   - Update server password
   - Change order status
   - Add manual notes

4. **Changes reflect immediately** in both panels

### Data Analysis Examples

**Total Revenue:**
```
=SUM(Orders!D2:D)
```

**Orders by Status:**
```
=COUNTIF(Orders!E2:E, "active")
```

**Average Order Value:**
```
=AVERAGE(Orders!D2:D)
```

**Monthly Revenue:**
```
=SUMIFS(Orders!D2:D, Orders!H2:H, ">="&DATE(2025,1,1), Orders!H2:H, "<"&DATE(2025,2,1))
```

### Backup Best Practices

**Daily (for high-volume):**
- Automatic version history (built-in)

**Weekly:**
- Download as CSV
- Store in cloud (Dropbox, Drive)

**Monthly:**
- Full export (all sheets)
- Archive previous month
- Store offline backup

---

## Common Scenarios

### Scenario 1: Customer Can't Connect to RDP

**Customer Report:**
"I can't connect to my RDP server"

**Your Response:**
1. Check order status (must be "active")
2. Verify server details exist
3. Check your actual server (is it running?)
4. Verify IP, username, password are correct
5. Ask customer:
   - What error message do they see?
   - Did they try Remote Desktop Connection?
   - Is their internet working?
6. Test connection yourself
7. If server down, restart it
8. If credentials wrong, update them

### Scenario 2: Payment Screenshot is Unclear

**Situation:**
Payment screenshot is blurry or incomplete

**Your Action:**
1. Keep order status as "pending"
2. Email customer:
   ```
   Subject: Order [OrderID] - Payment Verification Needed

   Dear Customer,

   We received your order but need a clearer payment screenshot.
   Please send a clear screenshot showing:
   - Transaction amount
   - Transaction ID
   - Date and time
   - Account details

   Reply to this email with the screenshot.

   Order ID: [OrderID]
   Amount: Rs [Price]

   Thank you,
   RDP.SALE Support
   ```
3. Wait for response
4. Re-verify once received
5. Process order normally

### Scenario 3: Customer Ordered Wrong Plan

**Customer Report:**
"I ordered Basic but wanted Ultra"

**Your Response:**
1. Check order status
2. If "pending" or "processing":
   - Easy to change
   - Update plan name in Orders sheet
   - Update price if different
   - Request additional payment if applicable
3. If "active" (server already deployed):
   - Option A: Keep existing, offer discount on next order
   - Option B: Set up new server, refund difference
   - Option C: Customer places new order, you migrate data

### Scenario 4: Multiple Orders from Same Customer

**Situation:**
Customer has 2+ active orders

**Your Action:**
1. Verify both are legitimate (not accidental duplicate)
2. Set up separate servers for each
3. Use clear naming (username_1, username_2)
4. Document which server is which
5. Ensure customer knows they have multiple servers

### Scenario 5: Fraudulent Order Suspected

**Red Flags:**
- Payment screenshot looks edited
- Transaction ID invalid format
- Amount doesn't match
- Email looks suspicious
- Multiple orders with different emails, same payment

**Your Action:**
1. DO NOT activate the order
2. Keep status as "pending"
3. Research the transaction ID
4. Check Easypaisa transaction history
5. If confirmed fraud:
   - Update status to "suspended"
   - Add note in Orders sheet
   - Report to authorities if needed
6. If legitimate:
   - Apologize for delay
   - Process normally
   - Maybe offer small discount

---

## Troubleshooting

### Admin Panel Issues

**Problem: Can't login to admin panel**
- **Solution**: Verify credentials (case-sensitive)
- Email: `admin@rdp.sale`
- Password: `Admin@RDP2025`
- Clear browser cache if needed

**Problem: No data showing in admin panel**
- **Solution**: Check API URL in code, verify backend deployed

**Problem: Can't update order status**
- **Solution**: Check browser console for errors, verify Google Sheets permissions

**Problem: Google Sheets embed not working**
- **Solution**: Make sure sheet is published to web, use correct embed URL

### Backend Issues

**Problem: Orders not appearing in Google Sheets**
- **Solution**: Check Apps Script execution logs, verify SPREADSHEET_ID

**Problem: Email notifications not sending**
- **Solution**: Verify ADMIN_EMAIL, check spam folder, ensure permissions

**Problem: API errors**
- **Solution**: Check Apps Script logs, redeploy if needed

### Customer Issues

**Problem: Customer doesn't receive server details**
- **Solution**: Ensure order status is "active", verify server details added

**Problem: Customer can't see control buttons**
- **Solution**: Order must be "active", server details must exist

**Problem: Action request not working**
- **Solution**: Check Action Requests page, verify request was created

---

## Performance Tips

### For Faster Order Processing

1. **Keep multiple tabs open:**
   - Admin Panel > Orders
   - Admin Panel > Servers
   - Google Sheets
   - Your server management panel

2. **Use keyboard shortcuts:**
   - Ctrl+F to search
   - Ctrl+T for new tab
   - Alt+Tab to switch windows

3. **Process in batches:**
   - Check all pending orders at once
   - Verify all payments together
   - Set up multiple servers
   - Activate all at once

4. **Use templates:**
   - Email templates for common responses
   - Server naming convention
   - Password generation tool

### For Better Customer Service

1. **Respond quickly** - Aim for <2 hour response time
2. **Be clear** - Provide step-by-step instructions
3. **Be proactive** - Send status updates without being asked
4. **Document issues** - Keep notes in Google Sheets
5. **Follow up** - Check if customer issue resolved

---

## Metrics to Track

### Daily Metrics

- [ ] New orders: _____
- [ ] Orders processed: _____
- [ ] Action requests completed: _____
- [ ] Customer support emails: _____
- [ ] Revenue today: Rs _____

### Weekly Metrics

- [ ] Total orders: _____
- [ ] Active servers: _____
- [ ] New customers: _____
- [ ] Total revenue: Rs _____
- [ ] Average order value: Rs _____
- [ ] Most popular plan: _____

### Monthly Metrics

- [ ] Monthly revenue: Rs _____
- [ ] Month-over-month growth: _____%
- [ ] Customer retention: _____%
- [ ] Average support response time: _____
- [ ] Customer satisfaction: _____

---

## Conclusion

This workflow ensures:
- ✅ Fast order processing
- ✅ Happy customers
- ✅ Accurate records
- ✅ Smooth operations
- ✅ Scalable system

Remember:
- **Customer satisfaction is priority #1**
- **Speed matters** - Process orders quickly
- **Communication is key** - Keep customers informed
- **Documentation helps** - Keep good records
- **Improve continuously** - Learn from issues

---

## Need Help?

Check these resources:
- API Documentation (API-DOCUMENTATION.md)
- Deployment Guide (DEPLOYMENT-GUIDE.md)
- Backend Setup (backend/setup-instructions.md)
- Google Sheets directly (for raw data)
- Apps Script execution logs (for errors)

For urgent issues:
1. Check Google Sheets for data integrity
2. Review Apps Script logs for backend errors
3. Test API endpoints directly
4. Clear browser cache and retry
5. Redeploy backend if needed
