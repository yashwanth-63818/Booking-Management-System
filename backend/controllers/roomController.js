const pool = require('../config/db');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// @desc    Get room by ID or Room Number
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ? OR room_number = ?', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res, next) => {
  try {
    const room = req.body;
    
    // Convert boolean 'ac' to 1/0 for MySQL if necessary, mysql2 usually handles it, but let's be explicit
    const ac = room.ac === true || room.ac === 'true' ? 1 : 0;

    const query = `
      INSERT INTO rooms (
        room_number, type, price, capacity, ac, description, image_url, status, cleaning_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      room.roomNumber || room.room_number,
      room.type || 'Standard',
      room.price,
      room.capacity || 2,
      ac,
      room.description || '',
      room.image || room.image_url || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500&q=80',
      room.status || 'Available',
      room.cleaningStatus || room.cleaning_status || 'Clean'
    ];

    const [result] = await pool.query(query, values);
    const newRoomId = result.insertId;

    res.status(201).json({ id: newRoomId, message: 'Room created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Room number already exists' });
    } else {
      next(error);
    }
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = req.body;
    
    const ac = room.ac === true || room.ac === 'true' ? 1 : 0;

    const query = `
      UPDATE rooms SET
        room_number = ?, type = ?, price = ?, capacity = ?, ac = ?, description = ?, image_url = ?, status = ?, cleaning_status = ?
      WHERE id = ?
    `;

    const values = [
      room.roomNumber || room.room_number,
      room.type,
      room.price,
      room.capacity,
      ac,
      room.description,
      room.image || room.image_url,
      room.status,
      room.cleaningStatus || room.cleaning_status,
      id
    ];

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Room number already exists' });
    } else {
      next(error);
    }
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Ensure room is not tied to active bookings
    const [room] = await pool.query('SELECT room_number FROM rooms WHERE id = ?', [id]);
    if (room.length > 0) {
      const roomNum = room[0].room_number;
      const [bookings] = await pool.query("SELECT id FROM bookings WHERE room_number = ? AND status IN ('Confirmed', 'Checked In')", [roomNum]);
      
      if (bookings.length > 0) {
        return res.status(400).json({ message: 'Cannot delete room with active bookings' });
      }
    }

    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
