# Google Sheets Setup Guide

## Overview
This document explains how to set up the Google Sheets database for your e-commerce store.

## Creating Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **E-Commerce Store Database**
4. Create three separate sheets (tabs) as described below

---

## Sheet 1: Products

**Sheet Name:** `Products`

### Column Headers (Row 1):
```
product_id | image_url | name | description | price | offer_price | stock_quantity | status | created_at
```

### Column Details:

| Column Name | Description | Example Value | Required |
|------------|-------------|---------------|----------|
| **product_id** | Unique product identifier | `PROD_001` | Yes |
| **image_url** | Full URL to product image | `https://example.com/image.jpg` | Yes |
| **name** | Product name | `Wireless Headphones` | Yes |
| **description** | Product description | `Premium noise-cancelling headphones` | Yes |
| **price** | Original price (₹) | `2999` | Yes |
| **offer_price** | Discounted price (₹) | `1999` | No (leave blank if no discount) |
| **stock_quantity** | Available stock | `50` | Yes |
| **status** | Product visibility | `ACTIVE` or `HIDDEN` | Yes |
| **created_at** | Date added | `2024-01-15` | Yes |

### Sample Data:

| product_id | image_url | name | description | price | offer_price | stock_quantity | status | created_at |
|-----------|-----------|------|-------------|-------|-------------|----------------|--------|------------|
| PROD_001 | https://via.placeholder.com/300 | Wireless Headphones | Premium noise-cancelling headphones with 30hr battery | 2999 | 1999 | 50 | ACTIVE | 2024-01-15 |
| PROD_002 | https://via.placeholder.com/300 | Smart Watch | Fitness tracker with heart rate monitor | 4999 | 3499 | 30 | ACTIVE | 2024-01-15 |
| PROD_003 | https://via.placeholder.com/300 | Bluetooth Speaker | Portable waterproof speaker with deep bass | 1499 | 999 | 100 | ACTIVE | 2024-01-15 |
| PROD_004 | https://via.placeholder.com/300 | Phone Case | Durable shock-proof case for all models | 299 | | 200 | ACTIVE | 2024-01-15 |
| PROD_005 | https://via.placeholder.com/300 | USB Cable | Fast charging Type-C cable 2m | 199 | | 0 | ACTIVE | 2024-01-15 |

### Important Rules:
- **status = ACTIVE**: Product will be shown on website
- **status = HIDDEN**: Product will NOT be shown on website
- **stock_quantity = 0**: Shows "Out of Stock" (Add to Cart disabled)
- **offer_price**: Leave blank if no discount, otherwise must be less than price

---

## Sheet 2: Users

**Sheet Name:** `Users`

### Column Headers (Row 1):
```
user_id | full_name | email | phone | password_hash | created_at
```

### Column Details:

| Column Name | Description | Example Value |
|------------|-------------|---------------|
| **user_id** | Unique user identifier (auto-generated) | `USER_1705334567890` |
| **full_name** | Customer's full name | `John Doe` |
| **email** | Customer's email address | `john@example.com` |
| **phone** | Customer's phone number | `9876543210` |
| **password_hash** | Encrypted password (auto-generated) | `a3d5f7...` |
| **created_at** | Account creation date (auto-generated) | `Sat Jan 15 2024 10:30:45` |

### Sample Data:

| user_id | full_name | email | phone | password_hash | created_at |
|---------|-----------|-------|-------|---------------|------------|
| USER_1705334567890 | John Doe | john@example.com | 9876543210 | [auto-hashed] | Sat Jan 15 2024 10:30:45 |

**Note:** This sheet is automatically populated when users sign up. You don't need to add data manually.

---

## Sheet 3: Orders

**Sheet Name:** `Orders`

### Column Headers (Row 1):
```
order_id | user_id | email | phone | city | address | items_json | total_amount | payment_method | status | created_at
```

### Column Details:

| Column Name | Description | Example Value |
|------------|-------------|---------------|
| **order_id** | Unique order identifier (auto-generated) | `ORD_1705334567890` |
| **user_id** | Customer's user ID | `USER_1705334567890` |
| **email** | Customer's email | `john@example.com` |
| **phone** | Delivery phone number | `9876543210` |
| **city** | Delivery city | `Mumbai` |
| **address** | Complete delivery address | `123 Main St, Andheri` |
| **items_json** | Order items in JSON format | `[{"product_id":"PROD_001"...}]` |
| **total_amount** | Total order value (₹) | `1999` |
| **payment_method** | Payment type | `COD` |
| **status** | Order status | `Pending` |
| **created_at** | Order date (auto-generated) | `Sat Jan 15 2024 14:30:45` |

### Order Status Values (Admin Updates These):

| Status | Description | When to Use |
|--------|-------------|-------------|
| **Pending** | Order received (default) | Automatically set when order is placed |
| **Processing** | Preparing the order | When you start packing the order |
| **Out For Delivery** | Order dispatched | When order is handed to delivery person |
| **Delivered** | Successfully delivered | After customer receives the order |
| **Cancelled** | Order cancelled | If order is cancelled |

### Sample Data:

| order_id | user_id | email | phone | city | address | items_json | total_amount | payment_method | status | created_at |
|----------|---------|-------|-------|------|---------|------------|--------------|----------------|--------|------------|
| ORD_1705334567890 | USER_1705334567890 | john@example.com | 9876543210 | Mumbai | 123 Main St, Andheri, Mumbai 400053 | [{"product_id":"PROD_001","name":"Wireless Headphones","quantity":1,"price":1999}] | 1999 | COD | Pending | Sat Jan 15 2024 14:30:45 |

**Note:** This sheet is automatically populated when customers place orders.

---

## Admin Tasks

### How to Manage Products:

1. **Add New Product:**
   - Add a new row in the Products sheet
   - Fill all required columns
   - Set status = `ACTIVE`

2. **Update Product Price:**
   - Edit the price or offer_price column
   - Changes reflect immediately on website

3. **Mark Product Out of Stock:**
   - Set stock_quantity = `0`

4. **Hide Product:**
   - Change status from `ACTIVE` to `HIDDEN`

### How to Manage Orders:

1. **View New Orders:**
   - Check the Orders sheet regularly
   - You'll also receive email notifications

2. **Update Order Status:**
   - Simply change the status column value
   - Customer can see updated status in their dashboard

3. **Order Workflow:**
   ```
   Pending → Processing → Out For Delivery → Delivered
   ```

---

## Quick Setup Checklist

- [ ] Create new Google Spreadsheet
- [ ] Create 3 sheets: Products, Users, Orders
- [ ] Add column headers to each sheet (exact spelling required)
- [ ] Add at least 3-5 sample products
- [ ] Set all sample products status to ACTIVE
- [ ] Note down the Spreadsheet ID (from URL)
- [ ] Update SPREADSHEET_ID in Code.gs
- [ ] Update ADMIN_EMAIL in Code.gs
- [ ] Deploy the Apps Script as Web App
- [ ] Test by adding a product manually

---

## Tips

1. **Product Images:**
   - Use free image hosting: [Imgur](https://imgur.com), [Cloudinary](https://cloudinary.com)
   - Or use placeholder: `https://via.placeholder.com/300`

2. **Column Names:**
   - Must match exactly (case-sensitive)
   - Don't add extra spaces

3. **Product IDs:**
   - Use format: `PROD_001`, `PROD_002`, etc.
   - Must be unique

4. **Prices:**
   - Enter numbers only (no ₹ symbol)
   - Example: `1999` not `₹1999`

5. **Status Values:**
   - Only use: `ACTIVE` or `HIDDEN` (case-sensitive)

---

## Troubleshooting

**Products not showing on website?**
- Check status is set to `ACTIVE`
- Verify column headers are spelled correctly
- Check SPREADSHEET_ID is correct in Code.gs

**Orders not saving?**
- Verify Orders sheet exists
- Check column headers match exactly
- Check Apps Script permissions

**Images not loading?**
- Verify image URLs are publicly accessible
- Try using placeholder URLs for testing

---

## Next Steps

After setting up your sheets:
1. Continue to README.md for deployment instructions
2. Deploy the Google Apps Script
3. Configure the frontend with your Web App URL
4. Test the complete flow
