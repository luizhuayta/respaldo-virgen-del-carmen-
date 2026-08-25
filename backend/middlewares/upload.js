const multer = require('multer');
const fs = require('fs');
const path = require('path');

const normalizeType = (text) => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(?:^_+|_+$)/g, '');
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        let folder = 'investigaciones';

        if (req.originalUrl.includes('academic_papers')) {
            folder = normalizeType(req.body.type || 'otros');
        }

        const dir = path.join(
            __dirname,
            '..',
            'public',
            'pdf',
            'documents',
            folder
        );

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);

        const safeName = normalizeType(baseName);

        cb(null, `${Date.now()}-${safeName}${ext}`);
    }
});

const allowedExtensions = ['.pdf'];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (file.mimetype === 'application/pdf' && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Solo PDFs'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;