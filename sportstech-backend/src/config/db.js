const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sportstech',
  
  // CONFIGURACIÓN CLAVE PARA LA NUBE (TiDB Cloud)
  // Si DB_HOST no es localhost, forzamos SSL. Si es local, lo desactivamos.
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' 
    ? { 
        minVersion: 'TLSv1.2', 
        rejectUnauthorized: false // Evita errores de certificado con TiDB
      } 
    : null,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probamos la conexión al iniciar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a la base de datos MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

module.exports = pool;