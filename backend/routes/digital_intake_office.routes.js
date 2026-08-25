const express = require('express');
const router = express.Router();
const DigitalIntakeOfficeControllers = require('../controllers/digital_intake_office.controller');
const uploadDigitalIntakeOffice = require('../middlewares/uploadIntakeOffice');
const auth = require('../middlewares/auth');

router.post('/digital_intake_office/create', uploadDigitalIntakeOffice.single('attached_file'), DigitalIntakeOfficeControllers.createDigitalIntake);
router.get('/digital_intake_office/list', auth, DigitalIntakeOfficeControllers.getDigitalIntake);
router.put('/digital_intake_office/update/:id', auth, DigitalIntakeOfficeControllers.updateDigitalIntake);
router.delete('/digital_intake_office/delete/:id/:del', auth, DigitalIntakeOfficeControllers.deleteDigitalIntake);

module.exports = router;