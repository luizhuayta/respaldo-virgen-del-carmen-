const express = require('express');
const router = express.Router();
const AcademicPapersControllers = require('../controllers/academic_papers.controller');
const upload = require('../middlewares/upload');
const auth = require('../middlewares/auth');

router.post('/academic_papers/create', auth, upload.single('file'), AcademicPapersControllers.createAcademicPaper);
router.get('/academic_papers/list', AcademicPapersControllers.getAcademicPapers);
router.put('/academic_papers/update/:id', auth, upload.single('file'), AcademicPapersControllers.updateAcademicPaper);
router.delete('/academic_papers/delete/:id/:del', auth, AcademicPapersControllers.deleteAcademicPaper);

module.exports = router;