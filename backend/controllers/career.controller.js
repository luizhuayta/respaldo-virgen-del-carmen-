const db = require('../models');
const buildCareerQuery = require('../helpers/career.query');

exports.createCareer = async (req, res) => {
    try {
        const {
            history,
            mision,
            vision,
            values,
            description
        } = req.body;

        if (!history || !mision || !vision || !values) {
            return res.status(400).json({ error: 'La Historia, la mision, la vision o los valores son obligatorios.' });
        }

        const newCareer = await db.Career.create({
            history,
            mision,
            vision,
            values,
            description
        });

        return res.status(201).json(newCareer);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
};

exports.getCareer = async (req, res) => {
    try {
        const query = buildCareerQuery(
            {},
            [['createdAt', 'ASC']]
        );
        const career = await db.Career.findAll(query);
        res.status(200).json(career);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.updateCareer = async (req, res) => {
    const { id } = req.params;
    const {
        history,
        mision,
        vision,
        values,
        description
    } = req.body;

    try {
        const career = await db.Career.findByPk(id);
        if (!career)
            return res.status(404).json({ message: 'Trayectoria no encontrada.' });

        career.history = history;
        career.mision = mision;
        career.vision = vision;
        career.values = values;
        career.description = description;

        await career.save();
        res.status(200).json(career);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

