-- RDP E-Commerce Platform Database Schema
-- MySQL Database Schema for RDP/VPS Hosting Platform

-- Users Table (Customers)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plans Table (VPS/RDP/Shared Hosting Plans)
CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('VPS', 'RDP', 'Shared') NOT NULL,
    description TEXT,
    features JSON,
    monthly_price DECIMAL(10, 2) NOT NULL,
    ram VARCHAR(50),
    cpu VARCHAR(50),
    storage VARCHAR(50),
    bandwidth VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled', 'failed') DEFAULT 'pending',
    payment_method ENUM('easypaisa', 'jazzcash', 'manual') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    plan_id INT NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    plan_category VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('active', 'expired', 'suspended', 'cancelled') DEFAULT 'active',
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RDP/VPS Credentials Table
CREATE TABLE IF NOT EXISTS rdp_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT UNIQUE NOT NULL,
    server_ip VARCHAR(50) NOT NULL,
    server_port INT DEFAULT 3389,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    additional_info TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    INDEX idx_subscription_id (subscription_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('easypaisa', 'jazzcash', 'manual') NOT NULL,
    transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'rejected') DEFAULT 'pending',
    payment_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Gateway Settings Table
CREATE TABLE IF NOT EXISTS payment_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gateway ENUM('easypaisa', 'jazzcash') UNIQUE NOT NULL,
    merchant_id VARCHAR(255),
    api_key VARCHAR(255),
    secret_key VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    is_test_mode BOOLEAN DEFAULT TRUE,
    configuration JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gateway (gateway)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    email_to VARCHAR(255) NOT NULL,
    email_type ENUM('verification', 'password_reset', 'order_confirmation', 'payment_update', 'subscription_expiry') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('sent', 'failed') DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_email_type (email_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Shopping Cart Table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_plan (user_id, plan_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - hashed with bcrypt)
-- Note: You should change this password after first login
INSERT INTO users (email, password, full_name, role, is_verified) VALUES
('admin@rdphosting.com', '$2a$10$rQZ9pZZ9pZZ9pZZ9pZZ9pZuY.VZYvZYvZYvZYvZYvZYvZYvZYvZYu', 'Admin User', 'admin', TRUE)
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample plans
INSERT INTO plans (name, category, description, features, monthly_price, ram, cpu, storage, bandwidth, is_active, sort_order) VALUES
('Basic RDP', 'RDP', 'Perfect for individual users and small tasks', '["2 vCPU", "4GB RAM", "50GB SSD", "Windows Server 2019", "24/7 Support"]', 15.00, '4GB', '2 vCPU', '50GB SSD', 'Unlimited', TRUE, 1),
('Professional RDP', 'RDP', 'Ideal for professionals and medium workloads', '["4 vCPU", "8GB RAM", "100GB SSD", "Windows Server 2022", "Priority Support", "Daily Backups"]', 30.00, '8GB', '4 vCPU', '100GB SSD', 'Unlimited', TRUE, 2),
('Enterprise RDP', 'RDP', 'Best for heavy workloads and multiple users', '["8 vCPU", "16GB RAM", "200GB SSD", "Windows Server 2022", "24/7 Premium Support", "Hourly Backups", "Dedicated Resources"]', 60.00, '16GB', '8 vCPU', '200GB SSD', 'Unlimited', TRUE, 3),
('Basic VPS', 'VPS', 'Entry-level VPS hosting solution', '["1 vCPU", "2GB RAM", "30GB SSD", "Linux/Windows", "1TB Bandwidth"]', 10.00, '2GB', '1 vCPU', '30GB SSD', '1TB', TRUE, 4),
('Business VPS', 'VPS', 'Powerful VPS for growing businesses', '["4 vCPU", "8GB RAM", "150GB SSD", "Linux/Windows", "3TB Bandwidth", "Free SSL"]', 40.00, '8GB', '4 vCPU', '150GB SSD', '3TB', TRUE, 5),
('Shared Hosting Basic', 'Shared', 'Perfect for small websites and blogs', '["10GB Storage", "100GB Bandwidth", "5 Email Accounts", "Free SSL", "cPanel Access"]', 5.00, 'Shared', 'Shared', '10GB', '100GB', TRUE, 6)
ON DUPLICATE KEY UPDATE name=name;
