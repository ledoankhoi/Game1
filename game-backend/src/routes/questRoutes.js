const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const authMiddleware = require('../middlewares/authMiddleware');
const { claimQuestRules } = require('../middlewares/validate');

router.get('/list', authMiddleware, questController.getQuests);
router.post('/claim', authMiddleware, claimQuestRules, questController.claimQuest);

module.exports = router;