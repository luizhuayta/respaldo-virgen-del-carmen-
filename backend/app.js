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

// Validar variables de entorno críticas (ajustado para nombres existentes)
const requiredEnvVars = ['JWT_SECRET'];
const dbEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_NAME', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Solo advertir si faltan variables de base de datos, no detener servidor
const missingDbVars = dbEnvVars.filter(varName => !process.env[varName]);
if (missingDbVars.length > 0) {
    console.warn('⚠️  Advertencia: Variables de base de datos no encontradas:', missingDbVars.join(', '));
    console.warn('El servidor intentará iniciarse con configuración alternativa.');
}

if (missingEnvVars.length > 0) {
    console.error('❌ Error: Faltan variables de entorno críticas:');
    missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('El servidor no se iniciará por razones de seguridad.');
    process.exit(1);
}

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
app.use('/api', appRoutes.ImageRoutes);

app.use('/images', express.static(path.join(__dirname, 'public/images')));
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

        app.listen(PORT, () => {
            console.log(`Servidor en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error DB:', err.message);
    });

module.exports = app;