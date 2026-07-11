// routes/customers.js
// Protected routes — customer management

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// All routes require authentication
router.use(requireAuth);

// GET    /customers          — list customers
router.get('/', customerController.index);

// GET    /customers/create   — show create form
router.get('/create', customerController.create);

// POST   /customers          — store new customer
router.post('/', customerController.store);

// GET    /customers/:id      — show customer detail
router.get('/:id', customerController.show);

// GET    /customers/:id/edit — show edit form
router.get('/:id/edit', customerController.edit);

// POST   /customers/:id      — update customer
router.post('/:id', customerController.update);

module.exports = router;
