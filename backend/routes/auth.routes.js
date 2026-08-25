const express = require('express');
const router = express.Router();
const AuthControllers = require('../controllers/auth.controller');

router.post('/auth/login', AuthControllers.login);

module.exports = router;