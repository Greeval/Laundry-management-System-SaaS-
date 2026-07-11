// routes/payments.js
// Protected routes — payment management

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { proofUpload } = require('../middleware/upload');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.use(requireAuth);

// GET    /payments/pending         — list pending payments
router.get('/pending', paymentController.pending);

// POST   /payments/:id/approve     — approve payment (ONLY way to mark paid)
router.post('/:id/approve', paymentController.approve);

// POST   /payments/:id/upload-proof — upload proof image (reference only, no status change)
router.post('/:id/upload-proof', proofUpload.single('proof_image'), paymentController.uploadProof);

module.exports = router;
