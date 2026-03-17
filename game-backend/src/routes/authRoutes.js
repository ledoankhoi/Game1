const express = require('express');
const router = express.Router();

// 1. KHAI BÁO TẤT CẢ Ở TRÊN CÙNG
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); 

// 2. CÁC CỔNG TỰ DO (Không cần bảo vệ)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);

// 3. CÁC CỔNG BẢO MẬT (Có bác bảo vệ authMiddleware đứng canh)
router.post('/update-score', authMiddleware, authController.updateScore);

router.get('/profile', authMiddleware, authController.getProfile);
router.post('/update-avatar', authMiddleware, authController.updateAvatar);

router.post('/info', authMiddleware, authController.getUserInfo);

module.exports = router;