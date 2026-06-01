const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { createUserRules, createItemRules, createGameRules } = require('../middlewares/validate');

router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.post('/users', createUserRules, adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.post('/items', createItemRules, adminController.createItem);
router.put('/items/:id', adminController.updateItem);
router.delete('/items/:id', adminController.deleteItem);

router.post('/games', createGameRules, adminController.createGame);
router.put('/games/:id', adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);

router.get('/games', adminMiddleware, adminController.getAllGames);
router.post('/games/add-category', adminMiddleware, adminController.addGameCategory);

module.exports = router;