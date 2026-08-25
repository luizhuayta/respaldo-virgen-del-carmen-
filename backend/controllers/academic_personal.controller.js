const db = require('../models');
const buildAcademicPersonalQuery = require('../helpers/academic_personal.query');
const deleteFile = require('../middlewares/deleteFile'); 

exports.createAcademicPersonal = async (req, res) => {
    try {
        const { type, names, last_names, position, area, grade, img_url, year, institucional_email, description } = req.body;

        if (!type || !names || !last_names || !grade || !year) {
            if (req.file)                                                                        
                deleteFile(`${req.file.destination.replace(/\\/g, '/').split('/public')[1]}/${req.file.filename}`);
            return res.status(400).json({ error: 'Complete todos los campos.' });
        }

        let pdf_url = null;   

        if (req.file) {                  
            pdf_url = `/personal_cv/${req.file.filename}`;
        }

        const newAcademicPersonal = await db.AcademicPersonal.create({
            type,
            names,
            last_names,
            position,
            area,  
            grade,
            img_url,
            pdf_url,    
            year,
            institucional_email,
            description
        });
        return res.status(201).json(newAcademicPersonal);
    } catch (error) {
        if (req.file)  
            deleteFile(`${req.file.destination.replace(/\\/g, '/').split('/public')[1]}/${req.file.filename}`);
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
};

exports.getAcademicPersonal = async (req, res) => {
    try {
        const query = buildAcademicPersonalQuery(
            {},
            [['createdAt', 'ASC']]
        );
        const academicPersonal = await db.AcademicPersonal.findAll(query);
        res.status(200).json(academicPersonal);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
};

exports.updateAcademicPersonal = async (req, res) => {
    const { id } = req.params;
    const { type, names, last_names, position, area, grade, description, img_url, year, institucional_email } = req.body;
    
    try {
        const academicPersonal = await db.AcademicPersonal.findByPk(id);

        if (!academicPersonal)
            return res.status(404).json({ message: 'Personal académico no encontrado.' });

        if (req.file) {
            deleteFile(academicPersonal.pdf_url);
            academicPersonal.pdf_url = `/personal_cv/${req.file.filename}`;
        }

        academicPersonal.type = type;
        academicPersonal.names = names;
        academicPersonal.last_names = last_names;
        academicPersonal.position = position;
        academicPersonal.area = area;       
        academicPersonal.grade = grade;
        academicPersonal.institucional_email = institucional_email;
        academicPersonal.img_url = img_url;
        academicPersonal.year = year;
        academicPersonal.description = description;

        await academicPersonal.save();
        res.status(200).json(academicPersonal);
    } catch (error) {
        if (req.file)
            deleteFile(`${req.file.destination.replace(/\\/g, '/').split('/public')[1]}/${req.file.filename}`);
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.deleteAcademicPersonal = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';
        const academicPersonal = await db.AcademicPersonal.findOne({ where: { id } });

        if (!academicPersonal)
            return res.status(404).json({ message: 'Personal académico no encontrado.' });

        if (del === '0') {
            await academicPersonal.update({ status: false });
            fmessage = 'Personal académico archivado/desactivado correctamente.'
        } else if (del === '1') {
            deleteFile(academicPersonal.pdf_url);
            await academicPersonal.destroy();
            fmessage = 'Personal académico eliminado correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}