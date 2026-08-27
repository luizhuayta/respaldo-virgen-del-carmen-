const express = require('express');
const router = express.Router();
const UploadControllers = require('../controllers/upload.controller');
const uploadImage = require('../middlewares/uploadImage');
const auth = require('../middlewares/auth');

router.post('/images/upload', auth, uploadImage.single('image'), UploadControllers.uploadImage);
router.get('/images/list/:folder', auth, UploadControllers.listImages);
router.delete('/images/delete/:folder/:filename', auth, UploadControllers.deleteImage);

router.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
});

module.exports = router;
