const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/convert', upload.single('file'), documentController.convertFile);

router.post('/chat', upload.single('file'), documentController.chatWithFile);

router.post('/import-knowledge', authMiddleware, adminMiddleware, upload.single('file'), documentController.importKnowledge);

module.exports = router;
