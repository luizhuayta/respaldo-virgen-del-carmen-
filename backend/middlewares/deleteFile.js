const multer = require('multer');
const fs = require('fs');
const path = require('path');

const deleteFile = (fileUrl) => {
    if (!fileUrl) return;

    const cleanPath = fileUrl.replace(/^\/+/, '');

    const filePath = path.join(__dirname, '..', 'public', cleanPath);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Archivo eliminado:', filePath);
    }
};

module.exports = deleteFile;