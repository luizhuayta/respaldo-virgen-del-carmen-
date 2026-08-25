const transporter = require('../config/mail.config');
const responseComplaintTemplate = require('./templates/responseComplaintTemplate');

const sendComplaintResponseMail = async (data) => {

    const html = responseComplaintTemplate(data);

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_RECEPTOR,
        replyTo: data.email,
        subject: `Respuesta emitida - ${data.tracking_code}`,
        html
    });

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: data.email,
        subject: `Respuesta a su reclamo - ${data.tracking_code}`,
        html
    });
};

module.exports = sendComplaintResponseMail;