const db = require('../models');
const buildAcademicPapersQuery = require('../helpers/academic_papers.query');
const deleteFile = require('../middlewares/deleteFile');
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

exports.createAcademicPaper = async (req, res) => {
    try {
        const { title, type, year, description } = req.body;

        if (!title || !type || !year) {
            if (req.file) {
                const relDir = req.file.destination
                    .replace(/\\/g, '/')
                    .split('/public')[1];

                deleteFile(`${relDir}/${req.file.filename}`);
            }
            return res.status(400).json({ error: 'Complete los campos obligatorios.' });
        }

        let pdf_url = null;

        if (req.file) {
            const folder = normalizeType(type);
            pdf_url = `/pdf/documents/${folder}/${req.file.filename}`;
        }

        const newAcademicPaper = await db.AcademicPapers.create({
            title, type, pdf_url, year, description
        });

        return res.status(201).json(newAcademicPaper);
    } catch (e) {
        if (req.file) {
            const relDir = req.file.destination
                .replace(/\\/g, '/')
                .split('/public')[1];

            deleteFile(`${relDir}/${req.file.filename}`);
        }

        console.error(e.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.getAcademicPapers = async (req, res) => {
    try {
        const { type } = req.query;
        const whereCondition = {};

        if (type)
            whereCondition.type = type;

        const query = buildAcademicPapersQuery(
            whereCondition,
            [['createdAt', 'ASC']]
        );

        const academicPapers = await db.AcademicPapers.findAll(query);
        res.status(200).json(academicPapers);
    } catch (e) {
        console.error(e.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.updateAcademicPaper = async (req, res) => {

    const { id } = req.params;
    const { title, type, year, description } = req.body;

    try {
        const academicPaper = await db.AcademicPapers.findByPk(id);

        if (!academicPaper)
            return res.status(404).json({ message: 'Documento no encontrado.' });

        const oldFolder = normalizeType(academicPaper.type);
        const newFolder = normalizeType(type);

        if (req.file) {
            deleteFile(academicPaper.pdf_url);
            academicPaper.pdf_url = `/pdf/documents/${newFolder}/${req.file.filename}`;
        }

        else if (
            academicPaper.pdf_url &&
            oldFolder !== newFolder
        ) {
            const oldPath = path.join(
                __dirname,
                '..',
                'public',
                academicPaper.pdf_url
            );

            const fileName = path.basename(oldPath);

            const newDir = path.join(
                __dirname,
                '..',
                'public',
                'pdf',
                'documents',
                newFolder
            );

            if (!fs.existsSync(newDir)) {
                fs.mkdirSync(newDir, { recursive: true });
            }

            const newPath = path.join(newDir, fileName);

            if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
            }

            academicPaper.pdf_url = `/pdf/documents/${newFolder}/${fileName}`;
        }

        academicPaper.title = title;
        academicPaper.type = type;
        academicPaper.year = year;
        academicPaper.description = description;

        await academicPaper.save();
        return res.status(200).json(academicPaper);
    } catch (e) {
        if (req.file) {
            const relDir = req.file.destination
                .replace(/\\/g, '/')
                .split('/public')[1];

            deleteFile(`${relDir}/${req.file.filename}`);
        }

        console.error(e.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
};

exports.deleteAcademicPaper = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';
        const academicPaper = await db.AcademicPapers.findOne({ where: { id } });
        if (!academicPaper)
            return res.status(404).json({ message: 'Documento no encontrado.' });

        if (del === '0') {
            await academicPaper.update({ status: false });
            fmessage = 'Documento archivado/desactivado correctamente.'
        } else if (del === '1') {
            deleteFile(academicPaper.pdf_url);
            await academicPaper.destroy();
            fmessage = 'Documento eliminado correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (e) {
        console.error(e.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}