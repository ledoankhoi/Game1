const express = require('express');
const router = express.Router();
const guildController = require('../controllers/guildController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, guildController.create);
router.get('/my', authMiddleware, guildController.getMyGuild);
router.get('/list', authMiddleware, guildController.getAll);
router.get('/leaderboard', authMiddleware, guildController.leaderboard);
router.get('/:id', authMiddleware, guildController.getGuild);
router.post('/:id/join', authMiddleware, guildController.join);
router.post('/:id/leave', authMiddleware, guildController.leave);
router.post('/:id/kick', authMiddleware, guildController.kick);
router.post('/:id/promote', authMiddleware, guildController.promote);

module.exports = router;
