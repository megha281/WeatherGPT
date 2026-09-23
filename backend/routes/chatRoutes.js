const express = require('express');
const controller = require('../controllers/chatController');
const { protect, optionalAuth } = require('../middleware/auth');
const { requireDB } = require('../middleware/requireDB');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Asking a question works signed out; it is only stored for signed-in users.
router.post('/', chatLimiter, optionalAuth, controller.ask);

router.get('/history', protect, requireDB, controller.history);
router.delete('/', protect, requireDB, controller.clearAll);
router.get('/:id', protect, requireDB, controller.getOne);
router.delete('/:id', protect, requireDB, controller.remove);

module.exports = router;
