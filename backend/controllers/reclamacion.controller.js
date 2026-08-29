const db = require('../models');
const { generateTrackingCode } = require('../helpers/reclamacion.query');
const sendComplaintResponseMail = require('../helpers/sendComplaintsBookMail');
const sendComplaintRegistrationMail = require('../helpers/sendComplaintRegistrationMail');

const createReclamacion = async (req, res) => {
    try {
        const {
            doc_type, dni,
            apellido_paterno, apellido_materno, nombres,
            telefono, email,
            department, province, district, domicilio,
            is_minor,
            parent_doc_type, parent_dni,
            parent_apellido_paterno, parent_apellido_materno, parent_nombres,
            parent_telefono, parent_email,
            parent_department, parent_province, parent_district, parent_domicilio,
            service_type, amount, service_description,
            claim_description, claim_request, claim_type
        } = req.body;

        if (!doc_type || !dni || !apellido_paterno || !apellido_materno || !nombres ||
            !telefono || !email || !department || !province || !district || !domicilio ||
            !service_type || !service_description || !claim_description || !claim_request || !claim_type) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const tracking_code = await generateTrackingCode(nombres, claim_type);

        const newReclamacion = await db.Reclamacion.create({
            tracking_code,
            doc_type,
            dni,
            apellido_paterno,
            apellido_materno,
            nombres,
            telefono,
            email,
            department,
            province,
            district,
            domicilio,
            is_minor: is_minor === 'true' || is_minor === true,
            parent_doc_type: parent_doc_type || null,
            parent_dni: parent_dni || null,
            parent_apellido_paterno: parent_apellido_paterno || null,
            parent_apellido_materno: parent_apellido_materno || null,
            parent_nombres: parent_nombres || null,
            parent_telefono: parent_telefono || null,
            parent_email: parent_email || null,
            parent_department: parent_department || null,
            parent_province: parent_province || null,
            parent_district: parent_district || null,
            parent_domicilio: parent_domicilio || null,
            service_type: Array.isArray(service_type)
                ? service_type
                : JSON.parse(service_type),
            amount: amount || null,
            service_description,
            claim_description,
            claim_request,
            claim_type,
            processing_status: 'Pendiente'
        });

        sendComplaintRegistrationMail(newReclamacion).catch(err => console.error('Error enviando correo:', err));

        return res.status(201).json(newReclamacion);
    } catch (error) {
        console.error('Error al crear reclamación:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getReclamaciones = async (req, res) => {
    try {
        const reclamaciones = await db.Reclamacion.findAll({
            where: { status: true },
            order: [['createdAt', 'DESC']]
        });
        return res.status(200).json(reclamaciones);
    } catch (error) {
        console.error('Error al obtener reclamaciones:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const respondReclamacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_response, processing_status } = req.body;

        if (!admin_response || !processing_status) {
            return res.status(400).json({ error: 'Respuesta y estado son obligatorios' });
        }

        const reclamacion = await db.Reclamacion.findByPk(id);
        if (!reclamacion) {
            return res.status(404).json({ error: 'Reclamación no encontrada' });
        }

        await reclamacion.update({
            admin_response,
            processing_status,
            responded_at: new Date()
        });

        await sendComplaintResponseMail({
            ...reclamacion.toJSON(),
            admin_response,
            processing_status
        });

        return res.status(200).json(reclamacion);
    } catch (error) {
        console.error('Error al responder reclamación:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const trackReclamacion = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Código de seguimiento requerido' });
        }

        const reclamacion = await db.Reclamacion.findOne({
            where: {
                tracking_code: code,
                status: true
            }
        });

        if (!reclamacion) {
            return res.status(404).json({ error: 'Reclamación no encontrada' });
        }

        return res.status(200).json(reclamacion);
    } catch (error) {
        console.error('Error al consultar reclamación:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { createReclamacion, getReclamaciones, respondReclamacion, trackReclamacion };
