-- ============================
-- XhenVault Long-Term Management DB
-- Designed to manage everything: prospects, clients, income, expenses, assets, appointments, passive income
-- ============================

-- Drop old database if exists
DROP DATABASE IF EXISTS xhenvault_longterm;
CREATE DATABASE xhenvault_longterm;
USE xhenvault_longterm;

-- Users (team, admins, yourself)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('admin','manager','staff') DEFAULT 'staff',
    status ENUM('active','inactive') DEFAULT 'active',
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies / Business Units (for multi-branch / empire)
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Prospects and clients
CREATE TABLE prospects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(20),
    email VARCHAR(100),
    status ENUM('new','contacted','interested','converted','lost') DEFAULT 'new',
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prospect_id INT,
    company_id INT DEFAULT NULL,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(20),
    email VARCHAR(100),
    status ENUM('active','inactive') DEFAULT 'active',
    start_date DATE,
    FOREIGN KEY (prospect_id) REFERENCES prospects(id),
    FOREIGN KEY (company_id) REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deals / Invoices
CREATE TABLE deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    status ENUM('pending','won','lost') DEFAULT 'pending',
    expected_close DATE,
    actual_close DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(20,2) NOT NULL,
    due_date DATE,
    status ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id)
);

-- Income, Expenses, Revenue
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    name VARCHAR(50),
    type ENUM('cash','bank','mobile') DEFAULT 'cash',
    balance DECIMAL(20,2) DEFAULT 0,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT,
    type ENUM('income','expense') NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(20,2) NOT NULL,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE revenue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(100),
    amount DECIMAL(20,2),
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cashflow allocation rules (auto-split incoming money)
CREATE TABLE cashflow_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE TABLE allocation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    wallet_id INT NOT NULL,
    amount DECIMAL(20,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

-- Assets and passive income
CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    type ENUM('property','vehicle','stock','crypto','other'),
    value DECIMAL(20,2),
    purchase_date DATE,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE asset_income (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    type ENUM('rental','dividend','interest','other'),
    amount DECIMAL(20,2),
    received_on DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

-- Investments (long-term portfolios)
CREATE TABLE investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    type ENUM('stock','real_estate','crypto','fund','other'),
    value DECIMAL(20,2),
    acquired_on DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE investment_income (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investment_id INT,
    amount DECIMAL(20,2),
    received_on DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investment_id) REFERENCES investments(id)
);

-- Appointments / Events / Tasks
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    start_datetime DATETIME,
    end_datetime DATETIME,
    location VARCHAR(100),
    status ENUM('upcoming','ongoing','completed') DEFAULT 'upcoming',
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    assigned_to INT,
    priority ENUM('low','medium','high') DEFAULT 'medium',
    due_date DATE,
    status ENUM('pending','in_progress','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Documents (IDs, letters, official docs)
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_type ENUM('client','prospect','user','company','asset') NOT NULL,
    owner_id INT NOT NULL,
    document_type ENUM('National ID','Letter from Imam','Letter from Priest','Letter from Kadhi','Letter from LCI','Letter from GSO','Other') NOT NULL,
    file_path VARCHAR(255),
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Reporting / Forecasting
CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT,
    category VARCHAR(50),
    amount DECIMAL(20,2),
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE TABLE forecasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('income','expense','revenue') NOT NULL,
    expected_amount DECIMAL(20,2) NOT NULL,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('event_reminder','event_start','event_missed','system') DEFAULT 'system',
    event_id INT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT,
    status ENUM('unread','read') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_event ON notifications(event_id);

-- Workers (employees, contractors, etc.)
CREATE TABLE workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    hired_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);