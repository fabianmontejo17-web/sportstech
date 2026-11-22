const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// GET /api/equipos (Lista de equipos)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [equipos] = await db.query(`
      SELECT e.id, e.nombre, COUNT(je.jugador_id) AS jugadores
      FROM equipos e
      LEFT JOIN jugadores_equipo je ON e.id = je.equipo_id
      GROUP BY e.id
    `);
    res.json({ ok: true, equipos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cargar equipos' });
  }
});

// GET /api/equipos/:id/plantilla
router.get('/:id/plantilla', authMiddleware, async (req, res) => {
  try {
    const [jugadores] = await db.query(`
      SELECT j.id, j.nombre, j.apellidos, je.dorsal
      FROM jugadores j
      JOIN jugadores_equipo je ON j.id = je.jugador_id
      WHERE je.equipo_id = ?
      ORDER BY je.dorsal ASC
    `, [req.params.id]);
    res.json({ ok: true, jugadores });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cargar plantilla' });
  }
});

// POST /api/equipos (Nuevo equipo e inscripción al torneo)
router.post('/', authMiddleware, async (req, res) => {
  const { nombre, colorPrincipal, torneoId } = req.body;
  try {
    const [existe] = await db.query('SELECT id FROM equipos WHERE nombre = ?', [nombre]);
    if (existe.length > 0) {
      return res.status(400).json({ ok: false, mensaje: 'El nombre no puede repetirse dentro de la misma liga.' });
    }

    // 1. Creamos el equipo
    const [nuevoEquipo] = await db.query(
      'INSERT INTO equipos (nombre, color_principal, liga_id) VALUES (?, ?, ?)',
      [nombre, colorPrincipal, 1]
    );

    // 2. Inscribimos el equipo en el torneo (si viene el ID)
    if (torneoId) {
      await db.query(
        'INSERT INTO torneo_equipos (torneo_id, equipo_id) VALUES (?, ?)',
        [torneoId, nuevoEquipo.insertId]
      );
    }

    res.json({ ok: true, mensaje: 'Equipo creado e inscrito correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al crear equipo' });
  }
});

// POST /api/equipos/:id/jugadores (Agregar jugador)
router.post('/:id/jugadores', authMiddleware, async (req, res) => {
  const equipoId = req.params.id;
  const { nombre, apellidos, fechaNacimiento, dorsal } = req.body;

  try {
    const [dorsalOcupado] = await db.query(
      'SELECT id FROM jugadores_equipo WHERE equipo_id = ? AND dorsal = ?',
      [equipoId, dorsal]
    );
    
    if (dorsalOcupado.length > 0) {
      return res.status(400).json({ ok: false, mensaje: `El dorsal ${dorsal} ya está ocupado en este equipo` });
    }

    const [resultJugador] = await db.query(
      'INSERT INTO jugadores (nombre, apellidos, fecha_nacimiento) VALUES (?, ?, ?)',
      [nombre, apellidos, fechaNacimiento || null]
    );

    // Asumimos torneo_id = 1 para la inscripción del jugador
    await db.query(
      'INSERT INTO jugadores_equipo (torneo_id, jugador_id, equipo_id, dorsal) VALUES (?, ?, ?, ?)',
      [1, resultJugador.insertId, equipoId, dorsal]
    );

    res.json({ ok: true, mensaje: 'Jugador agregado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al agregar jugador' });
  }
});

module.exports = router;