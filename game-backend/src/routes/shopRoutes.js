const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middlewares/authMiddleware');
const { buyItemRules, equipItemRules } = require('../middlewares/validate');

router.get('/items', shopController.getAllItems);
router.post('/buy', authMiddleware, buyItemRules, shopController.buyItem);
router.post('/equip', authMiddleware, equipItemRules, shopController.equipItem);



module.exports = router;