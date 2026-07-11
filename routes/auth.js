// routes/auth.js
// Public routes — login/logout (no auth required)

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Konfigurasi Rate Limiter untuk mencegah Brute Force Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // Maksimal 10 percobaan per IP per windowMs
    message: 'Terlalu banyak percobaan login dari IP ini. Silakan coba lagi setelah 15 menit.'
});

// GET  /login  — show login page
router.get('/login', authController.showLogin);

// POST /login  — authenticate
router.post('/login', loginLimiter, authController.login);

// GET /register — show register page
router.get('/register', authController.showRegister);

// POST /register — register new tenant
router.post('/register', authController.registerTenant);

// POST /logout — destroy session
router.post('/logout', authController.logout);

module.exports = router;
