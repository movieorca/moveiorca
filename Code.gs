/**
 * E-Commerce Store - Google Apps Script Backend
 * This script handles all backend operations for the store
 * Deploy as Web App with access set to "Anyone"
 */

// ====================
// CONFIGURATION
// ====================

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your Google Sheet ID
const ADMIN_EMAIL = 'your-admin@email.com'; // Replace with admin email for notifications

// Sheet names
const SHEETS = {
  PRODUCTS: 'Products',
  USERS: 'Users',
  ORDERS: 'Orders'
};

// ====================
// MAIN ENTRY POINTS
// ====================

/**
 * Main GET handler
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    switch(action) {
      case 'products':
        return getProducts();
      case 'getOrders':
        return getOrders(e.parameter.token);
      default:
        return createResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Main POST handler
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch(action) {
      case 'signup':
        return signup(data);
      case 'login':
        return login(data);
      case 'createOrder':
        return createOrder(data);
      default:
        return createResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// ====================
// PRODUCT ENDPOINTS
// ====================

/**
 * Get all active products
 */
function getProducts() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.PRODUCTS);

    if (!sheet) {
      return createResponse({ error: 'Products sheet not found' }, 500);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const products = [];

    // Find column indexes
    const colIndexes = {
      product_id: headers.indexOf('product_id'),
      image_url: headers.indexOf('image_url'),
      name: headers.indexOf('name'),
      description: headers.indexOf('description'),
      price: headers.indexOf('price'),
      offer_price: headers.indexOf('offer_price'),
      stock_quantity: headers.indexOf('stock_quantity'),
      status: headers.indexOf('status'),
      created_at: headers.indexOf('created_at')
    };

    // Build products array (skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Only include ACTIVE products
      if (row[colIndexes.status] === 'ACTIVE') {
        products.push({
          product_id: row[colIndexes.product_id],
          image_url: row[colIndexes.image_url],
          name: row[colIndexes.name],
          description: row[colIndexes.description],
          price: parseFloat(row[colIndexes.price]) || 0,
          offer_price: parseFloat(row[colIndexes.offer_price]) || 0,
          stock_quantity: parseInt(row[colIndexes.stock_quantity]) || 0,
          status: row[colIndexes.status],
          created_at: row[colIndexes.created_at]
        });
      }
    }

    return createResponse({ success: true, products: products });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// ====================
// USER ENDPOINTS
// ====================

/**
 * User signup
 */
function signup(data) {
  try {
    const { full_name, email, phone, password } = data;

    // Validation
    if (!full_name || !email || !phone || !password) {
      return createResponse({ error: 'All fields are required' }, 400);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);

    if (!sheet) {
      return createResponse({ error: 'Users sheet not found' }, 500);
    }

    // Check if email already exists
    const data_rows = sheet.getDataRange().getValues();
    const emailCol = data_rows[0].indexOf('email');

    for (let i = 1; i < data_rows.length; i++) {
      if (data_rows[i][emailCol] === email) {
        return createResponse({ error: 'Email already registered' }, 400);
      }
    }

    // Generate user ID
    const user_id = 'USER_' + new Date().getTime();

    // Hash password (simple hash for demonstration - use stronger hashing in production)
    const password_hash = hashPassword(password);

    // Add user to sheet
    sheet.appendRow([
      user_id,
      full_name,
      email,
      phone,
      password_hash,
      new Date()
    ]);

    // Generate token
    const token = generateToken(user_id, email);

    return createResponse({
      success: true,
      message: 'Account created successfully',
      token: token,
      user: {
        user_id: user_id,
        full_name: full_name,
        email: email,
        phone: phone
      }
    });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * User login
 */
function login(data) {
  try {
    const { email, password } = data;

    // Validation
    if (!email || !password) {
      return createResponse({ error: 'Email and password are required' }, 400);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);

    if (!sheet) {
      return createResponse({ error: 'Users sheet not found' }, 500);
    }

    const data_rows = sheet.getDataRange().getValues();
    const headers = data_rows[0];

    // Find column indexes
    const colIndexes = {
      user_id: headers.indexOf('user_id'),
      full_name: headers.indexOf('full_name'),
      email: headers.indexOf('email'),
      phone: headers.indexOf('phone'),
      password_hash: headers.indexOf('password_hash')
    };

    // Find user
    for (let i = 1; i < data_rows.length; i++) {
      const row = data_rows[i];

      if (row[colIndexes.email] === email) {
        // Check password
        const password_hash = hashPassword(password);

        if (row[colIndexes.password_hash] === password_hash) {
          // Login successful
          const token = generateToken(row[colIndexes.user_id], email);

          return createResponse({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
              user_id: row[colIndexes.user_id],
              full_name: row[colIndexes.full_name],
              email: row[colIndexes.email],
              phone: row[colIndexes.phone]
            }
          });
        } else {
          return createResponse({ error: 'Invalid password' }, 401);
        }
      }
    }

    return createResponse({ error: 'User not found' }, 404);
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// ====================
// ORDER ENDPOINTS
// ====================

/**
 * Create new order
 */
function createOrder(data) {
  try {
    const { token, full_name, phone, city, address, items, total_amount } = data;

    // Validation
    if (!token || !full_name || !phone || !city || !address || !items || !total_amount) {
      return createResponse({ error: 'All fields are required' }, 400);
    }

    // Verify token
    const userInfo = verifyToken(token);
    if (!userInfo) {
      return createResponse({ error: 'Invalid token' }, 401);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.ORDERS);

    if (!sheet) {
      return createResponse({ error: 'Orders sheet not found' }, 500);
    }

    // Generate order ID
    const order_id = 'ORD_' + new Date().getTime();

    // Add order to sheet
    sheet.appendRow([
      order_id,
      userInfo.user_id,
      userInfo.email,
      phone,
      city,
      address,
      JSON.stringify(items),
      total_amount,
      'COD',
      'Pending',
      new Date()
    ]);

    // Send emails
    sendOrderEmailToAdmin(order_id, full_name, phone, city, address, items, total_amount);
    sendOrderConfirmationToUser(userInfo.email, order_id, full_name, items, total_amount);

    return createResponse({
      success: true,
      message: 'Order placed successfully',
      order_id: order_id
    });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

/**
 * Get user orders
 */
function getOrders(token) {
  try {
    // Verify token
    const userInfo = verifyToken(token);
    if (!userInfo) {
      return createResponse({ error: 'Invalid token' }, 401);
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.ORDERS);

    if (!sheet) {
      return createResponse({ error: 'Orders sheet not found' }, 500);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const orders = [];

    // Find column indexes
    const colIndexes = {
      order_id: headers.indexOf('order_id'),
      user_id: headers.indexOf('user_id'),
      email: headers.indexOf('email'),
      phone: headers.indexOf('phone'),
      city: headers.indexOf('city'),
      address: headers.indexOf('address'),
      items_json: headers.indexOf('items_json'),
      total_amount: headers.indexOf('total_amount'),
      payment_method: headers.indexOf('payment_method'),
      status: headers.indexOf('status'),
      created_at: headers.indexOf('created_at')
    };

    // Build orders array for this user
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (row[colIndexes.user_id] === userInfo.user_id) {
        orders.push({
          order_id: row[colIndexes.order_id],
          phone: row[colIndexes.phone],
          city: row[colIndexes.city],
          address: row[colIndexes.address],
          items: JSON.parse(row[colIndexes.items_json]),
          total_amount: parseFloat(row[colIndexes.total_amount]) || 0,
          payment_method: row[colIndexes.payment_method],
          status: row[colIndexes.status],
          created_at: row[colIndexes.created_at]
        });
      }
    }

    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return createResponse({ success: true, orders: orders });
  } catch (error) {
    return createResponse({ error: error.toString() }, 500);
  }
}

// ====================
// HELPER FUNCTIONS
// ====================

/**
 * Create JSON response with CORS headers
 */
function createResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // Enable CORS
  return output;
}

/**
 * Simple password hashing (use stronger method in production)
 */
function hashPassword(password) {
  // This is a simple hash - in production, use a proper hashing library
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  return hash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

/**
 * Generate authentication token
 */
function generateToken(user_id, email) {
  const tokenData = {
    user_id: user_id,
    email: email,
    timestamp: new Date().getTime()
  };

  // Simple token encoding (use JWT in production)
  return Utilities.base64Encode(JSON.stringify(tokenData));
}

/**
 * Verify authentication token
 */
function verifyToken(token) {
  try {
    const decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Send order notification to admin
 */
function sendOrderEmailToAdmin(order_id, customer_name, phone, city, address, items, total) {
  try {
    let itemsHtml = '';
    items.forEach(item => {
      itemsHtml += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${item.quantity * item.price}</td>
        </tr>
      `;
    });

    const htmlBody = `
      <h2>New Order Received - ${order_id}</h2>
      <h3>Customer Details:</h3>
      <p>
        <strong>Name:</strong> ${customer_name}<br>
        <strong>Phone:</strong> ${phone}<br>
        <strong>City:</strong> ${city}<br>
        <strong>Address:</strong> ${address}
      </p>

      <h3>Order Items:</h3>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
        ${itemsHtml}
        <tr>
          <td colspan="3"><strong>Total</strong></td>
          <td><strong>₹${total}</strong></td>
        </tr>
      </table>

      <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
      <p><em>Please update the order status in the Google Sheet.</em></p>
    `;

    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Order: ${order_id}`,
      htmlBody: htmlBody
    });
  } catch (error) {
    Logger.log('Error sending admin email: ' + error);
  }
}

/**
 * Send order confirmation to user
 */
function sendOrderConfirmationToUser(email, order_id, customer_name, items, total) {
  try {
    let itemsHtml = '';
    items.forEach(item => {
      itemsHtml += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>₹${item.quantity * item.price}</td>
        </tr>
      `;
    });

    const htmlBody = `
      <h2>Order Confirmation</h2>
      <p>Dear ${customer_name},</p>
      <p>Thank you for your order! Your order has been received and is being processed.</p>

      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order_id}</p>

      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
        ${itemsHtml}
        <tr>
          <td colspan="3"><strong>Total</strong></td>
          <td><strong>₹${total}</strong></td>
        </tr>
      </table>

      <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
      <p>You can track your order status from your dashboard.</p>

      <p>Thank you for shopping with us!</p>
    `;

    MailApp.sendEmail({
      to: email,
      subject: `Order Confirmation - ${order_id}`,
      htmlBody: htmlBody
    });
  } catch (error) {
    Logger.log('Error sending user email: ' + error);
  }
}
