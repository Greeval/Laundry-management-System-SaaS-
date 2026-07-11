// routes/tracking.js
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// GET /track - public route for order tracking
router.get('/', trackingController.index);

module.exports = router;
