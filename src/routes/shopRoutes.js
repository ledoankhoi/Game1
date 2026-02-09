/* File: src/routes/shopRoutes.js */
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.post('/buy', shopController.buyItem);

module.exports = router;