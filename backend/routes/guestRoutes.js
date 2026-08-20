const express = require('express');
const router = express.Router();
const {
  getGuests,
  updateGuest,
  extendStay,
  checkOutGuest
} = require('../controllers/guestController');

router.route('/')
  .get(getGuests);

router.route('/:id')
  .put(updateGuest);

router.route('/:id/extend')
  .put(extendStay);

router.route('/:id/checkout')
  .put(checkOutGuest);

module.exports = router;
