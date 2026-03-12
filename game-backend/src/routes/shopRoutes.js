const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middlewares/authMiddleware'); // Cửa bảo vệ (phải đăng nhập mới được mua đồ)

router.get('/items', shopController.getAllItems); // Ai cũng xem được đồ
router.post('/buy', authMiddleware, shopController.buyItem); // Phải có vé (token) mới mua được
router.post('/equip', authMiddleware, shopController.equipItem); // Phải có vé mới mặc được

module.exports = router;