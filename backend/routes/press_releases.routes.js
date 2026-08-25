const express = require('express');
const router = express.Router();
const PressReleasesControllers = require('../controllers/press_releases.controller');
const auth = require('../middlewares/auth');

router.post('/press_releases/create', auth, PressReleasesControllers.createPressRelease);
router.get('/press_releases/list', PressReleasesControllers.getPressRelease);
router.put('/press_releases/update/:id', auth, PressReleasesControllers.updatePressRelease);
router.delete('/press_releases/delete/:id/:del', auth, PressReleasesControllers.deletePressReleases);

module.exports = router;