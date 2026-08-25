const express = require('express');
const router = express.Router();
const reclamacionController = require('../controllers/reclamacion.controller');
const auth = require('../middlewares/auth');

router.post('/reclamaciones/create', reclamacionController.createReclamacion);
router.get('/reclamaciones/list', auth, reclamacionController.getReclamaciones);
router.put('/reclamaciones/respond/:id', auth, reclamacionController.respondReclamacion);

module.exports = router;
