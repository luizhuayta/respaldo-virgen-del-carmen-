const fs = require('fs');

// Bytes mágicos para validación de tipos de archivo
const magicNumbers = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
};

const validateFileType = (buffer, expectedMimeType) => {
    const expectedMagic = magicNumbers[expectedMimeType];
    if (!expectedMagic) return true; // Si no tenemos validación, permitir

    for (let i = 0; i < expectedMagic.length; i++) {
        if (buffer[i] !== expectedMagic[i]) {
            return false;
        }
    }
    return true;
};

const validateFile = (allowedMimeTypes = ['application/pdf'], maxSizeMB = 1) => {
    return (req, res, next) => {
        if (!req.file) {
            return next();
        }

        // Validar tamaño
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (req.file.size > maxSizeBytes) {
            fs.unlinkSync(req.file.path);
            return res.status(413).json({ 
                message: `El archivo excede el tamaño máximo de ${maxSizeMB}MB` 
            });
        }

        // Validar tipo por bytes mágicos
        const buffer = fs.readFileSync(req.file.path);
        const isValid = allowedMimeTypes.some(mimeType => 
            validateFileType(buffer, mimeType)
        );

        if (!isValid) {
            fs.unlinkSync(req.file.path);
            return res.status(415).json({ 
                message: 'Tipo de archivo no válido. Se permite: ' + allowedMimeTypes.join(', ') 
            });
        }

        next();
    };
};

module.exports = validateFile;
