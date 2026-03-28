const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// 1. Các API chung
router.get('/list', gameController.getAllGames); 
router.get('/history', authMiddleware, gameController.getUserHistory); 

// API Lưu kết quả
router.post('/save-result', authMiddleware, gameController.saveGameResult);

// 2. Các API Xếp hạng
router.get('/leaderboard/exp', gameController.getTopExp);
router.get('/leaderboard/score', gameController.getTopScore);
router.get('/leaderboard/game/:gameId', gameController.getGameLeaderboard);
router.get('/leaderboard/category/:category', gameController.getCategoryLeaderboard);
router.get('/recommendations', authMiddleware, gameController.getAIRecommendations);
router.get('/info/:slug', gameController.getGameInfo);
router.get('/instructions/:slug', gameController.getGameInstructions);
router.post('/:slug/play', gameController.incrementPlayCount);
module.exports = router;