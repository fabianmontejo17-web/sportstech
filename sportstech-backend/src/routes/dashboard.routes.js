const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// GET /api/dashboard/proximos-partidos
router.get('/proximos-partidos', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.fecha_hora, p.estado, p.jornada, c.nombre AS cancha,
             el.nombre AS local, ev.nombre AS visitante
      FROM partidos p
      JOIN canchas c ON p.cancha_id = c.id
      JOIN equipos el ON p.local_equipo_id = el.id
      JOIN equipos ev ON p.visitante_equipo_id = ev.id
      WHERE p.estado != 'finalizado'
      ORDER BY p.fecha_hora ASC
      LIMIT 5
    `);

    const partidosFormateados = rows.map(p => {
      const fecha = new Date(p.fecha_hora);
      // Formateamos la fecha como "Sáb 14 nov"
      const opcionesFecha = { weekday: 'short', day: 'numeric', month: 'short' };
      const fechaFormateada = fecha.toLocaleDateString('es-MX', opcionesFecha);
      
      const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      
      return {
        id: p.id,
        jornada: p.jornada,
        fechaFormateada, // <-- Enviamos la fecha real formateada
        hora,
        cancha: p.cancha,
        local: p.local,
        visitante: p.visitante,
        estado: p.estado
      };
    });

    res.json({ ok: true, partidos: partidosFormateados });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar partidos' });
  }
});

module.exports = router;