const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { listMessages, createMessage } = require('../controllers/messageController');

const router = express.Router();

router.use(authMiddleware);

router.get('/:projectId', listMessages);
router.post('/', createMessage);

module.exports = router;
