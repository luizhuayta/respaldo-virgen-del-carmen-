const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    //host: process.env.MAIL_HOST,
    //port: Number(process.env.MAIL_PORT),
    //secure: true,
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

transporter.verify((error) => {
    if (error) {
        console.error('SMTP ERROR:', error);
    } else {
        console.log('SMTP OK');
    }
});

module.exports = transporter;