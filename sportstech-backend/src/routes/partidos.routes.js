const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// GET /api/partidos/:id (Para cargar la cédula)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // 1. Traemos los datos del partido
    const [rows] = await db.query(`
      SELECT p.*, c.nombre AS cancha, 
             el.nombre AS local, ev.nombre AS visitante
      FROM partidos p
      JOIN canchas c ON p.cancha_id = c.id
      JOIN equipos el ON p.local_equipo_id = el.id
      JOIN equipos ev ON p.visitante_equipo_id = ev.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ ok: false, mensaje: 'Partido no encontrado' });

    const partido = rows[0];

    // 2. Traemos los eventos. Como tu tabla no tiene 'equipo_id', 
    // hacemos un JOIN con jugadores_equipo para saber a qué equipo pertenece el jugador.
    const [eventos] = await db.query(`
      SELECT e.id, e.minuto, e.tipo, j.nombre AS jugador, je.equipo_id
      FROM eventos_partido e
      JOIN jugadores j ON e.jugador_id = j.id
      LEFT JOIN jugadores_equipo je ON j.id = je.jugador_id
      WHERE e.partido_id = ?
      ORDER BY e.minuto ASC
    `, [req.params.id]);

    // Formateamos los eventos para saber si son del local o visitante
    const eventosFormateados = eventos.map(ev => ({
      id: ev.id,
      minuto: ev.minuto,
      tipo: ev.tipo,
      jugador: ev.jugador,
      equipo: ev.equipo_id === partido.local_equipo_id ? 'local' : 'visitante'
    }));

    res.json({
      ok: true,
      partido: {
        id: partido.id,
        jornada: partido.jornada,
        cancha: partido.cancha,
        local: partido.local,
        visitante: partido.visitante,
        golesLocal: partido.goles_local || 0,
        golesVisitante: partido.goles_visitante || 0,
        eventos: eventosFormateados
      }
    });
  } catch (error) {
    console.error("Error en GET partido:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar el partido' });
  }
});

// PUT /api/partidos/:id/cedula (Para guardar la cédula)
router.put('/:id/cedula', authMiddleware, async (req, res) => {
  const { golesLocal, golesVisitante, eventos } = req.body;
  const partidoId = req.params.id;

  try {
    // 1. Actualizamos el marcador del partido
    await db.query(`
      UPDATE partidos 
      SET goles_local = ?, goles_visitante = ?, estado = 'finalizado'
      WHERE id = ?
    `, [golesLocal, golesVisitante, partidoId]);

    // 2. Borramos los eventos anteriores
    await db.query('DELETE FROM eventos_partido WHERE partido_id = ?', [partidoId]);

      // 3. Insertamos los nuevos eventos
    if (eventos && eventos.length > 0) {
      for (const ev of eventos) {
        // Buscamos al jugador por nombre
        let jugadorId;
        const [jugadores] = await db.query('SELECT id FROM jugadores WHERE nombre LIKE ? LIMIT 1', [`%${ev.jugador}%`]);
        
        if (jugadores.length > 0) {
          // Si el jugador existe, usamos su ID
          jugadorId = jugadores[0].id;
        } else {
          // Si no existe, lo creamos en la tabla 'jugadores'
          const [nuevoJugador] = await db.query(
            'INSERT INTO jugadores (nombre, apellidos) VALUES (?, ?)',
            [ev.jugador, '']
          );
          jugadorId = nuevoJugador.insertId;
        }

        // Guardamos el evento con el ID del jugador (existente o nuevo)
        await db.query(`
          INSERT INTO eventos_partido (partido_id, jugador_id, tipo, minuto)
          VALUES (?, ?, ?, ?)
        `, [partidoId, jugadorId, ev.tipo, ev.minuto]);
      }
    }

    res.json({ ok: true, mensaje: 'Cédula guardada correctamente' });
  } catch (error) {
    console.error("Error al guardar cédula:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al guardar la cédula' });
  }
});

module.exports = router;