const express = require('express');
const router = express.Router();

// --- BƯỚC QUAN TRỌNG NHẤT ---
// Bạn phải lấy "getLeaderboard" từ trong kho ra thì mới dùng được.
// Lỗi ReferenceError xảy ra là do dòng dưới đây bị thiếu chữ "getLeaderboard".
const { 
    register, 
    login, 
    updateScore, 
    getLeaderboard  // <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY
} = require('../controllers/authController');

// Các đường dẫn cũ
router.post('/register', register);
router.post('/login', login);
router.put('/score', updateScore);

// Đường dẫn mới (Nếu không có dòng import ở trên, dòng này sẽ báo lỗi)
router.get('/leaderboard', getLeaderboard); 

module.exports = router;