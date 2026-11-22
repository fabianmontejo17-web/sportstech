const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middlewares/auth');

// GET /api/torneos (Listar todos los torneos)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, activo FROM torneos');
    res.json({ ok: true, torneos: rows });
  } catch (error) {
    console.error("Error al listar torneos:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al cargar torneos' });
  }
});

// POST /api/torneos (Crear un nuevo torneo)
router.post('/', authMiddleware, async (req, res) => {
  const { nombre } = req.body;
  try {
    // Insertamos el torneo (asumiendo liga_id = 1 por ahora)
    const [result] = await db.query(
      'INSERT INTO torneos (liga_id, nombre, activo) VALUES (?, ?, ?)',
      [1, nombre, 1]
    );
    
    res.json({ 
      ok: true, 
      mensaje: 'Torneo creado', 
      torneo: { id: result.insertId, nombre, activo: 1 } 
    });
  } catch (error) {
    console.error("Error al crear torneo:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al crear el torneo' });
  }
});

// GET /api/torneos/:id/posiciones (Calcula la tabla de posiciones de UN torneo)
router.get('/:id/posiciones', authMiddleware, async (req, res) => {
  const torneoId = req.params.id;
  
  try {
    // Buscamos solo los equipos que están en este torneo
    const [equipos] = await db.query(`
      SELECT e.id, e.nombre 
      FROM equipos e
      JOIN torneo_equipos te ON e.id = te.equipo_id
      WHERE te.torneo_id = ?
    `, [torneoId]);

    // Buscamos los partidos finalizados de este torneo
    const [partidos] = await db.query(`
      SELECT local_equipo_id, visitante_equipo_id, goles_local, goles_visitante 
      FROM partidos 
      WHERE estado = 'finalizado' AND torneo_id = ?
    `, [torneoId]);
    
    // Calculamos los puntos para cada equipo
    const tabla = equipos.map(eq => {
      let pj = 0, g = 0, e = 0, p = 0, gf = 0, gc = 0;
      
      partidos.forEach(part => {
        if (part.local_equipo_id === eq.id) {
          pj++;
          gf += part.goles_local || 0;
          gc += part.goles_visitante || 0;
          if (part.goles_local > part.goles_visitante) g++;
          else if (part.goles_local === part.goles_visitante) e++;
          else p++;
        } else if (part.visitante_equipo_id === eq.id) {
          pj++;
          gf += part.goles_visitante || 0;
          gc += part.goles_local || 0;
          if (part.goles_visitante > part.goles_local) g++;
          else if (part.goles_visitante === part.goles_local) e++;
          else p++;
        }
      });

      const pts = (g * 3) + (e * 1);
      const dg = gf - gc;
      return { equipo: eq.nombre, pj, g, e, p, dg, pts };
    });

    // Ordenamos por puntos y luego por diferencia de goles
    tabla.sort((a, b) => b.pts - a.pts || b.dg - a.dg);

    const posiciones = tabla.map((pos, index) => ({
      pos: index + 1,
      equipo: pos.equipo,
      pj: pos.pj,
      g: pos.g,
      e: pos.e,
      p: pos.p,
      dg: pos.dg > 0 ? `+${pos.dg}` : pos.dg,
      pts: pos.pts
    }));

    res.json({ ok: true, posiciones });
  } catch (error) {
    console.error("Error al calcular posiciones:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al calcular posiciones' });
  }
});

// GET /api/torneos/:id/goleo (Calcula el goleo de UN torneo)
router.get('/:id/goleo', authMiddleware, async (req, res) => {
  const torneoId = req.params.id;
  
  try {
    const [rows] = await db.query(`
      SELECT j.nombre AS jugador, e.nombre AS equipo, COUNT(ev.id) AS goles
      FROM eventos_partido ev
      JOIN partidos p ON ev.partido_id = p.id
      JOIN jugadores j ON ev.jugador_id = j.id
      JOIN jugadores_equipo je ON j.id = je.jugador_id AND je.torneo_id = p.torneo_id
      JOIN equipos e ON je.equipo_id = e.id
      WHERE ev.tipo = 'gol' AND p.torneo_id = ?
      GROUP BY j.id, j.nombre, e.nombre
      ORDER BY goles DESC
    `, [torneoId]);

    const goleo = rows.map((g, index) => ({
      pos: index + 1,
      jugador: g.jugador,
      equipo: g.equipo,
      goles: g.goles
    }));

    res.json({ ok: true, goleo });
  } catch (error) {
    console.error("Error al calcular goleo:", error);
    res.status(500).json({ ok: false, mensaje: 'Error al calcular goleo' });
  }
});

module.exports = router;