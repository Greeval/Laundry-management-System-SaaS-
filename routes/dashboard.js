// routes/dashboard.js
// Protected route — dashboard (requires auth)

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// GET / — dashboard
router.get('/', requireAuth, dashboardController.index);

module.exports = router;
