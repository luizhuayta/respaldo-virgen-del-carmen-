const express = require('express');
const router = express.Router();
const AuthControllers = require('../controllers/auth.controller');
const loginLimiter = require('../middleware/loginLimiter');

router.post('/auth/login', loginLimiter, AuthControllers.login);

module.exports = router;