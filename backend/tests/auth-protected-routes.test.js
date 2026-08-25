process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Cargar el mismo .env que usa la app (JWT_SECRET, DB_*, etc.)
require('dotenv').config();

// app.js registra todas las rutas de forma síncrona antes de intentar
// sequelize.authenticate() / app.listen(), por lo que requerirlo aquí es
// suficiente para poder hacer peticiones HTTP contra la app con supertest.
// app.js fue ajustado para no llamar a app.listen() cuando es "required"
// (solo lo hace cuando se ejecuta directamente con `node app.js`), así se
// evita un conflicto de puerto (EADDRINUSE) con el backend que ya pueda
// estar corriendo en el puerto 3000.
const app = require('../app');
const sequelize = require('../config/db.config');

const validToken = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '1h'
});

afterAll(async () => {
    // Cerrar el pool de conexiones para que Jest pueda salir limpiamente.
    await sequelize.close();
});

describe('Rutas protegidas por el middleware auth', () => {
    test('PUT /api/reclamaciones/respond/:id sin token responde 401', async () => {
        const res = await request(app)
            .put('/api/reclamaciones/respond/1')
            .send({ admin_response: 'x', processing_status: 'Finalizado' });

        expect(res.status).toBe(401);
    });

    test('PUT /api/digital_intake_office/update/:id sin token responde 401', async () => {
        const res = await request(app)
            .put('/api/digital_intake_office/update/1')
            .send({ processing_status: 'Aceptado' });

        expect(res.status).toBe(401);
    });

    test('DELETE /api/digital_intake_office/delete/:id/:del sin token responde 401', async () => {
        const res = await request(app).delete('/api/digital_intake_office/delete/1/0');

        expect(res.status).toBe(401);
    });

    test('PUT /api/reclamaciones/respond/:id con token válido pasa el middleware auth (no responde 401)', async () => {
        const res = await request(app)
            .put('/api/reclamaciones/respond/999999')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ admin_response: 'x', processing_status: 'Finalizado' });

        // El middleware auth debe dejar pasar la petición; el resultado final
        // depende del controlador (404 si no existe la reclamación, 400 por
        // validación, etc.), pero nunca 401/403 por falta/validez de token.
        expect(res.status).not.toBe(401);
        expect(res.status).not.toBe(403);
    });
});

describe('Rutas públicas que NO deben requerir autenticación', () => {
    test('POST /api/reclamaciones/create sin token no responde 401', async () => {
        const res = await request(app)
            .post('/api/reclamaciones/create')
            .send({});

        expect(res.status).not.toBe(401);
    });

    test('POST /api/digital_intake_office/create sin token no responde 401', async () => {
        const res = await request(app)
            .post('/api/digital_intake_office/create')
            .send({});

        expect(res.status).not.toBe(401);
    });
});
