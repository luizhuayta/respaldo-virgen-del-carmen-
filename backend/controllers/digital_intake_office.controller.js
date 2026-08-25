const db = require('../models');
const buildDigitalIntakeOfficeQuery = require('../helpers/digital_intake_office.query');
const deleteFile = require('../middlewares/deleteFile');
const { where } = require('sequelize');
const sendDigitalIntakeMail = require('../helpers/sendDigitalIntakeMail');

const generateTrackingCode = async (
    full_name,
    document_type,
    DNI_RUC
) => {
    const initials = full_name
        .trim()
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();

    const docType = document_type
        .replace(/\s+/g, '')
        .substring(0, 3)
        .toUpperCase();

    const dniPart = DNI_RUC.toString().slice(-3);

    const prefix = `${initials}-${docType}-${dniPart}`;

    const count = await db.DigitalIntakeOffice.count({
        where: {
            full_name,
            document_type,
            DNI_RUC
        }
    });

    // correlativo
    const correlativo = String(count + 1).padStart(5, '0');

    return `${prefix}-${correlativo}`;
};

exports.createDigitalIntake = async (req, res) => {
    try {
        const {
            full_name,
            DNI_RUC,
            email,
            phone_number,
            c_condition,
            verification_code,
            document_type,
            v_subject,
            v_message,
            number_of_pages,
            document_url,
            description
        } = req.body;

        if (
            !full_name ||
            !DNI_RUC ||
            !email ||
            !phone_number ||
            !c_condition ||
            !verification_code ||
            !document_type ||
            !v_subject ||
            !v_message ||
            !number_of_pages
        ) {
            if (req.file) {
                deleteFile(`/pdf/documents/digital_intake_office/${req.file.filename}`);
            }

            return res.status(400).json({ error: 'Complete los campos obligatorios' });
        }

        if (!req.file && !document_url) {
            return res.status(400).json({ error: 'Debe adjuntar un archivo o un enlace' });
        }

        let attached_file_url = null;

        if (req.file) {
            attached_file_url = `/pdf/documents/digital_intake_office/${req.file.filename}`;
        }

        const tracking_code = await generateTrackingCode(
            full_name,
            document_type,
            DNI_RUC
        );

        const newDigitalIntake = await db.DigitalIntakeOffice.create({
            full_name,
            DNI_RUC,
            email,
            phone_number,
            c_condition,
            verification_code,
            document_type,
            v_subject,
            v_message,
            number_of_pages,
            attached_file_url,
            document_url,
            processing_status: 'Pendiente',
            tracking_code,
            description
        });

        sendDigitalIntakeMail(newDigitalIntake).catch(err => console.error('Error enviando correo:', err));

        return res.status(201).json(newDigitalIntake);
    } catch (error) {
        console.error(error.message);
        if (req.file) {
            deleteFile(`/pdf/documents/digital_intake_office/${req.file.filename}`);
        }
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
};

exports.getDigitalIntake = async (req, res) => {
    try {
        const { tracking_code } = req.query;
        const whereCondition = {};

        if (tracking_code) {
            whereCondition.tracking_code = tracking_code;
            whereCondition.status = true;
        }

        const query = buildDigitalIntakeOfficeQuery(
            whereCondition,
            [['createdAt', 'ASC']]
        );

        const digitalIntake = await db.DigitalIntakeOffice.findAll(query);

        res.status(200).json(digitalIntake);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo de nuevo más tarde.' });
    }
}

exports.updateDigitalIntake = async (req, res) => {
    try {
        const { id } = req.params;
        const { processing_status } = req.body;

        const tramite = await db.DigitalIntakeOffice.findByPk(id);

        if (!tramite)
            return res.status(404).json({ message: 'Trámite no encontrado' });

        const estadoActual = tramite.processing_status;

        if (estadoActual === 'Finalizado') {
            return res.status(400).json({
                message: 'El trámite ya fue finalizado.'
            });
        }

        if (
            estadoActual === 'Pendiente' &&
            !['Aceptado', 'Rechazado'].includes(processing_status)
        ) {
            return res.status(400).json({
                message: 'Estado inválido.'
            });
        }

        if (
            ['Aceptado', 'Rechazado'].includes(estadoActual) &&
            processing_status !== 'Finalizado'
        ) {
            return res.status(400).json({
                message: 'Solo puede finalizar el trámite.'
            });
        }

        tramite.processing_status = processing_status;
        await tramite.save();

        return res.status(200).json({ message: 'Estado actualizado con éxito', tramite });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno al actualizar el estado.' });
    }
};

exports.deleteDigitalIntake = async (req, res) => {
    try {
        const { id, del } = req.params;
        let fmessage = '';

        const tramite = await db.DigitalIntakeOffice.findOne({ where: { id } });
        if (!tramite)
            return res.status(404).json({ message: 'Trámite no encontrado' });

        if (del === '0') {
            await tramite.update({ status: false });
            fmessage = 'Trámite archivado/desactivado correctamente.'
        } else if (del === '1') {
            deleteFile(tramite.attached_file_url);
            await tramite.destroy();
            fmessage = 'Trámite eliminado correctamente.'
        } else {
            return res.status(400).json({ message: 'Tipo de eliminación no válido.' });
        }

        return res.status(200).json({ message: fmessage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno al eliminar el trámite.' });
    }
};