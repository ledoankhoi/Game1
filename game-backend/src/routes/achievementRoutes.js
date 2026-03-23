const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');

router.get('/list', achievementController.getAchievements);

module.exports = router;