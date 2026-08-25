process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Cargar el mismo .env que usa la app (JWT_SECRET, DB_*, etc.)
require('dotenv').config();

// Ver backend/tests/auth-protected-routes.test.js: requerir app.js no levanta
// el servidor HTTP (app.listen) porque require.main !== module, así que
// supertest puede hacer peticiones directamente sobre la app exportada.
const app = require('../app');
const sequelize = require('../config/db.config');

const validToken = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '1h'
});

afterAll(async () => {
    await sequelize.close();
});

describe('QA regression: hallazgos de seguridad', () => {

    // 1. GET /api/reclamaciones/list debe requerir auth.
    describe('1. GET /api/reclamaciones/list', () => {
        test('sin token responde 401', async () => {
            const res = await request(app).get('/api/reclamaciones/list');
            expect(res.status).toBe(401);
        });

        test('con token válido no responde 401/403', async () => {
            const res = await request(app)
                .get('/api/reclamaciones/list')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });
    });

    // 2. GET /api/digital_intake_office/list: protegido siempre por auth,
    // sin excepción por tracking_code (decisión confirmada en
    // backend/docs/AUDITORIA_SEGURIDAD.md).
    describe('2. GET /api/digital_intake_office/list', () => {
        test('sin token y sin tracking_code responde 401', async () => {
            const res = await request(app).get('/api/digital_intake_office/list');
            expect(res.status).toBe(401);
        });

        test('sin token, aunque se envíe tracking_code como query param, responde 401', async () => {
            const res = await request(app)
                .get('/api/digital_intake_office/list')
                .query({ tracking_code: 'ABC-DOC-123-00001' });

            expect(res.status).toBe(401);
        });
    });

    // 3. PUT /api/digital_intake_office/update/:id con id inexistente -> 404 (no 500).
    describe('3. PUT /api/digital_intake_office/update/:id con id inexistente', () => {
        test('con token válido responde 404', async () => {
            const res = await request(app)
                .put('/api/digital_intake_office/update/999999999')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ processing_status: 'Aceptado' });

            expect(res.status).toBe(404);
        });
    });

    // 4. Middlewares de subida deben validar extensión además de mimetype.
    describe('4. Middlewares de subida rechazan extensión no permitida aunque el mimetype sea válido', () => {
        test('upload.js (POST /api/academic_papers/create): .html con mimetype application/pdf es rechazado', async () => {
            const res = await request(app)
                .post('/api/academic_papers/create')
                .set('Authorization', `Bearer ${validToken}`)
                .field('title', 'Titulo de prueba QA')
                .field('type', 'articulo')
                .field('year', '2026')
                .attach('file', Buffer.from('<html><body>malicious</body></html>'), {
                    filename: 'malicioso.html',
                    contentType: 'application/pdf'
                });

            // No debe crearse el recurso con el archivo "disfrazado" adjunto.
            expect(res.status).not.toBe(201);
            expect(res.status).not.toBe(200);
        });

        test('personal_upload.js (POST /api/academic_personal/create): .html con mimetype application/pdf es rechazado', async () => {
            const res = await request(app)
                .post('/api/academic_personal/create')
                .set('Authorization', `Bearer ${validToken}`)
                .field('type', 'docente')
                .field('names', 'Nombre')
                .field('last_names', 'Apellido')
                .field('grade', 'Magister')
                .field('year', '2026')
                .attach('file', Buffer.from('<html><body>malicious</body></html>'), {
                    filename: 'malicioso.html',
                    contentType: 'application/pdf'
                });

            expect(res.status).not.toBe(201);
            expect(res.status).not.toBe(200);
        });

        test('uploadIntakeOffice.js (POST /api/digital_intake_office/create): .html con mimetype image/png es rechazado', async () => {
            const res = await request(app)
                .post('/api/digital_intake_office/create')
                .field('full_name', 'Nombre Apellido')
                .field('DNI_RUC', '12345678')
                .field('email', 'qa@example.com')
                .field('phone_number', '999999999')
                .field('c_condition', 'Titular')
                .field('verification_code', '123456')
                .field('document_type', 'Solicitud')
                .field('v_subject', 'Asunto de prueba')
                .field('v_message', 'Mensaje de prueba')
                .field('number_of_pages', '1')
                .attach('attached_file', Buffer.from('<html><body>malicious</body></html>'), {
                    filename: 'malicioso.html',
                    contentType: 'image/png'
                });

            expect(res.status).not.toBe(201);
            expect(res.status).not.toBe(200);
        });
    });

    // 5. Los endpoints de usuarios no deben exponer el campo "password".
    describe('5. Endpoints de usuarios no exponen "password"', () => {
        test('POST /api/users/create no incluye "password" en la respuesta', async () => {
            const res = await request(app)
                .post('/api/users/create')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    names: 'QA',
                    last_names: `Regression-${Date.now()}`,
                    username: `qa_user_${Date.now()}`,
                    password: 'Sup3rSecret!'
                });

            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
            expect(res.body).not.toHaveProperty('password');
        });

        test('GET /api/users/list no incluye "password" en ningún elemento', async () => {
            const res = await request(app)
                .get('/api/users/list')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
            expect(Array.isArray(res.body)).toBe(true);

            for (const user of res.body) {
                expect(user).not.toHaveProperty('password');
            }
        });

        test('PUT /api/users/update/:id no incluye "password" en la respuesta', async () => {
            const createRes = await request(app)
                .post('/api/users/create')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    names: 'QA',
                    last_names: `Regression-Update-${Date.now()}`,
                    username: `qa_user_update_${Date.now()}`,
                    password: 'Sup3rSecret!'
                });

            expect(createRes.status).toBe(201);
            const userId = createRes.body.id;

            const res = await request(app)
                .put(`/api/users/update/${userId}`)
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    names: 'QA',
                    last_names: 'Regression-Updated',
                    username: createRes.body.username,
                    description: 'actualizado por QA'
                });

            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
            expect(res.body).not.toHaveProperty('password');
        });
    });

    // 6. POST /api/auth/login con credenciales inválidas: 401 sin filtrar
    // el detalle interno del error en el campo "error".
    describe('6. POST /api/auth/login con credenciales inválidas', () => {
        test('responde 401 y no incluye "error" con mensaje interno', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: `usuario_inexistente_${Date.now()}`, password: 'no-existe' });

            expect(res.status).toBe(401);
            expect(res.body).not.toHaveProperty('error');
        });
    });
});
