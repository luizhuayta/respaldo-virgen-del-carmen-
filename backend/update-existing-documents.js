require('dotenv').config();
const sequelize = require('./config/db.config');
const crypto = require('crypto');

async function updateExistingDocuments() {
    try {
        console.log('=== ACTUALIZANDO DOCUMENTOS EXISTENTES ===');
        
        await sequelize.authenticate();
        console.log('✓ Conexión a base de datos establecida');

        // Verificar cuántos documentos existen
        const [countResult] = await sequelize.query(`
            SELECT COUNT(*) as total FROM digital_intake_office
        `);
        console.log(`Total de documentos: ${countResult[0].total}`);

        if (countResult[0].total === 0) {
            console.log('No hay documentos en la base de datos. Necesitas crear uno nuevo.');
            process.exit(0);
        }

        // Actualizar UUIDs para documentos que no tienen
        console.log('Actualizando UUIDs...');
        const [uuidUpdate] = await sequelize.query(`
            UPDATE digital_intake_office 
            SET uuid = UUID()
            WHERE uuid IS NULL OR uuid = ''
        `);
        console.log(`✓ ${uuidUpdate.affectedRows} documentos actualizados con UUID`);

        // Generar documentHash para documentos que no tienen
        console.log('Generando documentHash...');
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
        console.log(`✓ ${documents.length} documentos actualizados con documentHash`);

        // Mostrar información de los documentos actualizados
        const [updatedDocs] = await sequelize.query(`
            SELECT id, tracking_code, uuid, documentHash
            FROM digital_intake_office
            LIMIT 5
        `);
        
        console.log('\n=== DOCUMENTOS ACTUALIZADOS (primeros 5) ===');
        updatedDocs.forEach(doc => {
            console.log(`ID: ${doc.id}, Tracking: ${doc.tracking_code}, UUID: ${doc.uuid}`);
        });

        console.log('\n=== ACTUALIZACIÓN COMPLETADA ===');
        console.log('Ahora puedes regenerar los QR codes usando el endpoint: POST /api/tramites/regenerate-qr/:id');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante la actualización:', error);
        process.exit(1);
    }
}

updateExistingDocuments();