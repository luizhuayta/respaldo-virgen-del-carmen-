const express = require('express');
const router = express.Router();
const reclamacionController = require('../controllers/reclamacion.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const validateFile = require('../middlewares/validateFile');

// Ruta pública: Crear reclamación (Libro de Reclamaciones)
router.post('/reclamaciones/create', validateFile(['application/pdf'], 1), reclamacionController.createReclamacion);

// Ruta pública: Consultar por código de seguimiento
router.get('/reclamaciones/track', reclamacionController.trackReclamacion);

// Rutas protegidas: Solo administradores
router.get('/reclamaciones/list', auth, checkRole(['admin']), reclamacionController.getReclamaciones);
router.put('/reclamaciones/respond/:id', auth, checkRole(['admin']), reclamacionController.respondReclamacion);

module.exports = router;
