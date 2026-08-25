const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/news.controller');
const auth = require('../middlewares/auth');

router.post('/news/create', auth, NewsController.createNew);
router.get('/news/list', NewsController.getNews);
router.put('/news/update/:id', auth, NewsController.updateNews);
router.delete('/news/delete/:id/:del', auth, NewsController.deleteNews);

module.exports = router;