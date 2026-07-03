const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
  try {
    // 1. Connect without database selected to create it if not exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('Connected to MySQL server.');

    // 2. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    console.log(`Database '${process.env.DB_NAME}' created or already exists.`);

    // 3. Use the Database
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    // 4. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'receptionist', 'manager') DEFAULT 'receptionist',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "users" created or already exists.');

    // 5. Create Rooms Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_number VARCHAR(20) NOT NULL UNIQUE,
        type ENUM('Standard', 'Deluxe', 'Suite') NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        capacity INT NOT NULL DEFAULT 2,
        ac BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        image_url VARCHAR(255),
        status ENUM('Available', 'Occupied', 'Reserved', 'Cleaning') DEFAULT 'Available',
        cleaning_status ENUM('Clean', 'Dirty', 'In Progress') DEFAULT 'Clean',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "rooms" created or already exists.');

    // 6. Create Bookings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(20) PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        address TEXT,
        id_proof_type VARCHAR(50),
        id_number VARCHAR(100),
        guests INT DEFAULT 1,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        room_number VARCHAR(20) NOT NULL,
        payment_method ENUM('Cash', 'Credit Card', 'UPI', 'Bank Transfer') DEFAULT 'Cash',
        advance DECIMAL(10, 2) DEFAULT 0.00,
        special_requests TEXT,
        days INT NOT NULL,
        room_charges DECIMAL(10, 2) NOT NULL,
        gst DECIMAL(10, 2) NOT NULL,
        grand_total DECIMAL(10, 2) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL,
        status ENUM('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled') DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_number) REFERENCES rooms(room_number) ON DELETE RESTRICT ON UPDATE CASCADE,
        INDEX idx_status (status),
        INDEX idx_check_in (check_in),
        INDEX idx_customer (customer_name)
      );
    `);
    // 7. Create Invoices Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(20) PRIMARY KEY,
        booking_id VARCHAR(20) NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        invoice_date DATE NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        gst DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0.00,
        grand_total DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('Cash', 'Credit Card', 'UPI', 'Bank Transfer') DEFAULT 'Cash',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    console.log('Table "invoices" created or already exists.');

    // 7. Seed Admin User if not exists
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@kachinn.com']);
    if (rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['System Admin', 'admin@kachinn.com', hashedPassword, 'admin']
      );
      console.log('Default admin user seeded (admin@kachinn.com / admin123).');
    }

    console.log('Database setup completed successfully! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
