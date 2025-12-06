const express = require('express');
const router = express.Router();
const { getLinkAnalytics } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/:id/analytics', getLinkAnalytics);

module.exports = router;
