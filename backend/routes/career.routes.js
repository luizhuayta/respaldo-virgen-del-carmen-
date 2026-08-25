const express = require('express');
const router = express.Router();
const CareerControllers = require('../controllers/career.controller');
const auth = require('../middlewares/auth');

router.post('/career/create', auth, CareerControllers.createCareer);
router.get('/career/list', CareerControllers.getCareer);
router.put('/career/update/:id', auth, CareerControllers.updateCareer);

module.exports = router;