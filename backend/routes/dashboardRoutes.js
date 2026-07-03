const express = require('express');
const { getDashboardAnalytics } = require('../controllers/dashboardController');
const router = express.Router();

router.get('/analytics', getDashboardAnalytics);

module.exports = router;
