const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');

// Mở cổng API: GET /api/quest/list
router.get('/list', questController.getQuests);

module.exports = router;