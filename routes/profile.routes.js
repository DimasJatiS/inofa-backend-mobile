// routes/profile.routes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const profileController = require('../controllers/profile.controller');

// Semua endpoint butuh token!
router.post('/', authMiddleware, profileController.createProfile);
router.put('/', authMiddleware, profileController.updateProfile);
router.get('/me', authMiddleware, profileController.getMyProfile);

module.exports = router;
