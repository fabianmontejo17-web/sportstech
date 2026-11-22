const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const db = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // NOTA: Si en tu base de datos la contraseña está en texto plano, cambia esto por:
    // const passwordValido = (password === usuario.password_hash);
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    
    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol_id
      }
    });

  } catch (error) {
    console.error("❌ ERROR EN LOGIN DETALLADO:", error);
    res.status(500).json({ ok: false, mensaje: 'Error en el servidor', detalle: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, email, rol_id FROM usuarios WHERE id = ?', [req.usuario.id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    
    res.json({ ok: true, usuario: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error en el servidor' });
  }
});

module.exports = router;