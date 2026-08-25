require('dotenv').config();
const mysql = require('mysql2/promise');

async function executeSQLUpdate() {
    try {
        console.log('=== EJECUTANDO ACTUALIZACIÓN SQL EN BASE DE DATOS ===');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'virgen_del_carmen',
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ Conexión a base de datos establecida');

        // Verificar si las columnas ya existen
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'digital_intake_office' 
            AND COLUMN_NAME IN ('uuid', 'documentHash')
        `, [process.env.DB_NAME || 'virgen_del_carmen']);

        const existingColumns = columns.map(row => row.COLUMN_NAME);
        console.log('Columnas existentes:', existingColumns);

        // Agregar columna uuid si no existe
        if (!existingColumns.includes('uuid')) {
            console.log('Agregando columna uuid...');
            await connection.query(`
                ALTER TABLE digital_intake_office 
                ADD COLUMN uuid CHAR(36) NOT NULL
            `);
            console.log('✓ Columna uuid agregada');
        } else {
            console.log('✓ Columna uuid ya existe');
        }

        // Agregar columna documentHash si no existe
        if (!existingColumns.includes('documentHash')) {
            console.log('Agregando columna documentHash...');
            await connection.query(`
                ALTER TABLE digital_intake_office 
                ADD COLUMN documentHash VARCHAR(255)
            `);
            console.log('✓ Columna documentHash agregada');
        } else {
            console.log('✓ Columna documentHash ya existe');
        }

        // Agregar índice único en uuid
        try {
            console.log('Agregando índice único en uuid...');
            await connection.query(`
                ALTER TABLE digital_intake_office 
                ADD UNIQUE INDEX idx_uuid (uuid)
            `);
            console.log('✓ Índice único agregado');
        } catch (error) {
            if (error.message.includes('Duplicate key name')) {
                console.log('✓ Índice único ya existe');
            } else {
                console.log('⚠ Error al agregar índice:', error.message);
            }
        }

        // Actualizar registros sin UUID
        console.log('Actualizando registros sin UUID...');
        const [uuidUpdate] = await connection.query(`
            UPDATE digital_intake_office 
            SET uuid = UUID()
            WHERE uuid IS NULL OR uuid = ''
        `);
        console.log(`✓ ${uuidUpdate.affectedRows} registros actualizados con UUID`);

        // Generar documentHash para registros que no tienen
        console.log('Generando documentHash para registros...');
        const [hashUpdate] = await connection.query(`
            UPDATE digital_intake_office 
            SET documentHash = SHA2(CONCAT(tracking_code, '-', v_subject, '-', full_name, '-', DNI_RUC), 256)
            WHERE documentHash IS NULL OR documentHash = ''
        `);
        console.log(`✓ ${hashUpdate.affectedRows} registros actualizados con documentHash`);

        // Verificar los cambios
        console.log('\n=== VERIFICANDO CAMBIOS ===');
        const [sampleDocs] = await connection.query(`
            SELECT 
                id, 
                tracking_code, 
                uuid, 
                documentHash,
                processing_status
            FROM digital_intake_office 
            LIMIT 5
        `);

        if (sampleDocs.length > 0) {
            console.log('Documentos actualizados (primeros 5):');
            sampleDocs.forEach(doc => {
                console.log(`ID: ${doc.id}, Tracking: ${doc.tracking_code}, UUID: ${doc.uuid}`);
            });
        } else {
            console.log('No hay documentos en la base de datos');
        }

        await connection.end();
        console.log('\n=== ACTUALIZACIÓN COMPLETADA EXITOSAMENTE ===');
        console.log('La base de datos ahora está lista para el sistema de QR codes');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la actualización:', error);
        process.exit(1);
    }
}

executeSQLUpdate();