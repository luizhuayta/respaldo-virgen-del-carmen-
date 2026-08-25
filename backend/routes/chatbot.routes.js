const { Router } = require('express');
const { chat } = require('../controllers/chatbot.controller');

const router = Router();

router.post('/chat', chat);

module.exports = router;