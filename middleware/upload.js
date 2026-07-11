// middleware/upload.js
// Multer configuration for file uploads

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const proofDir = path.join(__dirname, '..', 'public', 'uploads', 'proofs');
const qrisDir = path.join(__dirname, '..', 'public', 'uploads', 'qris');

[proofDir, qrisDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File filter: images only
const imageFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpg, jpeg, png, gif, webp) yang diperbolehkan.'), false);
  }
};

// Storage for proof images
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proofDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'proof-' + uniqueSuffix + ext);
  },
});

// Storage for QRIS images
const qrisStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, qrisDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'qris-' + uniqueSuffix + ext);
  },
});

// Upload configs
const proofUpload = multer({
  storage: proofStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const qrisUpload = multer({
  storage: qrisStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { proofUpload, qrisUpload };
