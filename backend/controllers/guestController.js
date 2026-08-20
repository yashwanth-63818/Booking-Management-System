const pool = require('../config/db');

// @desc    Get all guests (derived from bookings)
// @route   GET /api/guests
// @access  Private
const getGuests = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        b.id, b.customer_name as name, b.phone, b.email, b.room_number as roomNumber, 
        DATE_FORMAT(b.check_in, '%Y-%m-%d') as checkIn, 
        DATE_FORMAT(b.check_out, '%Y-%m-%d') as checkOut,
        b.balance, b.status as booking_status,
        r.type as roomType
      FROM bookings b
      LEFT JOIN rooms r ON b.room_number = r.room_number
      ORDER BY b.check_in DESC
    `;
    const [rows] = await pool.query(query);

    const guests = rows.map(row => {
      let paymentStatus = 'Pending';
      if (row.balance <= 0) paymentStatus = 'Paid';
      else if (row.balance > 0 && row.balance < 500) paymentStatus = 'Partial'; // arbitrary partial logic if needed

      let status = 'In-House';
      if (row.booking_status === 'Checked Out') status = 'Checked-out';
      else if (row.booking_status === 'Confirmed') status = 'Reserved';

      return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        roomNumber: row.roomNumber,
        checkIn: row.checkIn,
        checkOut: row.checkOut,
        paymentStatus: paymentStatus,
        status: status,
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`
      };
    });

    res.json(guests);
  } catch (error) {
    next(error);
  }
};

// @desc    Update guest details (actually updates booking details)
// @route   PUT /api/guests/:id
// @access  Private
const updateGuest = async (req, res, next) => {
  try {
    const { id } = req.params; // booking id
    const { name, phone, email, roomNumber } = req.body;

    const query = `
      UPDATE bookings 
      SET customer_name = ?, phone = ?, email = ?, room_number = ?
      WHERE id = ?
    `;
    const [result] = await pool.query(query, [name, phone, email, roomNumber, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guest/Booking not found' });
    }

    res.json({ message: 'Guest updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Extend stay
// @route   PUT /api/guests/:id/extend
// @access  Private
const extendStay = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { checkOut } = req.body;

    const query = `UPDATE bookings SET check_out = ? WHERE id = ?`;
    const [result] = await pool.query(query, [checkOut, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guest/Booking not found' });
    }

    res.json({ message: 'Stay extended successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out guest
// @route   PUT /api/guests/:id/checkout
// @access  Private
const checkOutGuest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First update the booking status
    const [result] = await pool.query(`UPDATE bookings SET status = 'Checked Out' WHERE id = ?`, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guest/Booking not found' });
    }

    // Then find the room and mark it dirty and available
    const [booking] = await pool.query(`SELECT room_number FROM bookings WHERE id = ?`, [id]);
    if (booking.length > 0) {
      await pool.query(`UPDATE rooms SET status = 'Available', cleaning_status = 'Dirty' WHERE room_number = ?`, [booking[0].room_number]);
    }

    res.json({ message: 'Guest checked out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuests,
  updateGuest,
  extendStay,
  checkOutGuest
};
