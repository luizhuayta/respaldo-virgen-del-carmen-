const db = require('../models');
const buildInvestigationsQuery = require('../helpers/investigations.query');
const deleteFile = require('../middlewares/deleteFile');

exports.createInvestigation = async (req, res) => {
    try {
        const { title, author, content, publication_date, description } = req.body;

        if (!title || !content) {
            if (req.file) {
                deleteFile(`${req.file.destination.replace(/\\/g, '/').split('/public')[1]}/${req.file.filename}`);
            }
            return res.status(400).json({ error: 'Complete los campos obligatorios.' });
        }

        let pdf_url = null;

        if (req.file) {
            pdf_url = `/pdf/documents/investigaciones/${req.file.filename}`;
        }

        const newInvestigation = await db.Investigations.create({
            title,
            author,
            content,
            pdf_url,
            publication_date,
            description
        });

        return res.status(201).json(newInvestigation);
    } catch (error) {
        if (req.file)
            deleteFile(`${req.file.destination.replace(/\\/g, '/').split('/public')[1]}/${req.file.filename}`);

        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
};

exports.getInvestigations = async (req, res) => {
    try {
        const { id } = req.query;
        const whereCondition = {};

        if (id)
            whereCondition.id = id;

        const query = buildInvestigationsQuery(
            whereCondition,
            [['publication_date', 'DESC']]
        );

        const investigation = await db.Investigations.findAll(query);

        return res.status(200).json(investigation);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo de nuevo más tarde.'
        });
    }
}

exports.updateInvestigation = async (req, res) => {
    const { id } = req.params;
    const { title, author, content, publication_date, description } = req.body;
    try {
        const investigations = await db.Investigations.findByPk(id);

        if (!investigations)
            return res.status(404).json({ message: 'Investigación no encontrada.' });

        if (req.file) {
            deleteFile(investigations.pdf_url);
            investigations.pdf_url = `/pdf/documents/investigaciones/${req.file.filename}`;
        }

        investigations.title = title;
        investigations.content = content;
        investigations.author = author;
        investigations.publication_date = publication_date;
        investigations.description = description;

        await investigations.save();
        res.status(200).json(investigations);
    } catch (error) {
        if (req.file)
            deleteFile(`${req.file.destination.replace(/\\/g, '/').split('/public')[1]}/${req.file.filename}`);

        console.error(error.message);
        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo de nuevo más tarde.'
        });
    }
}

exports.deleteInvestigations = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';

        const investigation = await db.Investigations.findOne({ where: { id } });
        if (!investigation)
            return res.status(404).json({ message: 'Investigación no encontrada.' });

        if (del === '0') {
            await investigation.update({ status: false });
            fmessage = 'Investigación archivada/desactivada correctamente.'
        } else if (del === '1') {
            deleteFile(investigation.pdf_url);
            await investigation.destroy();
            fmessage = 'Investigación eliminada correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message: 'Error interno del servidor. Inténtelo de nuevo más tarde.'
        });
    }
}
