const Invoice = require('../models/Invoice');

// @desc    Generate a new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res, next) => {
  try {
    const { booking_id, customer_name, subtotal, gst, discount, grand_total, payment_method } = req.body;

    if (!booking_id || !customer_name || !subtotal || !grand_total) {
      res.status(400);
      throw new Error('Please provide all required invoice fields');
    }

    // Check if invoice already exists for this booking
    const existingInvoice = await Invoice.findByBookingId(booking_id);
    if (existingInvoice) {
      return res.status(200).json(existingInvoice);
    }

    const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceDate = new Date().toISOString().split('T')[0];

    const newInvoice = {
      id: invoiceId,
      booking_id,
      customer_name,
      invoice_date: invoiceDate,
      subtotal,
      gst,
      discount,
      grand_total,
      payment_method
    };

    await Invoice.create(newInvoice);

    res.status(201).json(newInvoice);
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404);
      throw new Error('Invoice not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice by Booking ID
// @route   GET /api/invoices/booking/:bookingId
// @access  Private
const getInvoiceByBookingId = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByBookingId(req.params.bookingId);
    
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404);
      throw new Error('Invoice not found for this booking');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoiceById,
  getInvoiceByBookingId
};
