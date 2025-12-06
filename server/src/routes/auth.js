const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

// Public routes
router.post('/register', authLimiter.middleware(), register);
router.post('/login', authLimiter.middleware(), login);

// Protected routes
router.get('/me', authMiddleware, getMe);

module.exports = router;
