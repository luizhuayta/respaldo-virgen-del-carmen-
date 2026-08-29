const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../public/images');

// Asegurar que el directorio existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
        }

        const imageUrl = `/images/${req.file.filename}`;
        
        res.status(201).json({
            message: 'Imagen subida exitosamente',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ message: 'Error al subir la imagen' });
    }
};

const deleteImage = (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadDir, filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return res.status(200).json({ message: 'Imagen eliminada exitosamente' });
        }

        return res.status(404).json({ message: 'Imagen no encontrada' });
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        res.status(500).json({ message: 'Error al eliminar la imagen' });
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
