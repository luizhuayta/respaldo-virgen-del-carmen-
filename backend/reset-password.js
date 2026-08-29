const db = require('./models');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        console.log('Buscando usuario "joel perez"...');
        
        // Buscar usuario
        const user = await db.Users.findOne({ where: { username: 'joel perez' } });
        
        if (!user) {
            console.log('❌ Usuario NO encontrado. Creando usuario con contraseña conocida...');
            
            // Crear usuario con contraseña conocida
            const newUser = await db.Users.create({
                names: 'Joel',
                last_names: 'Perez',
                username: 'joel perez',
                password: 'admin123',
                description: 'Usuario administrador',
                status: true
            });
            
            console.log('✅ Usuario creado exitosamente');
            console.log('🔑 Username: joel perez');
            console.log('🔑 Password: admin123');
        } else {
            console.log('✅ Usuario encontrado. Restableciendo contraseña...');
            
            // Actualizar contraseña
            const newPassword = 'admin123';
            await user.update({ password: newPassword });
            
            console.log('✅ Contraseña restablecida exitosamente');
            console.log('🔑 Username: joel perez');
            console.log('🔑 Nueva Password: admin123');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetPassword();