// routes/orders.js
// Protected routes — order management

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// All routes require authentication
router.use(requireAuth);

// GET    /orders          — list orders
router.get('/', orderController.index);

// GET    /orders/create   — show create form
router.get('/create', orderController.create);

// POST   /orders          — store new order
router.post('/', orderController.store);

// GET    /orders/:id      — show order detail
router.get('/:id', orderController.show);

// POST   /orders/:id/process   — mark as diproses
router.post('/:id/process', orderController.process);

// GET    /orders/:id/complete  — show complete form
router.get('/:id/complete', orderController.completeForm);

// POST   /orders/:id/complete  — finalize order
router.post('/:id/complete', orderController.complete);

// POST   /orders/:id/picked-up — mark as diambil
router.post('/:id/picked-up', orderController.markPickedUp);

module.exports = router;
