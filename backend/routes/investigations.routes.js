const express = require('express');
const router = express.Router();
const InvestigationsControllers = require('../controllers/investigations.controller');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');

router.post('/investigations/create', auth, upload.single('file'), InvestigationsControllers.createInvestigation);
router.get('/investigations/list', InvestigationsControllers.getInvestigations);
router.put('/investigations/update/:id', auth, upload.single('file'), InvestigationsControllers.updateInvestigation);
router.delete('/investigations/delete/:id/:del', auth, InvestigationsControllers.deleteInvestigations);

module.exports = router;
