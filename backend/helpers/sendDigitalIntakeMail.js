const transporter = require('../config/mail.config');
const digitalIntakeTemplate = require('./templates/digitalIntakeTemplate');
const path = require('path');

const sendDigitalIntakeMail = async (data) => {

    const attachments = [];

    if (data.attached_file_url) {
        attachments.push({
            filename: path.basename(
                data.attached_file_url
            ),
            path: path.join(
                process.cwd(),
                'public',
                data.attached_file_url.replace(/^\//, '')
            )
        });
    }

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_RECEPTOR,
        replyTo: data.email,
        subject: `Mesa de Partes Virtual - Nuevo trámite - ${data.tracking_code}`,
        html: digitalIntakeTemplate(data),
        attachments
    });

    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: data.email,
        subject: `I.E.S.P.P. Virgen del Carmen - Constancia de recepción - ${data.tracking_code}`,
        html: digitalIntakeTemplate(data),
        attachments
    });
};

module.exports = sendDigitalIntakeMail;