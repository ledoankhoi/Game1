const express = require('express');
const router = express.Router();

// 1. KHAI BÁO TẤT CẢ Ở TRÊN CÙNG
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); 
const { authLimiter } = require('../middlewares/rateLimiter');
const { registerRules, loginRules, updateUsernameRules, updateAvatarRules, feedbackRules, claimQuestRules, equipBadgeRules, toggleFavoriteRules } = require('../middlewares/validate');

// 2. CÁC CỔNG TỰ DO (Không cần bảo vệ) - Các cổng Đăng Nhập / Đăng ký ở đây
router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/google-login', authLimiter, authController.googleLogin);

// 3. CÁC CỔNG BẢO MẬT (Có bác bảo vệ authMiddleware đứng canh)
router.post('/update-score', authMiddleware, authController.updateScore);

router.get('/profile', authMiddleware, authController.getProfile);
router.post('/update-avatar', authMiddleware, updateAvatarRules, authController.updateAvatar);
router.post('/info', authMiddleware, authController.getUserInfo);

// CỔNG YÊU THÍCH GAME
router.post('/toggle-favorite', authMiddleware, toggleFavoriteRules, authController.toggleFavorite);

// CỔNG GỬI GÓP Ý
router.post('/feedback', authMiddleware, feedbackRules, authController.submitFeedback);

router.post('/claim-quest', authMiddleware, claimQuestRules, authController.claimQuest);

router.post('/equip-badge', authMiddleware, equipBadgeRules, authController.equipBadge);

// Route đổi tên hiển thị (Có bảo vệ bằng authMiddleware)
router.post('/update-username', authMiddleware, updateUsernameRules, authController.updateUsername);

router.post('/update-settings', authMiddleware, authController.updateSettings);

router.post('/facebook-login', authController.facebookLogin);

module.exports = router;