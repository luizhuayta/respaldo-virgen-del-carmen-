require('dotenv').config();
const sequelize = require('./config/db.config');
const { DataTypes } = require('sequelize');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

async function migrateDatabase() {
    try {
        console.log('=== INICIANDO MIGRACIÓN DE BASE DE DATOS ===');
        
        await sequelize.authenticate();
        console.log('✓ Conexión a base de datos establecida');

        // Verificar si las columnas ya existen
        const [results] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'digital_intake_office' 
            AND COLUMN_NAME IN ('uuid', 'documentHash')
        `);
        
        const existingColumns = results.map(row => row.COLUMN_NAME);
        console.log('Columnas existentes:', existingColumns);

        // Agregar columna uuid si no existe
        if (!existingColumns.includes('uuid')) {
            console.log('Agregando columna uuid...');
            await sequelize.query(`
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
            await sequelize.query(`
                ALTER TABLE digital_intake_office 
                ADD COLUMN documentHash VARCHAR(255) 
            `);
            console.log('✓ Columna documentHash agregada');
        } else {
            console.log('✓ Columna documentHash ya existe');
        }

        // Actualizar registros sin UUID
        console.log('Actualizando registros sin UUID...');
        const [updateResults] = await sequelize.query(`
            UPDATE digital_intake_office 
            SET uuid = UUID()
            WHERE uuid IS NULL OR uuid = ''
        `);
        console.log(`✓ ${updateResults.affectedRows} registros actualizados con UUID`);

        // Generar documentHash para registros que no tienen
        console.log('Generando documentHash para registros...');
        const documents = await sequelize.query(`
            SELECT id, tracking_code, v_subject, full_name, DNI_RUC, documentHash
            FROM digital_intake_office
            WHERE documentHash IS NULL OR documentHash = ''
        `, { type: sequelize.QueryTypes.SELECT });

        for (const doc of documents) {
            const documentContent = `${doc.tracking_code}-${doc.v_subject}-${doc.full_name}-${doc.DNI_RUC}`;
            const documentHash = crypto.createHash('sha256').update(documentContent).digest('hex');
            
            await sequelize.query(`
                UPDATE digital_intake_office 
                SET documentHash = ?
                WHERE id = ?
            `, { replacements: [documentHash, doc.id] });
        }
        console.log(`✓ ${documents.length} registros actualizados con documentHash`);

        // Agregar índice único en uuid
        try {
            console.log('Agregando índice único en uuid...');
            await sequelize.query(`
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

        console.log('=== MIGRACIÓN COMPLETADA EXITOSAMENTE ===');
        console.log('La base de datos ahora está lista para el sistema de QR codes');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrateDatabase();