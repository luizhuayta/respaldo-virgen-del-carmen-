const transporter = require('../config/mail.config');
const complaintRegistrationTemplate = require('./templates/complaintRegistrationTemplate');

const sendComplaintRegistrationMail = async (data) => {

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_RECEPTOR,
        replyTo: data.email,
        subject: `Libro de Reclamaciones - Nuevo registro - ${data.tracking_code}`,
        html: complaintRegistrationTemplate(data)
    });

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: data.email,
        subject: `I.E.S.P.P. Virgen del Carmen - Constancia de registro de reclamo - ${data.tracking_code}`,
        html: complaintRegistrationTemplate(data)
    });

};

module.exports = sendComplaintRegistrationMail;