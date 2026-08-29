const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const uploadImage = require('../middlewares/uploadImage');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const validateFile = require('../middlewares/validateFile');

// Ruta protegida: Subir imagen (solo administradores)
router.post('/images/upload', auth, checkRole(['admin']), uploadImage.single('image'), validateFile(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], 5), imageController.uploadImage);

// Ruta protegida: Eliminar imagen (solo administradores)
router.delete('/images/:filename', auth, checkRole(['admin']), imageController.deleteImage);

module.exports = router;
