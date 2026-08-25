require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const sequelize = require('./config/db.config');
const appRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        'https://eespvirgendelcarmen.edu.pe',
        'http://eespvirgendelcarmen.edu.pe',
        'https://api.eespvirgendelcarmen.edu.pe',
        'http://api.eespvirgendelcarmen.edu.pe',
        'http://localhost:4200'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                imgSrc: [
                    "'self'",
                    "data:",
                    "https:",
                    "http:",
                    "https://api.eespvirgendelcarmen.edu.pe",
                    "http://localhost:3000",
                    "https://scontent.fpio4-1.fna.fbcdn.net"
                ],
                frameSrc: [
                    "'self'",
                    "https://api.eespvirgendelcarmen.edu.pe",
                    "http://localhost:3000"
                ],
                frameAncestors: [
                    "'self'",
                    "https://eespvirgendelcarmen.edu.pe",
                    "http://eespvirgendelcarmen.edu.pe",
                    "http://localhost:4200"
                ]
            },
        },
    })
);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', appRoutes.AcademicPersonalRoutes);
app.use('/api', appRoutes.CareerRoutes);
app.use('/api', appRoutes.ContactsRoutes);
app.use('/api', appRoutes.InvestigationsRoutes);
app.use('/api', appRoutes.NewsRoutes);
app.use('/api', appRoutes.PressReleasesRoutes);
app.use('/api', appRoutes.UsersRoutes);
app.use('/api', appRoutes.AcademicPapersRoutes);
app.use('/api', appRoutes.AuthRoutes);
app.use('/api', appRoutes.DigitalIntakeOfficeRoutes);
app.use('/api', appRoutes.ReclamacionRoutes);
app.use('/api', appRoutes.chatbotRoutes);

app.use('/pdf', express.static(path.join(__dirname, 'public/pdf')));
app.use('/personal_cv', express.static(path.join(__dirname, 'public/personal_cv')));

app.get('/', (req, res) => {
    res.send('Bienvenido');
});

app.get('/test', (req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV });
});

sequelize.authenticate()
    .then(() => {
        console.log('DB conectada');

        // Solo levantar el servidor HTTP cuando app.js se ejecuta directamente
        // (node app.js / npm start). Cuando este módulo es requerido por otro
        // proceso (por ejemplo, los tests de integración con supertest), se evita
        // llamar a app.listen() para no colisionar con un servidor ya en
        // ejecución en el mismo puerto.
        if (require.main === module) {
            app.listen(PORT, () => {
                console.log(`Servidor en http://localhost:${PORT}`);
            });
        }
    })
    .catch(err => {
        console.error('Error DB:', err.message);
    });

module.exports = app;