const db = require('../models');
const buildNewsQuery = require('../helpers/news.query');

exports.createNew = async (req, res) => {
    try {
        const { title, content, img_url, description } = req.body;

        if (!title || !img_url)
            return res.status(400).json({ error: 'Complete el título o imagen.' });

        const newContent = await db.News.create({
            title,
            content,
            img_url,
            description
        });

        return res.status(201).json(newContent);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.getNews = async (req, res) => {
    try {
        const { id } = req.query;
        const whereCondition = {};

        if (id)
            whereCondition.id = id;

        const query = buildNewsQuery(
            whereCondition,
            [['createdAt', 'DESC']]
        );
        
        const allNews = await db.News.findAll(query);
        res.status(200).json(allNews);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.updateNews = async (req, res) => {
    const { id } = req.params;
    const { title, content, img_url, description } = req.body;

    try {
        const news = await db.News.findByPk(id);

        if (!news)
            return res.status(404).json({ message: 'Noticia no encontrada.' });

        news.title = title;
        news.content = content;
        news.img_url = img_url;
        news.description = description;

        await news.save();
        res.status(200).json(news);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.deleteNews = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';

        const news = await db.News.findOne({ where: { id } });

        if (!news)
            return res.status(404).json({ message: 'Noticia no encontrada.' });

        if (del === '0') {
            await news.update({ status: false });
            fmessage = 'Noticia archivada/desactivada correctamente.'
        } else if (del === '1') {
            await news.destroy();
            fmessage = 'Noticia eliminada correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}
