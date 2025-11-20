# API Documentation - RDP.SALE

Complete API reference for the RDP Sales Management System backend.

## Base URL

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Replace `YOUR_DEPLOYMENT_ID` with your actual Google Apps Script deployment ID.

## Authentication

Currently, the API uses email/password authentication stored in Google Sheets. For production, consider implementing:
- JWT tokens
- OAuth 2.0
- API keys for admin endpoints

## Request Format

All POST requests should use `Content-Type: application/json`.

GET requests use URL parameters.

## Response Format

All responses are JSON:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Success or error message"
}
```

---

## Customer Panel Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /exec?action=register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "03001234567",
  "address": "123 Main Street, Karachi",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "userId": "USER-1234567890-5678",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "address": "123 Main Street, Karachi"
  }
}
```

**Response (Error - Email Exists):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Side Effects:**
- Creates new row in Users sheet
- Sends email notification to admin
- Password stored in plain text (consider hashing for production)

---

### 2. Login User

Authenticate user and return user details.

**Endpoint:** `POST /exec?action=login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "userId": "USER-1234567890-5678",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "address": "123 Main Street, Karachi"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Notes:**
- Password is not returned in response
- No session token generated (implement JWT for production)

---

### 3. Create Order

Create a new order with payment details.

**Endpoint:** `POST /exec?action=createOrder`

**Request Body:**
```json
{
  "userEmail": "john@example.com",
  "planName": "Basic",
  "price": 2799,
  "paymentScreenshot": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "transactionId": "TXN123456789"
}
```

**Field Details:**
- `paymentScreenshot`: Base64 encoded image string
- `transactionId`: Easypaisa transaction ID
- `price`: Amount in PKR (number)

**Response (Success):**
```json
{
  "success": true,
  "orderId": "ORD-1234567890-1234",
  "message": "Order created successfully"
}
```

**Side Effects:**
- Creates new row in Orders sheet with status "pending"
- Sends email notification to admin with order details
- Payment screenshot stored as base64 string

---

### 4. Get User Orders

Retrieve all orders for a specific user with server details.

**Endpoint:** `GET /exec?action=getOrders&email=john@example.com`

**URL Parameters:**
- `email` (required): User's email address

**Response (Success):**
```json
{
  "success": true,
  "orders": [
    {
      "orderID": "ORD-1234567890-1234",
      "userEmail": "john@example.com",
      "planName": "Basic",
      "price": 2799,
      "status": "active",
      "paymentScreenshot": "data:image/png;base64,...",
      "transactionID": "TXN123456789",
      "orderDate": "2025-01-15T10:30:00.000Z",
      "serverIp": "192.168.1.100",
      "serverUsername": "admin",
      "serverPassword": "SecurePass123",
      "serverStatus": "active"
    }
  ]
}
```

**Status Values:**
- `pending`: Payment under review
- `processing`: Server being set up (~30 minutes)
- `active`: Server is active and ready
- `suspended`: Server suspended

**Notes:**
- Server details only present when status is "active"
- Orders sorted by date (newest first)

---

### 5. Create Server Action Request

Submit a server control action (Start/Stop/Restart).

**Endpoint:** `POST /exec?action=serverAction`

**Request Body:**
```json
{
  "orderId": "ORD-1234567890-1234",
  "userEmail": "john@example.com",
  "action": "Start"
}
```

**Action Values:**
- `Start`: Start the server
- `Stop`: Stop the server
- `Restart`: Restart the server

**Response (Success):**
```json
{
  "success": true,
  "requestId": "REQ-1234567890-7890",
  "message": "Action request submitted successfully"
}
```

**Side Effects:**
- Creates new row in ActionRequests sheet with status "pending"
- Sends email notification to admin
- Customer receives confirmation (~9 minutes processing time)

---

## Admin Panel Endpoints

### 6. Get All Users

Retrieve all registered users (Admin only).

**Endpoint:** `GET /exec?action=getAllUsers`

**Response (Success):**
```json
{
  "success": true,
  "users": [
    {
      "userID": "USER-1234567890-5678",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567",
      "address": "123 Main Street, Karachi",
      "registrationDate": "2025-01-15T08:00:00.000Z",
      "emailVerified": "false"
    }
  ]
}
```

**Notes:**
- Password field is excluded for security
- Users sorted by registration date
- Returns all users (no pagination currently)

---

### 7. Get All Orders

Retrieve all orders from all users (Admin only).

**Endpoint:** `GET /exec?action=getAllOrders`

**Response (Success):**
```json
{
  "success": true,
  "orders": [
    {
      "orderID": "ORD-1234567890-1234",
      "userEmail": "john@example.com",
      "planName": "Basic",
      "price": 2799,
      "status": "pending",
      "paymentScreenshot": "data:image/png;base64,...",
      "transactionID": "TXN123456789",
      "orderDate": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Use Cases:**
- Display orders table in admin panel
- Calculate statistics (total revenue, pending orders, etc.)
- Filter/search orders

---

### 8. Update Order Status

Change the status of an order (Admin only).

**Endpoint:** `POST /exec?action=updateOrderStatus`

**Request Body:**
```json
{
  "orderId": "ORD-1234567890-1234",
  "status": "processing"
}
```

**Valid Status Values:**
- `pending`: Awaiting payment verification
- `processing`: Payment verified, setting up server
- `active`: Server deployed and active
- `suspended`: Server suspended

**Response (Success):**
```json
{
  "success": true,
  "message": "Order status updated"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Workflow:**
1. Admin verifies payment screenshot
2. Changes status from "pending" to "processing"
3. Admin sets up server
4. Admin adds server details
5. Admin changes status to "active"

---

### 9. Get All Servers

Retrieve all server configurations (Admin only).

**Endpoint:** `GET /exec?action=getAllServers`

**Response (Success):**
```json
{
  "success": true,
  "servers": [
    {
      "orderID": "ORD-1234567890-1234",
      "userEmail": "john@example.com",
      "serverIP": "192.168.1.100",
      "username": "admin",
      "password": "SecurePass123",
      "status": "active",
      "lastUpdated": "2025-01-15T12:00:00.000Z"
    }
  ]
}
```

**Notes:**
- One server per order
- Passwords stored in plain text (secure Google Sheets access)

---

### 10. Add Server Details

Add or update server credentials for an order (Admin only).

**Endpoint:** `POST /exec?action=addServerDetails`

**Request Body:**
```json
{
  "orderId": "ORD-1234567890-1234",
  "serverIp": "192.168.1.100",
  "username": "admin",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Server details added successfully"
}
```

**Response (Error - Order Not Found):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Behavior:**
- If server details exist for orderId, they are updated
- If not, new server details are created
- UserEmail is fetched from the order automatically
- Status set to "active" by default
- LastUpdated timestamp recorded

---

### 11. Get All Action Requests

Retrieve all server action requests (Admin only).

**Endpoint:** `GET /exec?action=getAllActionRequests`

**Response (Success):**
```json
{
  "success": true,
  "actions": [
    {
      "requestID": "REQ-1234567890-7890",
      "orderID": "ORD-1234567890-1234",
      "userEmail": "john@example.com",
      "action": "Start",
      "requestTime": "2025-01-15T14:00:00.000Z",
      "status": "pending",
      "completedTime": ""
    }
  ]
}
```

**Action Types:**
- `Start`: Customer wants to start server
- `Stop`: Customer wants to stop server
- `Restart`: Customer wants to restart server

**Status Values:**
- `pending`: Action not yet performed
- `completed`: Action completed by admin

---

### 12. Update Action Request

Mark an action request as completed (Admin only).

**Endpoint:** `POST /exec?action=updateActionRequest`

**Request Body:**
```json
{
  "requestId": "REQ-1234567890-7890",
  "status": "completed"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Action request updated"
}
```

**Side Effects:**
- Status changed to "completed"
- CompletedTime timestamp recorded
- Customer can see updated status in dashboard

---

## Error Handling

### Common Error Responses

**Invalid Endpoint:**
```json
{
  "success": false,
  "message": "Invalid endpoint"
}
```

**Missing Parameters:**
```json
{
  "success": false,
  "message": "Missing required parameter: email"
}
```

**Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Error Codes (HTTP Status)

All responses return HTTP 200. Check the `success` field to determine if request succeeded.

For production, consider implementing proper HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

---

## Rate Limiting

Currently no rate limiting implemented. For production:
- Implement per-IP rate limiting
- Implement per-user rate limiting
- Use API keys for admin endpoints
- Track API usage in separate sheet

---

## Data Validation

### Email Validation
- Must contain @ symbol
- Must have domain
- Case-insensitive comparison

### Password Requirements
- Minimum 6 characters (consider increasing to 8+)
- No special character requirements (add for production)

### Price Validation
- Must be positive number
- Stored as integer (no decimal places)

### Order Status Validation
- Must be one of: pending, processing, active, suspended
- Case-sensitive

---

## Best Practices

### For Frontend Developers

1. **Always check `success` field** before accessing data
2. **Handle network errors** with try-catch
3. **Show loading states** during API calls
4. **Cache data** when appropriate
5. **Validate input** before sending to API
6. **Display user-friendly error messages**

### Example Error Handling:

```javascript
try {
  const response = await fetch(API_URL + '/exec?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    // Handle success
    console.log('Login successful', data.user);
  } else {
    // Handle API error
    console.error('Login failed:', data.message);
    alert(data.message);
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
  alert('Connection failed. Please check your internet.');
}
```

---

## Testing

### Test Endpoints with cURL

**Register User:**
```bash
curl -X POST YOUR_API_URL \
  -H "Content-Type: application/json" \
  -d '{"action":"register","name":"Test User","email":"test@example.com","phone":"1234567890","address":"Test Address","password":"test123"}'
```

**Login:**
```bash
curl -X POST YOUR_API_URL \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@example.com","password":"test123"}'
```

**Get Orders:**
```bash
curl "YOUR_API_URL?action=getOrders&email=test@example.com"
```

### Test with Postman

1. Import the API endpoints
2. Set base URL variable
3. Create test cases for each endpoint
4. Test success and error scenarios

---

## Database Schema

### Users Sheet
| Column | Type | Description |
|--------|------|-------------|
| UserID | String | Unique user identifier |
| Name | String | Full name |
| Email | String | Email address (unique) |
| Phone | String | Phone number |
| Address | String | Full address |
| Password | String | Password (plain text) |
| RegistrationDate | ISO Date | Account creation date |
| EmailVerified | Boolean String | "true" or "false" |

### Orders Sheet
| Column | Type | Description |
|--------|------|-------------|
| OrderID | String | Unique order identifier |
| UserEmail | String | Customer email |
| PlanName | String | RDP plan name |
| Price | Number | Price in PKR |
| Status | String | Order status |
| PaymentScreenshot | String | Base64 image |
| TransactionID | String | Payment transaction ID |
| OrderDate | ISO Date | Order creation date |

### ServerDetails Sheet
| Column | Type | Description |
|--------|------|-------------|
| OrderID | String | Associated order ID |
| UserEmail | String | Customer email |
| ServerIP | String | Server IP address |
| Username | String | RDP username |
| Password | String | RDP password |
| Status | String | Server status |
| LastUpdated | ISO Date | Last update time |

### ActionRequests Sheet
| Column | Type | Description |
|--------|------|-------------|
| RequestID | String | Unique request identifier |
| OrderID | String | Associated order ID |
| UserEmail | String | Customer email |
| Action | String | Start/Stop/Restart |
| RequestTime | ISO Date | Request creation time |
| Status | String | pending/completed |
| CompletedTime | ISO Date | Completion time |

---

## Migration Guide

### Moving to a Real Database

When scaling beyond Google Sheets:

1. **Choose Database**: PostgreSQL, MySQL, MongoDB
2. **Create Tables**: Match the sheet structure
3. **Migrate Data**: Export sheets to CSV, import to database
4. **Update Backend**: Rewrite Apps Script as Node.js/Python API
5. **Add Proper Auth**: Implement JWT or OAuth
6. **Add Validation**: Use schemas (Joi, Yup)
7. **Add Security**: Hash passwords, sanitize inputs
8. **Deploy API**: Use proper hosting (Heroku, DigitalOcean)

---

## Security Recommendations

### For Production:

1. **Hash Passwords**: Use bcrypt or similar
2. **Add API Authentication**: Implement JWT tokens
3. **Validate All Inputs**: Prevent injection attacks
4. **Rate Limit**: Prevent abuse
5. **Use HTTPS**: Always use secure connections
6. **Sanitize Output**: Prevent XSS attacks
7. **Add CORS**: Restrict to your domains only
8. **Audit Logs**: Track all API calls
9. **Regular Backups**: Automate sheet backups
10. **Monitor Usage**: Track suspicious activity

---

## Support

For API issues:
1. Check Apps Script execution logs
2. Verify endpoint and parameters
3. Test with sample data
4. Check Google Sheets permissions
5. Review error messages in browser console

---

## Changelog

### Version 1.0 (Current)
- Initial release
- Basic CRUD operations
- Email notifications
- No authentication tokens
- No rate limiting
