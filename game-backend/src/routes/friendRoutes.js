const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/list', authMiddleware, friendController.getList);
router.get('/requests', authMiddleware, friendController.getRequests);
router.post('/request', authMiddleware, friendController.sendRequest);
router.post('/accept', authMiddleware, friendController.acceptRequest);
router.post('/reject', authMiddleware, friendController.rejectRequest);
router.post('/remove', authMiddleware, friendController.removeFriend);

module.exports = router;
