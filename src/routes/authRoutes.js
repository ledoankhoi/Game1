const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. Đăng ký
router.post('/register', authController.register);

// 2. Đăng nhập
router.post('/login', authController.login);

// 3. Bảng xếp hạng 
// (Lưu ý: Đã sửa thành authController.leaderboard cho khớp với file Controller)
router.get('/leaderboard', authController.leaderboard);

// 4. Cập nhật điểm
router.post('/update-score', authController.updateScore);

// 5. Mua vật phẩm (Shop)
router.post('/buy-item', authController.buyItem);

module.exports = router;