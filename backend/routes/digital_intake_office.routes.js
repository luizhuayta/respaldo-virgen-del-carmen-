const express = require('express');
const router = express.Router();
const DigitalIntakeOfficeControllers = require('../controllers/digital_intake_office.controller');
const uploadDigitalIntakeOffice = require('../middlewares/uploadIntakeOffice');

router.post('/digital_intake_office/create', uploadDigitalIntakeOffice.single('attached_file'), DigitalIntakeOfficeControllers.createDigitalIntake);
router.get('/digital_intake_office/list', DigitalIntakeOfficeControllers.getDigitalIntake);
router.put('/digital_intake_office/update/:id', DigitalIntakeOfficeControllers.updateDigitalIntake);
router.delete('/digital_intake_office/delete/:id/:del', DigitalIntakeOfficeControllers.deleteDigitalIntake);
router.get('/tramites/validar/:uuid', DigitalIntakeOfficeControllers.validateDocument);
router.post('/tramites/regenerate-qr/:id', DigitalIntakeOfficeControllers.regenerateQRCode);

module.exports = router;