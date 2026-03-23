const express = require('express');
const router = express.Router();

// 1. KHAI BÁO TẤT CẢ Ở TRÊN CÙNG
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); 

// 2. CÁC CỔNG TỰ DO (Không cần bảo vệ) - Các cổng Đăng Nhập / Đăng ký ở đây
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);

// 3. CÁC CỔNG BẢO MẬT (Có bác bảo vệ authMiddleware đứng canh)
router.post('/update-score', authMiddleware, authController.updateScore);

router.get('/profile', authMiddleware, authController.getProfile);
router.post('/update-avatar', authMiddleware, authController.updateAvatar);
router.post('/info', authMiddleware, authController.getUserInfo);

// CỔNG YÊU THÍCH GAME
router.post('/toggle-favorite', authMiddleware, authController.toggleFavorite);

// CỔNG GỬI GÓP Ý
router.post('/feedback', authMiddleware, authController.submitFeedback);

router.post('/claim-quest', authMiddleware, authController.claimQuest);

router.post('/equip-badge', authMiddleware, authController.equipBadge);



module.exports = router;