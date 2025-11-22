# Quick Start Guide - RDP E-Commerce Platform

## What Was Built

A complete, production-ready e-commerce platform for selling RDP/VPS hosting services with:

✅ **Customer Features:**
- Registration & authentication with email verification
- Browse and purchase RDP/VPS plans
- Shopping cart functionality
- Multiple payment options (Easypaisa, JazzCash)
- Customer dashboard to view orders, payments, and subscriptions
- Access to RDP/VPS credentials after purchase

✅ **Admin Features:**
- Dashboard with real-time statistics
- Order management and payment verification
- Customer management
- Plans management (create, edit, delete plans)
- RDP credential assignment to customers
- Payment gateway configuration

✅ **Technical Implementation:**
- Next.js 14 with TypeScript
- MySQL database with comprehensive schema
- JWT-based authentication
- Email notifications
- Payment gateway integrations
- Responsive UI with Tailwind CSS

## Getting Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE rdp_ecommerce;"

# Import schema
mysql -u root -p rdp_ecommerce < database/schema.sql
```

### 3. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Minimum required settings:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rdp_ecommerce

JWT_SECRET=your-random-secret-key
NEXTAUTH_SECRET=your-random-secret-key

EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Run Application

```bash
# Development mode
npm run dev
```

Visit: http://localhost:3000

### 5. Login to Admin Panel

```
URL: http://localhost:3000/auth/login
Email: admin@rdphosting.com
Password: admin123
```

**⚠️ Change this password immediately!**

## Project Structure Overview

```
moveiorca/
├── database/
│   └── schema.sql              # MySQL database schema
├── lib/
│   ├── db.ts                   # Database connection
│   ├── auth.ts                 # Authentication functions
│   ├── email.ts                # Email service
│   └── utils.ts                # Utility functions
├── middleware/
│   └── auth.ts                 # Auth middleware
├── pages/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication APIs
│   │   ├── admin/             # Admin APIs
│   │   ├── cart/              # Shopping cart
│   │   ├── orders/            # Order management
│   │   ├── payments/          # Payment processing
│   │   ├── plans/             # Plans API
│   │   └── subscriptions/     # Subscriptions
│   ├── auth/                  # Login/Register pages
│   ├── plans/                 # Plans listing page
│   └── index.tsx              # Homepage
├── types/
│   └── index.ts               # TypeScript definitions
└── styles/
    └── globals.css            # Global styles
```

## Key Features Explained

### Database Schema

The platform uses 11 tables:
- **users** - Customer and admin accounts
- **plans** - Hosting plans (RDP, VPS, Shared)
- **orders** - Customer orders
- **order_items** - Items in each order
- **subscriptions** - Active subscriptions
- **rdp_credentials** - RDP/VPS login info
- **payments** - Payment transactions
- **payment_settings** - Gateway configuration
- **cart_items** - Shopping cart
- **email_logs** - Email delivery tracking

### API Endpoints

**Authentication:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/verify?token=xxx` - Verify email
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

**Customer:**
- `GET /api/plans` - List all plans
- `GET /api/plans/:id` - Get plan details
- `POST /api/cart` - Add to cart
- `GET /api/cart` - View cart
- `POST /api/orders/create` - Create order
- `GET /api/orders` - My orders
- `GET /api/subscriptions` - My subscriptions

**Admin (requires admin role):**
- `GET /api/admin/dashboard` - Statistics
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/update` - Update order
- `GET /api/admin/customers` - All customers
- `POST /api/admin/plans/manage` - Create plan
- `PUT /api/admin/plans/manage` - Update plan
- `DELETE /api/admin/plans/manage` - Delete plan
- `POST /api/admin/rdp/assign` - Assign credentials
- `POST /api/admin/payment-settings` - Configure payments

### Payment Flow

1. Customer adds plan to cart
2. Proceeds to checkout
3. Selects payment method (Easypaisa/JazzCash)
4. Payment gateway processes payment
5. On success:
   - Order status updated to "paid"
   - Subscription created
   - Admin assigns RDP credentials
   - Customer receives credentials via email and panel

### Email Notifications

Automated emails for:
- ✉️ Email verification
- ✉️ Password reset
- ✉️ Order confirmation
- ✉️ Payment updates
- ✉️ Subscription expiry warnings

## Common Tasks

### Add a New Plan (via Admin Panel)

1. Login as admin
2. Navigate to Plans Management
3. Click "Add New Plan"
4. Fill in:
   - Name (e.g., "Premium RDP")
   - Category (RDP/VPS/Shared)
   - Price
   - Features (RAM, CPU, Storage, etc.)
5. Save

### Process an Order

1. Go to Orders module
2. Find pending order
3. Verify payment (if manual)
4. Update payment status to "Paid"
5. System automatically creates subscription
6. Assign RDP credentials in RDP Management
7. Customer receives email notification

### Assign RDP Credentials

1. Go to RDP Assignment module
2. Find active subscription
3. Enter:
   - Server IP
   - Port (default: 3389)
   - Username
   - Password
4. Save
5. Customer can now access credentials

## Testing the Platform

### Test Customer Flow

1. Register new account: http://localhost:3000/auth/register
2. Check email for verification link
3. Login after verification
4. Browse plans: http://localhost:3000/plans
5. Add plan to cart
6. Checkout and select payment method
7. View order in customer dashboard

### Test Admin Flow

1. Login as admin
2. View dashboard statistics
3. Check recent orders
4. Update order payment status
5. Assign RDP credentials
6. Verify customer receives notification

## Configuration

### Email Setup (Gmail Example)

1. Enable 2-factor authentication
2. Generate app password
3. Update .env:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Payment Gateway Setup

**Easypaisa:**
1. Get merchant credentials
2. Update in Admin Panel → Payment Settings
3. Or add to .env:
```env
EASYPAISA_MERCHANT_ID=xxx
EASYPAISA_API_KEY=xxx
EASYPAISA_SECRET_KEY=xxx
```

**JazzCash:**
1. Get merchant credentials
2. Configure via Admin Panel or .env
3. Use sandbox for testing

## Production Deployment

Quick production setup:

```bash
# 1. Build application
npm run build

# 2. Start with PM2
pm2 start npm --name "rdp-platform" -- start

# 3. Configure Nginx reverse proxy
# 4. Setup SSL with Let's Encrypt
# 5. Configure firewall
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

## Troubleshooting

**Database connection error:**
- Check MySQL is running
- Verify .env credentials
- Ensure database exists

**Email not sending:**
- Check SMTP credentials
- Verify app password (for Gmail)
- Check email_logs table

**Can't login:**
- Verify email is confirmed
- Check password
- Reset password if needed

**Payment not working:**
- Check payment gateway credentials
- Verify test/live mode
- Check payment_settings table

## Support & Resources

- **README.md** - Complete documentation
- **DEPLOYMENT.md** - Production deployment guide
- **database/schema.sql** - Database structure

## Security Checklist

✅ Change default admin password
✅ Use strong JWT secrets
✅ Enable HTTPS in production
✅ Configure firewall
✅ Regular database backups
✅ Keep dependencies updated
✅ Never commit .env file

## Next Steps

1. **Customize branding** - Update colors, logo, company name
2. **Add more plans** - Create plans for your offerings
3. **Configure payments** - Setup Easypaisa/JazzCash
4. **Test thoroughly** - Complete end-to-end testing
5. **Deploy to production** - Follow deployment guide
6. **Monitor** - Setup monitoring and alerts

## Sample Data

The database comes pre-loaded with:
- 1 admin user
- 6 sample plans (RDP, VPS, Shared)

You can modify or delete these as needed.

## Getting Help

1. Check the logs: `npm run dev` console output
2. Review API responses in browser DevTools
3. Check database for data integrity
4. Verify environment variables

---

**You're all set!** The platform is ready for customization and deployment. 🚀
