# ⚠️ IMPORTANT: Before Testing - Quick Setup Required

## The Network Error You Got

You got a network error because the system needs to be configured with your Google Apps Script API URL first. The placeholder `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` needs to be replaced with your actual API URL.

## ✅ What I Fixed

I fixed the API endpoint format errors:
- ❌ **Before:** `/register`, `/login` (incorrect path-based)
- ✅ **After:** `?action=register`, `?action=login` (correct query parameters)

All API calls in both customer and admin panels are now using the correct Google Apps Script format.

## 🚀 Quick Setup (15 minutes) - Required Before Testing

### Step 1: Set Up Google Apps Script Backend (10 mins)

1. **Create Google Sheet:**
   ```
   1. Go to https://sheets.google.com
   2. Create new blank spreadsheet
   3. Copy the Spreadsheet ID from URL (the long string between /d/ and /edit)
   ```

2. **Set Up Apps Script:**
   ```
   1. In Google Sheet: Extensions > Apps Script
   2. Delete any default code
   3. Copy ALL code from backend/google-apps-script.js
   4. Paste into the editor
   5. Update line 17: SPREADSHEET_ID = 'paste-your-id-here'
   6. Update line 18: ADMIN_EMAIL = 'your-email@example.com'
   7. Save (Ctrl+S or File > Save)
   8. Name it "RDP Sales API"
   ```

3. **Initialize Sheets:**
   ```
   1. At top, select function: initializeAllSheets
   2. Click Run ▶️ button
   3. Click "Review permissions" when prompted
   4. Choose your Google account
   5. Click "Advanced" > "Go to RDP Sales API (unsafe)"
   6. Click "Allow"
   7. Wait for execution to finish (check logs)
   8. Go back to your Google Sheet and refresh
   9. You should see 4 new tabs: Users, Orders, ServerDetails, ActionRequests
   ```

4. **Deploy as Web App:**
   ```
   1. Click "Deploy" > "New deployment"
   2. Click gear icon ⚙️ > Select "Web app"
   3. Fill in:
      - Description: "RDP Sales API v1"
      - Execute as: "Me"
      - Who has access: "Anyone"
   4. Click "Deploy"
   5. Authorize again if prompted (same steps as before)
   6. **COPY THE WEB APP URL** ⭐ (looks like: https://script.google.com/macros/s/ABC123.../exec)
   ```

### Step 2: Update Customer Panel (2 mins)

1. **Open:** `customer-panel/index.html` in text editor
2. **Find line 101:**
   ```javascript
   const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. **Replace with your URL:**
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
4. **Save the file**

### Step 3: Update Admin Panel (2 mins)

1. **Open:** `admin-panel/index.html` in text editor
2. **Find line 38:**
   ```javascript
   const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. **Replace with your URL:**
   ```javascript
   const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
4. **Save the file**

### Step 4: Test Locally (1 min)

1. **Open customer panel in browser:**
   ```
   Right-click customer-panel/index.html
   > Open with > Chrome/Firefox
   ```

2. **Try to signup:**
   ```
   1. Click any "Order Now" button
   2. Click "Proceed to Checkout"
   3. Click "Don't have an account? Sign up"
   4. Fill in the form
   5. Click "Create Account"
   ```

3. **If successful:**
   - ✅ You'll see "Account created successfully!"
   - ✅ You'll be logged in automatically
   - ✅ Check your admin email for notification
   - ✅ Check Google Sheet "Users" tab for new user

## 🔍 Testing Checklist

After setup, test these:

**Customer Panel:**
- [ ] Click "Order Now" - cart badge shows count
- [ ] View cart - shows items
- [ ] Signup - creates account
- [ ] Login - authenticates
- [ ] Checkout - uploads screenshot and creates order
- [ ] Dashboard - shows orders

**Admin Panel:**
- [ ] Login with: admin@rdp.sale / Admin@RDP2025
- [ ] Dashboard - shows statistics
- [ ] Orders - shows all orders
- [ ] Can update order status
- [ ] Can add server details
- [ ] All data matches Google Sheets

## ❌ Common Issues & Solutions

### Issue: Still getting network error
**Solution:**
- Make sure API_URL is updated in BOTH panels
- Make sure the URL ends with `/exec`
- Make sure you deployed as "Web app" not "Library"
- Check browser console (F12) for actual error

### Issue: "Script function not found"
**Solution:**
- Make sure you ran `initializeAllSheets` first
- Make sure code was saved before deploying
- Try redeploying: Deploy > Manage deployments > Edit > New version > Deploy

### Issue: CORS error
**Solution:**
- In Apps Script deployment settings, ensure "Who has access" is set to "Anyone"
- Redeploy if needed

### Issue: Email notifications not working
**Solution:**
- Check spam folder
- Verify ADMIN_EMAIL is correct in Apps Script
- Make sure script has email sending permissions

## 📞 Need Help?

1. Check `backend/setup-instructions.md` for detailed backend setup
2. Check `docs/DEPLOYMENT-GUIDE.md` for complete deployment guide
3. Check browser console (F12) for error messages
4. Verify Google Sheets has the 4 tabs created
5. Check Apps Script execution logs for backend errors

## 🎯 After Setup Works

Once you verify it works locally:
1. Deploy customer panel to hosting (Netlify, Vercel, etc.)
2. Deploy admin panel to separate subdomain
3. Configure your domains
4. Start selling!

## ⚡ Quick Commands

**Check if backend is working:**
Open in browser:
```
YOUR_API_URL?action=getAllUsers
```
Should show: `{"success":true,"users":[]}`

**View Apps Script logs:**
In Apps Script editor, click "Executions" (clock icon) to see all API calls and errors.

---

**The system is now fixed and ready to use after you complete the setup above!** 🎉
