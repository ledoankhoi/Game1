const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// TẤT CẢ ROUTE Ở ĐÂY PHẢI QUA 2 LỚP BẢO VỆ:
router.use(authMiddleware, adminMiddleware);

// --- QUẢN LÝ NGƯỜI CHƠI ---
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// --- QUẢN LÝ CỬA HÀNG ---
router.post('/items', adminController.createItem);
router.put('/items/:id', adminController.updateItem);
router.delete('/items/:id', adminController.deleteItem);

// --- QUẢN LÝ GAME ---
router.post('/games', adminController.createGame);
router.put('/games/:id', adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);

// Ví dụ trong file adminRoutes.js
router.get('/games', adminMiddleware, adminController.getAllGames); // Lấy toàn bộ game
router.post('/games', adminMiddleware, adminController.createGame);
// ...

module.exports = router;