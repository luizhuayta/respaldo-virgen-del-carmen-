const multer = require('multer');
const fs = require('fs');
const path = require('path');

const normalizeName = (text) => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(?:^_+|_+$)/g, '');
};

const ALLOWED_FOLDERS = ['noticias', 'comunicados', 'personal', 'galeria', 'general'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = normalizeName(req.body.folder || 'general');

        if (!ALLOWED_FOLDERS.includes(folder)) {
            folder = 'general';
        }

        const dir = path.join(__dirname, '..', 'public', 'images', folder);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const baseName = path.basename(file.originalname, ext);
        const safeName = normalizeName(baseName);

        cb(null, `${Date.now()}-${safeName}${ext}`);
    }
});

const ALLOWED_MIMES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no permitido. Solo se aceptan JPG, PNG, WEBP o GIF.'), false);
    }
};

const uploadImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = uploadImage;
