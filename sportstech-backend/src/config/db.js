const mysql = require('mysql2/promise');
const path = require('path');
// Le decimos a dotenv que busque el .env en la raíz (una carpeta atrás de src)
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sportstech',
  ssl: process.env.DB_PORT == 4000 ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a la base de datos MySQL (sportstech)');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

module.exports = pool;