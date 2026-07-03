const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, generateNotifications } = require('../controllers/notificationController');
const router = express.Router();

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.post('/generate', generateNotifications);

module.exports = router;
