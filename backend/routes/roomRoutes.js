const express = require('express');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/validationMiddleware');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

const roomValidationRules = [
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be an integer > 0'),
  body('roomNumber').optional().trim().isString(),
  body('room_number').optional().trim().isString(),
  body('type').optional().isString().trim(),
  body('status').optional().isIn(['Available', 'Occupied', 'Maintenance']).withMessage('Invalid status'),
  body('cleaningStatus').optional().isIn(['Clean', 'Dirty', 'In Progress']).withMessage('Invalid cleaning status'),
  body('cleaning_status').optional().isIn(['Clean', 'Dirty', 'In Progress']).withMessage('Invalid cleaning status')
];

router.route('/')
  .get(getRooms)
  .post(roomValidationRules, validateRequest, createRoom);

router.route('/:id')
  .get(param('id').isInt().withMessage('ID must be an integer'), validateRequest, getRoomById)
  .put(param('id').isInt().withMessage('ID must be an integer'), roomValidationRules, validateRequest, updateRoom)
  .delete(param('id').isInt().withMessage('ID must be an integer'), validateRequest, deleteRoom);

module.exports = router;
