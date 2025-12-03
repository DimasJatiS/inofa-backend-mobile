// routes/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// GET /auth/status  (perlu token)
router.get('/status', authMiddleware, authController.statusCheck);

// POST /auth/register
router.post('/register', authController.register);

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/set-role  (perlu token)
router.post('/set-role', authMiddleware, authController.setRole);

// GET /auth/me (perlu token)
router.get('/me', authMiddleware, authController.me);

module.exports = router;
