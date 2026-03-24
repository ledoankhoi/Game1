const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const authMiddleware = require('../middlewares/authMiddleware');

// Lấy danh sách nhiệm vụ
router.get('/list', authMiddleware, questController.getQuests);

// [THÊM MỚI] Gửi yêu cầu nhận thưởng
router.post('/claim', authMiddleware, questController.claimQuest);

module.exports = router;