const pool = require('../config/db');

// @desc    Get all bookings with advanced search, filters, pagination and sorting
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const {
      q = '',
      date = '',
      roomType = 'All',
      status = 'All',
      paymentStatus = 'All',
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const queryLimit = parseInt(limit);

    let baseQuery = `
      FROM bookings b
      LEFT JOIN rooms r ON b.room_number = r.room_number
      LEFT JOIN invoices i ON b.id = i.booking_id
      WHERE 1=1
    `;
    const queryParams = [];

    // 1. Search Query (Customer Name, Phone, Booking ID, Room Number, Invoice Number)
    if (q) {
      baseQuery += ` AND (
        b.customer_name LIKE ? OR 
        b.phone LIKE ? OR 
        b.id LIKE ? OR 
        b.room_number LIKE ? OR 
        i.id LIKE ?
      )`;
      const searchTerm = `%${q}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // 2. Date Filter
    if (date) {
      baseQuery += ` AND (? BETWEEN b.check_in AND b.check_out)`;
      queryParams.push(date);
    }

    // 3. Room Type Filter
    if (roomType && roomType !== 'All') {
      baseQuery += ` AND r.type = ?`;
      queryParams.push(roomType);
    }

    // 4. Booking Status Filter
    if (status && status !== 'All') {
      baseQuery += ` AND b.status = ?`;
      queryParams.push(status);
    }

    // 5. Payment Status Filter
    if (paymentStatus && paymentStatus !== 'All') {
      if (paymentStatus === 'Pending') {
        baseQuery += ` AND b.balance > 0`;
      } else if (paymentStatus === 'Paid') {
        baseQuery += ` AND b.balance <= 0`;
      }
    }

    // Count Total
    const countQuery = `SELECT COUNT(DISTINCT b.id) as total ${baseQuery}`;
    const [countResult] = await pool.query(countQuery, queryParams);
    const totalCount = countResult[0].total;

    // Allowed sort columns to prevent SQL injection
    const allowedSortCols = ['id', 'customer_name', 'room_number', 'check_in', 'check_out', 'status', 'grand_total', 'balance', 'created_at'];
    const safeSortBy = allowedSortCols.includes(sortBy) ? `b.${sortBy}` : 'b.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Fetch Data
    const dataQuery = `
      SELECT b.*, r.type as room_type, MAX(i.id) as invoice_id
      ${baseQuery}
      GROUP BY b.id
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    
    // Add pagination params
    const dataParams = [...queryParams, queryLimit, offset];
    const [rows] = await pool.query(dataQuery, dataParams);

    res.json({
      data: rows,
      total: totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / queryLimit)
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Export all bookings based on filters
// @route   GET /api/bookings/export
// @access  Private
const exportBookings = async (req, res, next) => {
  try {
    const {
      q = '',
      date = '',
      roomType = 'All',
      status = 'All',
      paymentStatus = 'All',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let baseQuery = `
      FROM bookings b
      LEFT JOIN rooms r ON b.room_number = r.room_number
      LEFT JOIN invoices i ON b.id = i.booking_id
      WHERE 1=1
    `;
    const queryParams = [];

    if (q) {
      baseQuery += ` AND (
        b.customer_name LIKE ? OR 
        b.phone LIKE ? OR 
        b.id LIKE ? OR 
        b.room_number LIKE ? OR 
        i.id LIKE ?
      )`;
      const searchTerm = `%${q}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (date) {
      baseQuery += ` AND (? BETWEEN b.check_in AND b.check_out)`;
      queryParams.push(date);
    }

    if (roomType && roomType !== 'All') {
      baseQuery += ` AND r.type = ?`;
      queryParams.push(roomType);
    }

    if (status && status !== 'All') {
      baseQuery += ` AND b.status = ?`;
      queryParams.push(status);
    }

    if (paymentStatus && paymentStatus !== 'All') {
      if (paymentStatus === 'Pending') {
        baseQuery += ` AND b.balance > 0`;
      } else if (paymentStatus === 'Paid') {
        baseQuery += ` AND b.balance <= 0`;
      }
    }

    const allowedSortCols = ['id', 'customer_name', 'room_number', 'check_in', 'check_out', 'status', 'grand_total', 'balance', 'created_at'];
    const safeSortBy = allowedSortCols.includes(sortBy) ? `b.${sortBy}` : 'b.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const dataQuery = `
      SELECT b.*, r.type as room_type, MAX(i.id) as invoice_id
      ${baseQuery}
      GROUP BY b.id
      ORDER BY ${safeSortBy} ${safeSortOrder}
    `;
    
    const [rows] = await pool.query(dataQuery, queryParams);
    res.json(rows);

  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const booking = req.body;
    // Generate Booking ID (e.g. BKG-1234)
    const newId = `BKG-${Math.floor(1000 + Math.random() * 9000)}`;

    const query = `
      INSERT INTO bookings (
        id, customer_name, phone, email, address, id_proof_type, id_number,
        guests, check_in, check_out, room_number, payment_method, advance,
        special_requests, days, room_charges, gst, grand_total, balance, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      newId, booking.customerName || booking.customer_name, booking.phone, booking.email || '', booking.address || '',
      booking.idProofType || booking.id_proof_type, booking.idNumber || booking.id_number,
      booking.guests || 1, booking.checkIn || booking.check_in, booking.checkOut || booking.check_out, 
      booking.room || booking.room_number, booking.paymentMethod || booking.payment_method, 
      booking.advance || 0, booking.specialRequests || booking.special_requests || '', 
      booking.days || 1, booking.roomCharges || booking.room_charges, booking.gst || 0, 
      booking.grandTotal || booking.grand_total, booking.balance || 0, booking.status || 'Confirmed'
    ];

    await pool.query(query, values);
    
    // Also update room status if checking in
    if (booking.status === 'Checked In') {
      await pool.query('UPDATE rooms SET status = ? WHERE room_number = ?', ['Occupied', booking.room || booking.room_number]);
    } else if (booking.status === 'Confirmed') {
      await pool.query('UPDATE rooms SET status = ? WHERE room_number = ?', ['Reserved', booking.room || booking.room_number]);
    }

    res.status(201).json({ id: newId, message: 'Booking created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = req.body;

    const query = `
      UPDATE bookings SET
        customer_name = ?, phone = ?, email = ?, address = ?, id_proof_type = ?, id_number = ?,
        guests = ?, check_in = ?, check_out = ?, room_number = ?, payment_method = ?, advance = ?,
        special_requests = ?, days = ?, room_charges = ?, gst = ?, grand_total = ?, balance = ?, status = ?
      WHERE id = ?
    `;

    const values = [
      booking.customerName || booking.customer_name, booking.phone, booking.email || '', booking.address || '',
      booking.idProofType || booking.id_proof_type, booking.idNumber || booking.id_number,
      booking.guests || 1, booking.checkIn || booking.check_in, booking.checkOut || booking.check_out, 
      booking.room || booking.room_number, booking.paymentMethod || booking.payment_method, 
      booking.advance || 0, booking.specialRequests || booking.special_requests || '', 
      booking.days || 1, booking.roomCharges || booking.room_charges, booking.gst || 0, 
      booking.grandTotal || booking.grand_total, booking.balance || 0, booking.status || 'Confirmed',
      id
    ];

    await pool.query(query, values);

    // Update room status depending on booking status
    const room = booking.room || booking.room_number;
    if (booking.status === 'Checked In') {
      await pool.query('UPDATE rooms SET status = ? WHERE room_number = ?', ['Occupied', room]);
    } else if (booking.status === 'Checked Out') {
      await pool.query('UPDATE rooms SET status = ?, cleaning_status = ? WHERE room_number = ?', ['Available', 'Dirty', room]);
    } else if (booking.status === 'Cancelled') {
      await pool.query('UPDATE rooms SET status = ? WHERE room_number = ?', ['Available', room]);
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check room before deleting
    const [rows] = await pool.query('SELECT room_number, status FROM bookings WHERE id = ?', [id]);
    if (rows.length > 0 && (rows[0].status === 'Confirmed' || rows[0].status === 'Checked In')) {
       // Free the room
       await pool.query('UPDATE rooms SET status = ? WHERE room_number = ?', ['Available', rows[0].room_number]);
    }

    await pool.query('DELETE FROM invoices WHERE booking_id = ?', [id]); // cascaded if FK is set, but let's be safe
    await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  exportBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};
