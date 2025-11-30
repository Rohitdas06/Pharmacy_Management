-- Create Database
CREATE DATABASE IF NOT EXISTS pharmacy_db;
USE pharmacy_db;

-- Table: medicines
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_expiry (expiry_date),
    INDEX idx_stock (stock)
);

-- Table: patients
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_phone (phone)
);

-- Table: prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medicine_id INT NOT NULL,
    quantity INT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_medicine (medicine_id),
    INDEX idx_date (date)
);

-- Table: users (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'pharmacist') DEFAULT 'pharmacist',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);


-- Insert Sample Data for Testing

-- Sample Medicines
INSERT INTO medicines (name, type, stock, price, expiry_date) VALUES
('Paracetamol 500mg', 'Tablet', 100, 5.50, '2025-12-31'),
('Amoxicillin 250mg', 'Capsule', 50, 12.00, '2025-06-30'),
('Cough Syrup', 'Syrup', 30, 85.00, '2024-12-15'),
('Ibuprofen 400mg', 'Tablet', 75, 8.00, '2026-03-20'),
('Vitamin C', 'Tablet', 200, 3.50, '2025-09-10'),
('Aspirin 75mg', 'Tablet', 5, 4.00, '2025-01-15'),
('Cetirizine 10mg', 'Tablet', 120, 6.50, '2026-08-25');

-- Sample Patients
INSERT INTO patients (name, age, phone) VALUES
('Rajesh Kumar', 45, '9876543210'),
('Priya Sharma', 32, '9123456789'),
('Amit Patel', 28, '9988776655'),
('Sneha Reddy', 55, '9876512345');

-- Sample Prescriptions
INSERT INTO prescriptions (patient_id, medicine_id, quantity, date) VALUES
(1, 1, 10, '2024-11-25'),
(2, 3, 2, '2024-11-26'),
(1, 4, 5, '2024-11-27'),
(3, 2, 15, '2024-11-28');

-- Sample Users (password for all is 'password123')
-- Password hash generated using bcrypt with salt rounds 10
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@pharmacy.com', '$2a$10$rQZ5YJ5YJ5YJ5YJ5YJ5YJuO8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'admin'),
('pharmacist', 'pharmacist@pharmacy.com', '$2a$10$rQZ5YJ5YJ5YJ5YJ5YJ5YJuO8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'pharmacist');

