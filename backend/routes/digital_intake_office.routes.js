const express = require('express');
const router = express.Router();
const DigitalIntakeOfficeControllers = require('../controllers/digital_intake_office.controller');
const uploadDigitalIntakeOffice = require('../middlewares/uploadIntakeOffice');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const validateFile = require('../middlewares/validateFile');

// Ruta pública: Crear trámite (Mesa de Partes)
router.post('/digital_intake_office/create', uploadDigitalIntakeOffice.single('attached_file'), validateFile(['application/pdf'], 1), DigitalIntakeOfficeControllers.createDigitalIntake);

// Ruta pública: Consultar por código de seguimiento
router.get('/digital_intake_office/track', DigitalIntakeOfficeControllers.trackDigitalIntake);

// Rutas protegidas: Solo administradores
router.get('/digital_intake_office/list', auth, checkRole(['admin']), DigitalIntakeOfficeControllers.getDigitalIntake);
router.put('/digital_intake_office/update/:id', auth, checkRole(['admin']), DigitalIntakeOfficeControllers.updateDigitalIntake);
router.delete('/digital_intake_office/delete/:id/:del', auth, checkRole(['admin']), DigitalIntakeOfficeControllers.deleteDigitalIntake);

module.exports = router;