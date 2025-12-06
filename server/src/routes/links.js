const express = require('express');
const router = express.Router();
const {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
} = require('../controllers/linksController');
const authMiddleware = require('../middleware/auth');
const { linkCreationLimiter } = require('../middleware/rateLimit');

// All routes require authentication
router.use(authMiddleware);

router.post('/', linkCreationLimiter.middleware(), createLink);
router.get('/', getLinks);
router.get('/:id', getLinkById);
router.patch('/:id', updateLink);
router.delete('/:id', deleteLink);

module.exports = router;
