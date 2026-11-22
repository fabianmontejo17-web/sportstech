const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function actualizarUsuarios() {
  try {
    console.log('⏳ Encriptando contraseña...');
    // Vamos a encriptar la contraseña "123456"
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash('123456', salt);

    console.log('⏳ Actualizando contraseñas en MySQL...');
    
    // Actualizamos los 3 usuarios con la misma contraseña (123456)
    await db.query(
      `UPDATE usuarios SET password_hash = ? WHERE email IN (?, ?, ?)`,
      [passwordEncriptada, 'admin@sportstech.test', 'arbitro@sportstech.test', 'delegado@sportstech.test']
    );

    console.log('✅ ¡Contraseñas actualizadas con éxito!');
    console.log('🔑 La contraseña para los 3 usuarios ahora es: 123456');
    
    process.exit(0); // Terminamos el script
  } catch (error) {
    console.error('❌ Error al actualizar los usuarios:', error.message);
    process.exit(1);
  }
}

actualizarUsuarios();