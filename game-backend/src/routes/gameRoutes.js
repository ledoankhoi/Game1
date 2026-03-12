const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// 1. Các API chung
router.get('/list', gameController.getAllGames); 
router.get('/history', authMiddleware, gameController.getUserHistory); 

// 2. Các API Xếp hạng (BẮT BUỘC PHẢI ĐẶT THEO THỨ TỰ NÀY)
// Các đường link cụ thể phải nằm trên
router.get('/leaderboard/exp', gameController.getTopExp);
router.get('/leaderboard/score', gameController.getTopScore);

// Đường link chứa tham số động (:gameId) phải nằm dưới cùng
router.get('/leaderboard/game/:gameId', gameController.getGameLeaderboard);

module.exports = router;