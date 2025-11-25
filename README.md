# RDP E-Commerce Platform

A complete e-commerce platform for selling RDP/VPS hosting services with customer and admin panels, payment gateway integration, and subscription management.

## Features

### Customer Features
- User registration and authentication
- Email verification
- Password reset functionality
- Browse RDP/VPS/Shared hosting plans
- Shopping cart
- Multiple payment options (Easypaisa, JazzCash)
- Order tracking
- View payment history
- Manage subscriptions
- Access RDP/VPS credentials

### Admin Features
- Dashboard with statistics
- Order management
- Customer management
- Plans management (add, edit, delete)
- RDP/VPS credential assignment
- Payment gateway configuration
- Payment verification
- Subscription status management

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT
- **Email**: Nodemailer
- **Payment Gateways**: Easypaisa, JazzCash

## Project Structure

```
rdp-ecommerce-platform/
├── pages/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── admin/             # Admin endpoints
│   │   ├── cart/              # Cart management
│   │   ├── orders/            # Order management
│   │   ├── payments/          # Payment processing
│   │   ├── plans/             # Plans API
│   │   └── subscriptions/     # Subscription management
│   ├── auth/                  # Auth pages (login, register)
│   ├── plans/                 # Plans listing
│   ├── customer/              # Customer dashboard
│   ├── admin/                 # Admin dashboard
│   └── index.tsx              # Homepage
├── lib/
│   ├── db.ts                  # Database connection
│   ├── auth.ts                # Authentication utilities
│   ├── email.ts               # Email service
│   └── utils.ts               # Helper functions
├── middleware/
│   └── auth.ts                # Authentication middleware
├── types/
│   └── index.ts               # TypeScript types
├── components/                # React components
├── styles/                    # CSS styles
├── database/
│   └── schema.sql             # Database schema
└── public/                    # Static files
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- MySQL 5.7+ or 8.0+
- SMTP server for email (e.g., Gmail)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd moveiorca
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE rdp_ecommerce;
```

2. Import the schema:
```bash
mysql -u root -p rdp_ecommerce < database/schema.sql
```

Or run the SQL script in your MySQL client.

### Step 4: Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=rdp_ecommerce

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here-change-in-production

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@rdphosting.com

# Payment Gateway - Easypaisa
EASYPAISA_MERCHANT_ID=your_merchant_id
EASYPAISA_API_KEY=your_api_key
EASYPAISA_SECRET_KEY=your_secret_key
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_API_URL=https://easypaisa.com.pk/api/v1

# Payment Gateway - JazzCash
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk

# Admin Configuration
ADMIN_EMAIL=admin@rdphosting.com
ADMIN_DEFAULT_PASSWORD=change-me-in-production
```

### Step 5: Run the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Default Admin Credentials

After setting up the database, you can login to the admin panel with:

- **Email**: admin@rdphosting.com
- **Password**: admin123

**⚠️ IMPORTANT: Change the admin password immediately after first login!**

## API Documentation

See the full API documentation in the code. Key endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/plans` - Get all plans
- `POST /api/cart` - Add to cart
- `POST /api/orders/create` - Create order
- `GET /api/admin/dashboard` - Admin dashboard (requires admin role)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

Quick deployment steps:
1. Setup VPS with Node.js and MySQL
2. Clone repository
3. Configure environment variables
4. Import database schema
5. Build application: `npm run build`
6. Run with PM2: `pm2 start npm --name "rdp-platform" -- start`
7. Configure Nginx reverse proxy
8. Setup SSL with Let's Encrypt

## Security

- Change default admin password immediately
- Use strong JWT and NextAuth secrets
- Enable HTTPS in production
- Keep dependencies updated
- Never commit `.env` file
- Implement rate limiting
- Regular database backups

## License

This project is proprietary software. All rights reserved.
