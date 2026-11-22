const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// GET /api/partidos (Lista por jornada y torneo)
router.get('/partidos', authMiddleware, async (req, res) => {
  const { jornada, torneo_id } = req.query;
  try {
    let query = `
      SELECT p.id, p.jornada, p.fecha_hora, p.estado, p.goles_local, p.goles_visitante,
             c.nombre AS cancha, el.nombre AS local, ev.nombre AS visitante
      FROM partidos p
      JOIN canchas c ON p.cancha_id = c.id
      JOIN equipos el ON p.local_equipo_id = el.id
      JOIN equipos ev ON p.visitante_equipo_id = ev.id
      WHERE 1=1
    `;
    let params = [];
    
    // Filtro por Torneo
    if (torneo_id) {
      query += ' AND p.torneo_id = ?';
      params.push(torneo_id);
    }
    
    // Filtro por Jornada (Si el frontend envía ?jornada=6)
    if (jornada) {
      query += ' AND p.jornada = ?';
      params.push(jornada);
    }
    query += ' ORDER BY p.fecha_hora ASC';

    const [rows] = await db.query(query, params);

    const partidosFormateados = rows.map(p => {
      const fecha = new Date(p.fecha_hora);
      const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      return {
        id: p.id,
        jornada: p.jornada,
        hora,
        cancha: p.cancha,
        local: p.local,
        visitante: p.visitante,
        estado: p.estado,
        golesLocal: p.goles_local,
        golesVisitante: p.goles_visitante
      };
    });

    res.json({ ok: true, partidos: partidosFormateados });
  } catch (error) {
    console.error("Error en calendario:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar calendario' });
  }
});

// POST /api/partidos (Programar un partido en cualquier jornada)
router.post('/partidos', authMiddleware, async (req, res) => {
  const { localEquipoId, visitanteEquipoId, canchaId, arbitroId, fechaHora, jornada, torneoId } = req.body;
  
  try {
    const [empalme] = await db.query(`
      SELECT id FROM partidos 
      WHERE (local_equipo_id = ? OR visitante_equipo_id = ?) 
      AND fecha_hora = ?
    `, [localEquipoId, localEquipoId, fechaHora]);

    if (empalme.length > 0) {
      return res.status(409).json({ ok: false, mensaje: 'EMPALME: El equipo ya tiene un partido programado a esa misma hora.' });
    }

    // Insertamos con la jornada que venga del frontend (sin límite)
    await db.query(`
      INSERT INTO partidos (torneo_id, jornada, local_equipo_id, visitante_equipo_id, cancha_id, arbitro_id, fecha_hora, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'programado')
    `, [torneoId || 1, jornada || 1, localEquipoId, visitanteEquipoId, canchaId, arbitroId || null, fechaHora]);

    res.json({ ok: true, mensaje: 'Partido programado' });
  } catch (error) {
    console.error("Error al programar:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al programar partido' });
  }
});

// GET /api/canchas
router.get('/canchas', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM canchas');
    res.json({ ok: true, canchas: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cargar canchas' });
  }
});

// GET /api/arbitros
router.get('/arbitros', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM usuarios WHERE rol_id = 2');
    res.json({ ok: true, arbitros: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cargar arbitros' });
  }
});

module.exports = router;