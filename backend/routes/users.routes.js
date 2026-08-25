const express = require('express');
const router = express.Router();
const UsersControllers = require('../controllers/users.controller');
const auth = require('../middlewares/auth');

router.post('/users/create', auth, UsersControllers.createUsers);
router.get('/users/list', auth, UsersControllers.getUsers);
router.put('/users/update/:id', auth, UsersControllers.updateUser);
router.delete('/users/delete/:id/:del', auth, UsersControllers.deleteUser);

module.exports = router;