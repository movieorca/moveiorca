-- Enhanced RDP E-Commerce Platform Database Schema
-- MySQL Database Schema for RDP/VPS Hosting Platform with Advanced Features

-- Users Table (Customers & Referrals)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    referral_code VARCHAR(50) UNIQUE,
    referred_by INT,
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_referral_code (referral_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Countries Table
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(2) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(10),
    currency_code VARCHAR(3) DEFAULT 'PKR',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Windows OS Options Table
CREATE TABLE IF NOT EXISTS windows_os (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Plans Table with Duration-based Pricing
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category ENUM('RDP', 'VPS', 'Shared', 'GPU-RDP') NOT NULL,
    description TEXT,
    features JSON,

    -- Pricing for different durations
    daily_price DECIMAL(10, 2),
    weekly_price DECIMAL(10, 2),
    monthly_price DECIMAL(10, 2) NOT NULL,

    -- Bulk discounts (percentage)
    discount_6months DECIMAL(5, 2) DEFAULT 0.00,
    discount_yearly DECIMAL(5, 2) DEFAULT 0.00,

    -- Most Popular flags (one per duration)
    is_popular_daily BOOLEAN DEFAULT FALSE,
    is_popular_weekly BOOLEAN DEFAULT FALSE,
    is_popular_monthly BOOLEAN DEFAULT FALSE,

    -- Specifications
    ram VARCHAR(50),
    cpu VARCHAR(50),
    storage VARCHAR(50),
    bandwidth VARCHAR(50),
    vcpu INT,

    -- RDP specific
    admin_access BOOLEAN DEFAULT TRUE,
    dedicated_ip BOOLEAN DEFAULT TRUE,
    max_users INT DEFAULT 1,

    -- GPU specific (for future)
    gpu_type VARCHAR(100),
    gpu_memory VARCHAR(50),

    -- Status & ordering
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_slug (slug),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plan Countries Junction Table
CREATE TABLE IF NOT EXISTS plan_countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    country_id INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
    UNIQUE KEY unique_plan_country (plan_id, country_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_country_id (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plan Windows OS Junction Table
CREATE TABLE IF NOT EXISTS plan_windows_os (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    windows_os_id INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (windows_os_id) REFERENCES windows_os(id) ON DELETE CASCADE,
    UNIQUE KEY unique_plan_os (plan_id, windows_os_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_windows_os_id (windows_os_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    final_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled', 'failed') DEFAULT 'pending',
    payment_method ENUM('easypaisa', 'jazzcash', 'binance', 'manual') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    notes TEXT,
    referral_code_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    plan_id INT NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    plan_category VARCHAR(50) NOT NULL,
    duration_type ENUM('daily', 'weekly', 'monthly', '6months', 'yearly') NOT NULL,
    duration_value INT NOT NULL,
    quantity INT DEFAULT 1,
    base_price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    final_price DECIMAL(10, 2) NOT NULL,
    country_code VARCHAR(2),
    windows_os_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    FOREIGN KEY (windows_os_id) REFERENCES windows_os(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    plan_id INT NOT NULL,
    duration_type ENUM('daily', 'weekly', 'monthly', '6months', 'yearly') NOT NULL,
    status ENUM('active', 'expired', 'suspended', 'cancelled') DEFAULT 'active',
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    country_code VARCHAR(2),
    windows_os_id INT,
    expiry_notification_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    FOREIGN KEY (windows_os_id) REFERENCES windows_os(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced RDP Credentials Table
CREATE TABLE IF NOT EXISTS rdp_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT UNIQUE NOT NULL,
    server_ip VARCHAR(50) NOT NULL,
    server_port INT DEFAULT 3389,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    country_code VARCHAR(2),
    windows_os_version VARCHAR(100),
    additional_info TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_subscription_id (subscription_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('easypaisa', 'jazzcash', 'binance', 'manual') NOT NULL,
    transaction_id VARCHAR(255),
    wallet_address VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'rejected') DEFAULT 'pending',
    payment_data JSON,
    auto_verified BOOLEAN DEFAULT FALSE,
    verified_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Payment Gateway Settings Table
CREATE TABLE IF NOT EXISTS payment_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gateway ENUM('easypaisa', 'jazzcash', 'binance') UNIQUE NOT NULL,
    merchant_id VARCHAR(255),
    api_key VARCHAR(255),
    secret_key VARCHAR(255),
    wallet_address VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    is_test_mode BOOLEAN DEFAULT TRUE,
    auto_verify BOOLEAN DEFAULT FALSE,
    configuration JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gateway (gateway)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referral System Table
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    order_id INT,
    commission_amount DECIMAL(10, 2) DEFAULT 0.00,
    commission_percent DECIMAL(5, 2) DEFAULT 10.00,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    paid_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_referrer_id (referrer_id),
    INDEX idx_referred_id (referred_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enhanced Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    email_to VARCHAR(255) NOT NULL,
    email_type ENUM('verification', 'password_reset', 'order_confirmation', 'payment_update', 'subscription_expiry', 'renewal_reminder') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('sent', 'failed') DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_email_type (email_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shopping Cart Table with Extended Options
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    duration_type ENUM('daily', 'weekly', 'monthly', '6months', 'yearly') DEFAULT 'monthly',
    quantity INT DEFAULT 1,
    country_code VARCHAR(2),
    windows_os_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    FOREIGN KEY (windows_os_id) REFERENCES windows_os(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Countries
INSERT INTO countries (code, name, flag_emoji, currency_code, exchange_rate) VALUES
('FR', 'France', '🇫🇷', 'EUR', 0.0089),
('NL', 'Netherlands', '🇳🇱', 'EUR', 0.0089),
('US', 'USA', '🇺🇸', 'USD', 0.0036),
('IS', 'Iceland', '🇮🇸', 'ISK', 0.49),
('IT', 'Italy', '🇮🇹', 'EUR', 0.0089),
('ES', 'Spain', '🇪🇸', 'EUR', 0.0089),
('TR', 'Turkey', '🇹🇷', 'TRY', 0.11),
('GB', 'United Kingdom', '🇬🇧', 'GBP', 0.0028),
('CH', 'Switzerland', '🇨🇭', 'CHF', 0.0032),
('PK', 'Pakistan', '🇵🇰', 'PKR', 1.0000)
ON DUPLICATE KEY UPDATE name=name;

-- Insert Windows OS Options
INSERT INTO windows_os (name, version, description, is_active, sort_order) VALUES
('Windows Server 2012 R2', '2012 R2', 'Stable and reliable server OS', TRUE, 1),
('Windows Server 2016', '2016', 'Modern server with enhanced security', TRUE, 2),
('Windows Server 2019', '2019', 'Latest features with improved performance', TRUE, 3),
('Windows Server 2022', '2022', 'Most advanced server OS with hybrid capabilities', TRUE, 4),
('Windows 10 Pro', '10', 'Desktop experience for RDP', TRUE, 5),
('Windows 11 Pro', '11', 'Latest Windows with modern interface', TRUE, 6)
ON DUPLICATE KEY UPDATE name=name;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, full_name, role, is_verified, referral_code) VALUES
('admin@rdp.sale', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', TRUE, 'ADMIN2024')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Mini Plan as example
INSERT INTO plans (
    name, slug, category, description, features,
    daily_price, weekly_price, monthly_price,
    discount_6months, discount_yearly,
    ram, cpu, storage, bandwidth, vcpu,
    admin_access, dedicated_ip, max_users,
    is_popular_monthly, is_active, sort_order
) VALUES (
    'RDP Mini',
    'rdp-mini',
    'RDP',
    'Perfect for individual users and light workloads',
    '["💻 4 vCPU", "🧠 6GB RAM", "💾 120GB SSD", "🛡️ Full Admin Access", "🌐 3TB Traffic/Month", "24/7 Support", "99.9% Uptime"]',
    300.00,
    750.00,
    1999.00,
    10.00,
    15.00,
    '6GB',
    '4 vCPU',
    '120GB SSD',
    '3TB/Month',
    4,
    TRUE,
    TRUE,
    1,
    TRUE,
    TRUE,
    1
) ON DUPLICATE KEY UPDATE name=name;

-- Link Mini Plan to all countries
INSERT INTO plan_countries (plan_id, country_id, is_available)
SELECT p.id, c.id, TRUE
FROM plans p
CROSS JOIN countries c
WHERE p.slug = 'rdp-mini' AND c.code IN ('FR', 'NL', 'US', 'IS', 'IT', 'ES', 'TR', 'GB', 'CH')
ON DUPLICATE KEY UPDATE is_available=is_available;

-- Link Mini Plan to all Windows OS
INSERT INTO plan_windows_os (plan_id, windows_os_id, is_available)
SELECT p.id, w.id, TRUE
FROM plans p
CROSS JOIN windows_os w
WHERE p.slug = 'rdp-mini'
ON DUPLICATE KEY UPDATE is_available=is_available;
