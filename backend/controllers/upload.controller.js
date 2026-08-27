const fs = require('fs');
const path = require('path');

const IMAGES_ROOT = path.join(__dirname, '..', 'public', 'images');

const buildPublicUrl = (req, folder, filename) => {
    return `${req.protocol}://${req.get('host')}/images/${folder}/${filename}`;
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se recibio ningun archivo.' });
        }

        const folder = path.basename(path.dirname(req.file.path));

        return res.status(201).json({
            message: 'Imagen subida correctamente.',
            filename: req.file.filename,
            folder: folder,
            size: req.file.size,
            url: buildPublicUrl(req, folder, req.file.filename)
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        return res.status(500).json({ message: 'Error interno al subir la imagen.' });
    }
};

exports.listImages = async (req, res) => {
    try {
        const folder = req.params.folder;
        const dir = path.join(IMAGES_ROOT, folder);

        if (!dir.startsWith(IMAGES_ROOT)) {
            return res.status(400).json({ message: 'Ruta no valida.' });
        }

        if (!fs.existsSync(dir)) {
            return res.status(200).json([]);
        }

        const files = fs.readdirSync(dir).map(name => {
            const stats = fs.statSync(path.join(dir, name));
            return {
                filename: name,
                size: stats.size,
                createdAt: stats.birthtime,
                url: buildPublicUrl(req, folder, name)
            };
        });

        return res.status(200).json(files);
    } catch (error) {
        console.error('Error al listar imagenes:', error);
        return res.status(500).json({ message: 'Error interno al listar las imagenes.' });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { folder, filename } = req.params;
        const filePath = path.join(IMAGES_ROOT, folder, filename);

        if (!filePath.startsWith(IMAGES_ROOT)) {
            return res.status(400).json({ message: 'Ruta no valida.' });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'La imagen no existe.' });
        }

        fs.unlinkSync(filePath);

        return res.status(200).json({ message: 'Imagen eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar imagen:', error);
        return res.status(500).json({ message: 'Error interno al eliminar la imagen.' });
    }
};
