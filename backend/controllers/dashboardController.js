const pool = require('../config/db');

// @desc    Get dashboard analytics data
// @route   GET /api/dashboard/analytics
// @access  Private
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Basic metrics queries
    const [revenueTodayRows] = await pool.query(`
      SELECT IFNULL(SUM(grand_total), 0) AS total 
      FROM invoices 
      WHERE DATE(invoice_date) = CURDATE()
    `);
    
    const [revenueMonthRows] = await pool.query(`
      SELECT IFNULL(SUM(grand_total), 0) AS total 
      FROM invoices 
      WHERE MONTH(invoice_date) = MONTH(CURDATE()) AND YEAR(invoice_date) = YEAR(CURDATE())
    `);

    const [roomsRows] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM rooms 
      GROUP BY status
    `);
    
    const [totalRoomsRows] = await pool.query(`SELECT COUNT(*) as total FROM rooms`);

    const [checkinsRows] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE check_in = CURDATE()
    `);

    const [checkoutsRows] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM bookings 
      WHERE check_out = CURDATE()
    `);

    const [currentGuestsRows] = await pool.query(`
      SELECT IFNULL(SUM(guests), 0) as count 
      FROM bookings 
      WHERE status = 'Checked In'
    `);

    const [pendingPaymentsRows] = await pool.query(`
      SELECT IFNULL(SUM(balance), 0) as total 
      FROM bookings 
      WHERE status != 'Cancelled'
    `);

    // Format metrics
    let totalRooms = totalRoomsRows[0]?.total || 0;
    let availableRooms = 0;
    let occupiedRooms = 0;
    let reservedRooms = 0;

    roomsRows.forEach(row => {
      if (row.status === 'Available') availableRooms = row.count;
      if (row.status === 'Occupied') occupiedRooms = row.count;
      if (row.status === 'Reserved') reservedRooms = row.count;
    });

    const occupancyRate = totalRooms ? Math.round(((occupiedRooms + reservedRooms) / totalRooms) * 100) : 0;

    // Chart Data - Revenue Trend (last 7 days)
    const [revenueTrendRows] = await pool.query(`
      SELECT DATE_FORMAT(invoice_date, '%Y-%m-%d') as date, SUM(grand_total) as revenue
      FROM invoices
      WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY date
      ORDER BY date
    `);

    // Chart Data - Booking Trend (last 7 days)
    const [bookingTrendRows] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, COUNT(*) as bookings
      FROM bookings
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY date
      ORDER BY date
    `);

    // Chart Data - Room Type Distribution
    const [roomTypeRows] = await pool.query(`
      SELECT type as name, COUNT(*) as value
      FROM rooms
      GROUP BY type
    `);

    // Mock occupancy trend since daily historical occupancy is hard to calculate dynamically without a snapshot table
    const occupancyTrend = [
      { name: 'Mon', uv: 60 },
      { name: 'Tue', uv: 70 },
      { name: 'Wed', uv: 65 },
      { name: 'Thu', uv: 85 },
      { name: 'Fri', uv: 90 },
      { name: 'Sat', uv: 95 },
      { name: 'Sun', uv: 75 },
    ];

    res.json({
      metrics: {
        totalRevenueToday: revenueTodayRows[0].total,
        monthlyRevenue: revenueMonthRows[0].total,
        occupancyRate,
        availableRooms,
        occupiedRooms,
        reservedRooms,
        todaysCheckins: checkinsRows[0].count,
        todaysCheckouts: checkoutsRows[0].count,
        currentGuests: currentGuestsRows[0].count,
        pendingPayments: pendingPaymentsRows[0].total
      },
      charts: {
        revenueTrend: revenueTrendRows,
        bookingTrend: bookingTrendRows,
        occupancyTrend, // Mocked for simplicity
        roomTypeDistribution: roomTypeRows
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics
};
