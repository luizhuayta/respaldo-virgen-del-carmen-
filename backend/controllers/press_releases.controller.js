const db = require('../models');
const buildPressReleasesQuery = require('../helpers/press_releases.query');

exports.createPressRelease = async (req, res) => {
    try {
        const { title, press_release, img_url, description } = req.body;

        if (!title || !img_url)
            return res.status(400).json({error: 'Complete los campos obligatorios.'});

        const newPressRelease = await db.PressReleases.create({
            title,
            press_release,
            img_url,
            description
        });

        return res.status(201).json(newPressRelease);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
};

exports.getPressRelease = async (req, res) => {
    try {
        const { id } = req.query;
        const whereCondition = {};

        if (id)
            whereCondition.id = id;

        const query = buildPressReleasesQuery(
            whereCondition,
            [['createdAt', 'DESC']]
        );

        const pressReleases = await db.PressReleases.findAll(query);
        res.status(200).json(pressReleases);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.updatePressRelease = async (req, res) => {
    const { id } = req.params;
    const { title, press_release, img_url, description } = req.body;
    try {
        const press_releases = await db.PressReleases.findByPk(id);

        if (!press_releases)
            return res.status(404).json({ message: 'Comunicado no encontrado.' });

        press_releases.title = title;
        press_releases.press_release = press_release;
        press_releases.img_url = img_url;
        press_releases.description = description;

        await press_releases.save();
        res.status(200).json(press_releases);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.deletePressReleases = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';

        const pressReleases = await db.PressReleases.findOne({ where: { id } });
        if (!pressReleases)
            return res.status(404).json({ message: 'Comunicado no encontrado.' });

        if (del === '0') {
            await pressReleases.update({ status: false });
            fmessage = 'Comunicado archivado/desactivado correctamente.'
        } else if (del === '1') {
            await pressReleases.destroy();
            fmessage = 'Comunicado eliminado correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}