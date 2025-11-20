/**
 * RDP.SALE - Google Apps Script Backend
 *
 * This script handles all API requests for the RDP sales system
 * It manages data in Google Sheets and sends email notifications
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet with 4 tabs: Users, Orders, ServerDetails, ActionRequests
 * 2. Copy this script to Google Apps Script (Extensions > Apps Script)
 * 3. Update SPREADSHEET_ID with your Google Sheet ID
 * 4. Update ADMIN_EMAIL with your admin email address
 * 5. Deploy as Web App (Deploy > New deployment > Web app)
 * 6. Set access to "Anyone" and execute as "Me"
 * 7. Copy the deployment URL and update both panels
 */

// ==================== CONFIGURATION ====================

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your Google Sheet ID
const ADMIN_EMAIL = 'admin@rdp.sale'; // Replace with your admin email

// Sheet names
const SHEETS = {
  USERS: 'Users',
  ORDERS: 'Orders',
  SERVER_DETAILS: 'ServerDetails',
  ACTION_REQUESTS: 'ActionRequests'
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get spreadsheet object
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Get specific sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }

  return sheet;
}

/**
 * Initialize sheet with headers
 */
function initializeSheet(sheet, sheetName) {
  let headers = [];

  switch(sheetName) {
    case SHEETS.USERS:
      headers = ['UserID', 'Name', 'Email', 'Phone', 'Address', 'Password', 'RegistrationDate', 'EmailVerified'];
      break;
    case SHEETS.ORDERS:
      headers = ['OrderID', 'UserEmail', 'PlanName', 'Price', 'Status', 'PaymentScreenshot', 'TransactionID', 'OrderDate'];
      break;
    case SHEETS.SERVER_DETAILS:
      headers = ['OrderID', 'UserEmail', 'ServerIP', 'Username', 'Password', 'Status', 'LastUpdated'];
      break;
    case SHEETS.ACTION_REQUESTS:
      headers = ['RequestID', 'OrderID', 'UserEmail', 'Action', 'RequestTime', 'Status', 'CompletedTime'];
      break;
  }

  if (headers.length > 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
  }
}

/**
 * Generate unique ID
 */
function generateId(prefix) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Find row by column value
 */
function findRowByValue(sheet, columnIndex, value) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][columnIndex - 1] === value) {
      return i + 1; // Return 1-based row number
    }
  }
  return -1;
}

/**
 * Send email notification
 */
function sendEmail(to, subject, body) {
  try {
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: body
    });
    return true;
  } catch (error) {
    Logger.log('Email error: ' + error);
    return false;
  }
}

/**
 * Convert sheet data to array of objects
 */
function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const objects = [];

  for (let i = 1; i < data.length; i++) {
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      // Convert header to camelCase
      const key = headers[j].charAt(0).toLowerCase() + headers[j].slice(1);
      obj[key] = data[i][j];
    }
    objects.push(obj);
  }

  return objects;
}

// ==================== API ENDPOINTS ====================

/**
 * Handle HTTP GET requests
 */
function doGet(e) {
  const path = e.parameter.action || '';

  try {
    switch(path) {
      case 'getOrders':
        return getOrders(e.parameter.email);
      case 'getAllUsers':
        return getAllUsers();
      case 'getAllOrders':
        return getAllOrders();
      case 'getAllServers':
        return getAllServers();
      case 'getAllActionRequests':
        return getAllActionRequests();
      default:
        return jsonResponse({ success: false, message: 'Invalid endpoint' });
    }
  } catch (error) {
    Logger.log('doGet error: ' + error);
    return jsonResponse({ success: false, message: error.toString() });
  }
}

/**
 * Handle HTTP POST requests
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = e.parameter.action || data.action || '';

  try {
    switch(action) {
      case 'register':
        return registerUser(data);
      case 'login':
        return loginUser(data);
      case 'createOrder':
        return createOrder(data);
      case 'serverAction':
        return createServerAction(data);
      case 'updateOrderStatus':
        return updateOrderStatus(data);
      case 'addServerDetails':
        return addServerDetails(data);
      case 'updateActionRequest':
        return updateActionRequest(data);
      default:
        return jsonResponse({ success: false, message: 'Invalid endpoint' });
    }
  } catch (error) {
    Logger.log('doPost error: ' + error);
    return jsonResponse({ success: false, message: error.toString() });
  }
}

/**
 * Create JSON response
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== USER ENDPOINTS ====================

/**
 * Register new user
 */
function registerUser(data) {
  const sheet = getSheet(SHEETS.USERS);

  // Check if email already exists
  const existingRow = findRowByValue(sheet, 3, data.email); // Email is column 3
  if (existingRow > 0) {
    return jsonResponse({ success: false, message: 'Email already registered' });
  }

  // Generate user ID
  const userId = generateId('USER');
  const registrationDate = new Date().toISOString();

  // Add user to sheet
  sheet.appendRow([
    userId,
    data.name,
    data.email,
    data.phone,
    data.address,
    data.password, // In production, this should be hashed
    registrationDate,
    'false'
  ]);

  // Send notification email
  sendEmail(
    ADMIN_EMAIL,
    'New User Registration - RDP.SALE',
    `<h2>New User Registered</h2>
     <p><strong>Name:</strong> ${data.name}</p>
     <p><strong>Email:</strong> ${data.email}</p>
     <p><strong>Phone:</strong> ${data.phone}</p>
     <p><strong>Registration Date:</strong> ${new Date(registrationDate).toLocaleString()}</p>`
  );

  return jsonResponse({
    success: true,
    user: {
      userId: userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address
    }
  });
}

/**
 * Login user
 */
function loginUser(data) {
  const sheet = getSheet(SHEETS.USERS);
  const users = sheetToObjects(sheet);

  // Find user with matching email and password
  const user = users.find(u => u.email === data.email && u.password === data.password);

  if (user) {
    return jsonResponse({
      success: true,
      user: {
        userId: user.userID,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } else {
    return jsonResponse({ success: false, message: 'Invalid email or password' });
  }
}

/**
 * Get all users (Admin only)
 */
function getAllUsers() {
  const sheet = getSheet(SHEETS.USERS);
  const users = sheetToObjects(sheet);

  // Remove password from response
  const safeUsers = users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });

  return jsonResponse({ success: true, users: safeUsers });
}

// ==================== ORDER ENDPOINTS ====================

/**
 * Create new order
 */
function createOrder(data) {
  const sheet = getSheet(SHEETS.ORDERS);

  // Generate order ID
  const orderId = generateId('ORD');
  const orderDate = new Date().toISOString();

  // Add order to sheet
  sheet.appendRow([
    orderId,
    data.userEmail,
    data.planName,
    data.price,
    'pending',
    data.paymentScreenshot || '',
    data.transactionId || '',
    orderDate
  ]);

  // Send notification email
  sendEmail(
    ADMIN_EMAIL,
    'New Order Received - RDP.SALE',
    `<h2>New Order</h2>
     <p><strong>Order ID:</strong> ${orderId}</p>
     <p><strong>Customer:</strong> ${data.userEmail}</p>
     <p><strong>Plan:</strong> ${data.planName}</p>
     <p><strong>Price:</strong> Rs ${data.price.toLocaleString()}</p>
     <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
     <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleString()}</p>
     <p>Please review the payment screenshot and update the order status.</p>`
  );

  return jsonResponse({
    success: true,
    orderId: orderId,
    message: 'Order created successfully'
  });
}

/**
 * Get orders for a specific user
 */
function getOrders(email) {
  const ordersSheet = getSheet(SHEETS.ORDERS);
  const serversSheet = getSheet(SHEETS.SERVER_DETAILS);

  const orders = sheetToObjects(ordersSheet);
  const servers = sheetToObjects(serversSheet);

  // Filter orders by email
  const userOrders = orders.filter(order => order.userEmail === email);

  // Add server details to orders
  const ordersWithServers = userOrders.map(order => {
    const server = servers.find(s => s.orderID === order.orderID);
    if (server) {
      return {
        ...order,
        serverIp: server.serverIP,
        serverUsername: server.username,
        serverPassword: server.password,
        serverStatus: server.status
      };
    }
    return order;
  });

  return jsonResponse({ success: true, orders: ordersWithServers });
}

/**
 * Get all orders (Admin only)
 */
function getAllOrders() {
  const sheet = getSheet(SHEETS.ORDERS);
  const orders = sheetToObjects(sheet);

  return jsonResponse({ success: true, orders: orders });
}

/**
 * Update order status (Admin only)
 */
function updateOrderStatus(data) {
  const sheet = getSheet(SHEETS.ORDERS);
  const rowNumber = findRowByValue(sheet, 1, data.orderId); // OrderID is column 1

  if (rowNumber < 0) {
    return jsonResponse({ success: false, message: 'Order not found' });
  }

  // Update status (column 5)
  sheet.getRange(rowNumber, 5).setValue(data.status);

  return jsonResponse({ success: true, message: 'Order status updated' });
}

// ==================== SERVER ENDPOINTS ====================

/**
 * Add server details (Admin only)
 */
function addServerDetails(data) {
  const ordersSheet = getSheet(SHEETS.ORDERS);
  const serversSheet = getSheet(SHEETS.SERVER_DETAILS);

  // Verify order exists
  const orderRow = findRowByValue(ordersSheet, 1, data.orderId);
  if (orderRow < 0) {
    return jsonResponse({ success: false, message: 'Order not found' });
  }

  // Get user email from order
  const userEmail = ordersSheet.getRange(orderRow, 2).getValue();

  // Check if server details already exist
  const existingServer = findRowByValue(serversSheet, 1, data.orderId);

  const lastUpdated = new Date().toISOString();

  if (existingServer > 0) {
    // Update existing server details
    serversSheet.getRange(existingServer, 3).setValue(data.serverIp);
    serversSheet.getRange(existingServer, 4).setValue(data.username);
    serversSheet.getRange(existingServer, 5).setValue(data.password);
    serversSheet.getRange(existingServer, 7).setValue(lastUpdated);
  } else {
    // Add new server details
    serversSheet.appendRow([
      data.orderId,
      userEmail,
      data.serverIp,
      data.username,
      data.password,
      'active',
      lastUpdated
    ]);
  }

  return jsonResponse({ success: true, message: 'Server details added successfully' });
}

/**
 * Get all servers (Admin only)
 */
function getAllServers() {
  const sheet = getSheet(SHEETS.SERVER_DETAILS);
  const servers = sheetToObjects(sheet);

  return jsonResponse({ success: true, servers: servers });
}

// ==================== ACTION REQUEST ENDPOINTS ====================

/**
 * Create server action request
 */
function createServerAction(data) {
  const sheet = getSheet(SHEETS.ACTION_REQUESTS);

  // Generate request ID
  const requestId = generateId('REQ');
  const requestTime = new Date().toISOString();

  // Add action request to sheet
  sheet.appendRow([
    requestId,
    data.orderId,
    data.userEmail,
    data.action,
    requestTime,
    'pending',
    ''
  ]);

  // Send notification email
  sendEmail(
    ADMIN_EMAIL,
    `Server Action Request: ${data.action} - RDP.SALE`,
    `<h2>Server Action Request</h2>
     <p><strong>Request ID:</strong> ${requestId}</p>
     <p><strong>Order ID:</strong> ${data.orderId}</p>
     <p><strong>Customer:</strong> ${data.userEmail}</p>
     <p><strong>Action:</strong> ${data.action}</p>
     <p><strong>Time:</strong> ${new Date(requestTime).toLocaleString()}</p>
     <p>Please process this request as soon as possible.</p>`
  );

  return jsonResponse({
    success: true,
    requestId: requestId,
    message: 'Action request submitted successfully'
  });
}

/**
 * Get all action requests (Admin only)
 */
function getAllActionRequests() {
  const sheet = getSheet(SHEETS.ACTION_REQUESTS);
  const actions = sheetToObjects(sheet);

  return jsonResponse({ success: true, actions: actions });
}

/**
 * Update action request status (Admin only)
 */
function updateActionRequest(data) {
  const sheet = getSheet(SHEETS.ACTION_REQUESTS);
  const rowNumber = findRowByValue(sheet, 1, data.requestId); // RequestID is column 1

  if (rowNumber < 0) {
    return jsonResponse({ success: false, message: 'Action request not found' });
  }

  // Update status (column 6) and completed time (column 7)
  sheet.getRange(rowNumber, 6).setValue(data.status);

  if (data.status === 'completed') {
    sheet.getRange(rowNumber, 7).setValue(new Date().toISOString());
  }

  return jsonResponse({ success: true, message: 'Action request updated' });
}

// ==================== TEST FUNCTION ====================

/**
 * Test function to initialize all sheets
 * Run this once to set up the sheets
 */
function initializeAllSheets() {
  const ss = getSpreadsheet();

  // Create or get all sheets
  Object.values(SHEETS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    // Clear and reinitialize
    sheet.clear();
    initializeSheet(sheet, sheetName);
  });

  Logger.log('All sheets initialized successfully!');
}

/**
 * Test function to add sample data
 */
function addSampleData() {
  // Add sample user
  const usersSheet = getSheet(SHEETS.USERS);
  usersSheet.appendRow([
    'USER-TEST-001',
    'John Doe',
    'john@example.com',
    '03001234567',
    '123 Test Street, Karachi',
    'password123',
    new Date().toISOString(),
    'true'
  ]);

  // Add sample order
  const ordersSheet = getSheet(SHEETS.ORDERS);
  ordersSheet.appendRow([
    'ORD-TEST-001',
    'john@example.com',
    'Basic',
    2799,
    'active',
    'base64_image_data_here',
    'TXN123456789',
    new Date().toISOString()
  ]);

  // Add sample server
  const serversSheet = getSheet(SHEETS.SERVER_DETAILS);
  serversSheet.appendRow([
    'ORD-TEST-001',
    'john@example.com',
    '192.168.1.100',
    'admin',
    'SecurePass123',
    'active',
    new Date().toISOString()
  ]);

  Logger.log('Sample data added successfully!');
}
