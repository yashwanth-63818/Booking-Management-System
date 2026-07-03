const pool = require('../config/db');

class Invoice {
  static async create(invoiceData) {
    const { id, booking_id, customer_name, invoice_date, subtotal, gst, discount, grand_total, payment_method } = invoiceData;
    const [result] = await pool.query(
      'INSERT INTO invoices (id, booking_id, customer_name, invoice_date, subtotal, gst, discount, grand_total, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, booking_id, customer_name, invoice_date, subtotal, gst, discount || 0.00, grand_total, payment_method || 'Cash']
    );
    return result;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByBookingId(bookingId) {
    const [rows] = await pool.query('SELECT * FROM invoices WHERE booking_id = ?', [bookingId]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
    return rows;
  }
}

module.exports = Invoice;
