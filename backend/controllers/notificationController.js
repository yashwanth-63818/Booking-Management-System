const pool = require('../config/db');

// Ensure table exists
const initTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Failed to create notifications table:', error);
  }
};
initTable();

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};


// Internal function to generate notifications so it can be called automatically or manually
const runNotificationGeneration = async () => {
  let addedCount = 0;

  const addIfUnique = async (title, message, type) => {
    const [existing] = await pool.query(
      'SELECT id FROM notifications WHERE title = ? AND message = ? AND DATE(created_at) = CURDATE()',
      [title, message]
    );
    if (existing.length === 0) {
      await pool.query('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)', [title, message, type]);
      addedCount++;
    }
  };

  try {

    // 1. Today's Check-ins
    const [checkins] = await pool.query(`SELECT id, customer_name, room_number FROM bookings WHERE check_in = CURDATE() AND status = 'Confirmed'`);
    for (const booking of checkins) {
      const msg = `Guest ${booking.customer_name} is arriving today for Room ${booking.room_number}.`;
      await addIfUnique("Today's Check-in", msg, 'Check-in');
    }

    // 2. Today's Check-outs
    const [checkouts] = await pool.query(`SELECT id, customer_name, room_number FROM bookings WHERE check_out = CURDATE() AND status = 'Checked In'`);
    for (const booking of checkouts) {
      const msg = `Guest ${booking.customer_name} in Room ${booking.room_number} is checking out today.`;
      await addIfUnique("Today's Check-out", msg, 'Check-out');
    }

    // 3. Payment Pending
    const [pending] = await pool.query(`SELECT id, customer_name, balance FROM bookings WHERE balance > 0 AND status IN ('Checked In', 'Confirmed')`);
    for (const booking of pending) {
      const msg = `Booking ${booking.id} (${booking.customer_name}) has a pending balance of $${booking.balance}.`;
      await addIfUnique('Payment Pending', msg, 'Payment');
    }

    // 4. Room Cleaning Pending
    const [rooms] = await pool.query(`SELECT room_number FROM rooms WHERE cleaning_status = 'Dirty'`);
    for (const room of rooms) {
      const msg = `Room ${room.room_number} is marked as dirty and needs cleaning.`;
      await addIfUnique('Cleaning Required', msg, 'Cleaning');
    }

    return addedCount;
  } catch (error) {
    console.error('Error running notification generation:', error);
    throw error;
  }
};

// @desc    Generate system notifications (simulating a cron job or event triggers)
// @route   POST /api/notifications/generate
// @access  Private
const generateNotifications = async (req, res, next) => {
  try {
    const addedCount = await runNotificationGeneration();
    res.json({ success: true, message: `Generated ${addedCount} notifications.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  generateNotifications,
  runNotificationGeneration
};
