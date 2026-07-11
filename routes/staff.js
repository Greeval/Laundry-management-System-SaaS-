// routes/staff.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { requireAuth, requireOwner } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireOwner);

router.get('/', staffController.index);
router.post('/', staffController.store);
router.post('/:id/delete', staffController.destroy);

module.exports = router;
