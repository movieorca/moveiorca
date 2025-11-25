# Google Apps Script Backend Setup Instructions

## Step-by-Step Setup Guide

### 1. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it **"RDP Sales Database"** (or any name you prefer)
4. Copy the **Spreadsheet ID** from the URL
   - URL format: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`
   - Copy the `YOUR_SPREADSHEET_ID` part

### 2. Open Apps Script Editor

1. In your Google Sheet, go to **Extensions** > **Apps Script**
2. This will open the Apps Script editor in a new tab
3. Delete any default code in the editor

### 3. Add the Backend Code

1. Copy the entire contents of `google-apps-script.js` from this repository
2. Paste it into the Apps Script editor
3. Update the configuration section:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Paste your Spreadsheet ID
   const ADMIN_EMAIL = 'admin@rdp.sale'; // Change to your admin email
   ```
4. Save the project (File > Save or Ctrl+S)
5. Name the project **"RDP Sales API"**

### 4. Initialize Sheets

1. In the Apps Script editor, select the function **`initializeAllSheets`** from the dropdown at the top
2. Click **Run** (▶️ button)
3. You'll be prompted to authorize the script:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** > **Go to RDP Sales API (unsafe)**
   - Click **Allow**
4. Wait for the function to complete (check the execution log)
5. Go back to your Google Sheet and refresh - you should see 4 new tabs:
   - Users
   - Orders
   - ServerDetails
   - ActionRequests

### 5. Deploy as Web App

1. In the Apps Script editor, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Select **Web app**
4. Configure the deployment:
   - **Description**: RDP Sales API v1
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. You may need to authorize again - follow the same steps as before
7. **IMPORTANT**: Copy the **Web app URL** - this is your API endpoint!
   - Format: `https://script.google.com/macros/s/DEPLOYMENT_ID/exec`
   - You'll need this URL for both panels

### 6. Test the API (Optional)

1. In the Apps Script editor, select **`addSampleData`** function
2. Click **Run** to add test data
3. Check your Google Sheet to verify the data was added
4. Test the API endpoint by visiting it in your browser:
   - `YOUR_WEB_APP_URL?action=getAllUsers`
   - You should see a JSON response with the sample user

### 7. Update Both Panels

1. Open **customer-panel/index.html** in a text editor
2. Find this line (near the top of the script section):
   ```javascript
   const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace it with your Web App URL:
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
4. Save the file

5. Open **admin-panel/index.html** in a text editor
6. Find the same line and update it with your Web App URL
7. Save the file

### 8. Configure Email Notifications

Email notifications are automatically enabled through the script. Emails will be sent to the `ADMIN_EMAIL` you configured in Step 3.

**Test email notifications:**
1. Register a test user on the customer panel
2. Check your admin email inbox for a "New User Registration" email
3. If you don't receive it, check your spam folder

### 9. Update API Endpoint After Changes

If you make changes to the Google Apps Script:

1. Save your changes in the Apps Script editor
2. Click **Deploy** > **Manage deployments**
3. Click the pencil icon ✏️ next to your deployment
4. Change the version to **New version**
5. Click **Deploy**
6. The URL remains the same, so you don't need to update the panels

### 10. Security Considerations

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Password Storage**: The current implementation stores passwords in plain text. For production:
   - Consider using a proper authentication service (Firebase Auth, Auth0, etc.)
   - Or implement password hashing in the script

2. **API Access**: The API is currently open to anyone. Consider:
   - Adding API key authentication
   - Implementing rate limiting
   - Using OAuth for sensitive endpoints

3. **Sheet Permissions**:
   - Keep your Google Sheet private (only you have access)
   - The Apps Script runs as you, so it can access the sheet
   - Users can only access data through the API, not the sheet directly

### 11. Monitoring and Logs

**View execution logs:**
1. In Apps Script editor, click **Executions** (clock icon)
2. See all recent API calls and any errors
3. Click on any execution to see detailed logs

**View sheet activity:**
1. In Google Sheets, go to **File** > **Version history** > **See version history**
2. See all changes made to the sheet with timestamps

### 12. Backup Your Data

**Automatic backups:**
1. Google Sheets automatically saves version history
2. You can restore previous versions anytime

**Manual backups:**
1. Go to **File** > **Download** > **Comma-separated values (.csv)**
2. Download each sheet separately
3. Store backups in a safe location

**Automated export (optional):**
- Set up a time-driven trigger to export data daily
- Store exports in Google Drive or email them to yourself

## Troubleshooting

### API Returns Empty Response
- Check if sheets are initialized (Step 4)
- Verify SPREADSHEET_ID is correct
- Check execution logs for errors

### Email Notifications Not Working
- Verify ADMIN_EMAIL is correct
- Check spam folder
- Ensure script has email sending permissions

### CORS Errors
- Make sure deployment "Who has access" is set to "Anyone"
- Redeploy the script with correct settings

### "Permission denied" Errors
- Re-authorize the script
- Make sure you're deploying as "Me" not "User accessing the web app"

### Data Not Appearing in Admin Panel
- Check if API URL is correctly set in both panels
- Open browser console (F12) to see API errors
- Verify the API endpoint returns data when accessed directly

## API Endpoints Reference

### Customer Panel Endpoints

**POST** `/exec?action=register`
- Body: `{ name, email, phone, address, password }`
- Returns: User object

**POST** `/exec?action=login`
- Body: `{ email, password }`
- Returns: User object

**POST** `/exec?action=createOrder`
- Body: `{ userEmail, planName, price, paymentScreenshot, transactionId }`
- Returns: Order ID

**GET** `/exec?action=getOrders&email=user@example.com`
- Returns: Array of orders with server details

**POST** `/exec?action=serverAction`
- Body: `{ orderId, userEmail, action }`
- Returns: Request ID

### Admin Panel Endpoints

**GET** `/exec?action=getAllUsers`
- Returns: Array of all users

**GET** `/exec?action=getAllOrders`
- Returns: Array of all orders

**GET** `/exec?action=getAllServers`
- Returns: Array of all server details

**GET** `/exec?action=getAllActionRequests`
- Returns: Array of all action requests

**POST** `/exec?action=updateOrderStatus`
- Body: `{ orderId, status }`
- Returns: Success message

**POST** `/exec?action=addServerDetails`
- Body: `{ orderId, serverIp, username, password }`
- Returns: Success message

**POST** `/exec?action=updateActionRequest`
- Body: `{ requestId, status }`
- Returns: Success message

## Next Steps

After completing this setup:

1. ✅ Test the customer panel by registering and placing an order
2. ✅ Test the admin panel by logging in and viewing the order
3. ✅ Add server details to the order from admin panel
4. ✅ Test server actions from customer dashboard
5. ✅ Deploy both panels to your web hosting

See the main DEPLOYMENT-GUIDE.md for instructions on deploying the HTML files.
