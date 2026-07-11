// routes/settings.js
// Protected routes — settings management (owner only)

const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner } = require('../middleware/auth');
const { qrisUpload } = require('../middleware/upload');
const settingController = require('../controllers/settingController');

// All routes require authentication + owner role
router.use(requireAuth);
router.use(requireOwner);

// GET  /settings — show settings form
router.get('/', settingController.edit);

// POST /settings — update settings (with QRIS image upload)
router.post('/', qrisUpload.single('qris_image'), settingController.update);

module.exports = router;
