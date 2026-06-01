const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/:userId', authMiddleware, messageController.getConversation);
router.get('/guild/:guildId', authMiddleware, messageController.getGuildMessages);

module.exports = router;
