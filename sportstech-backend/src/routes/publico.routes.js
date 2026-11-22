const express = require('express');
const router = express.Router();
const db = require('../config/db');

const obtenerTorneoId = async (slug, queryTorneo) => {
  if (queryTorneo) return parseInt(queryTorneo);
  const [ligas] = await db.query('SELECT id FROM ligas WHERE slug = ?', [slug]);
  if (ligas.length === 0) return null;
  const [torneos] = await db.query('SELECT id FROM torneos WHERE liga_id = ? AND activo = 1 LIMIT 1', [ligas[0].id]);
  return torneos.length > 0 ? torneos[0].id : null;
};

router.get('/:slug/posiciones', async (req, res) => {
  const { slug } = req.params;
  const { torneo } = req.query;
  try {
    const torneoId = await obtenerTorneoId(slug, torneo);
    if (!torneoId) return res.status(404).json({ ok: false, mensaje: 'Torneo no encontrado' });

    const [equipos] = await db.query(`
      SELECT e.id, e.nombre FROM equipos e
      JOIN torneo_equipos te ON e.id = te.equipo_id WHERE te.torneo_id = ?
    `, [torneoId]);

    const [partidos] = await db.query(`
      SELECT local_equipo_id, visitante_equipo_id, goles_local, goles_visitante 
      FROM partidos WHERE estado = 'finalizado' AND torneo_id = ?
    `, [torneoId]);
    
    const tabla = equipos.map(eq => {
      let pj = 0, g = 0, e = 0, p = 0, gf = 0, gc = 0;
      partidos.forEach(part => {
        if (part.local_equipo_id === eq.id) {
          pj++; gf += part.goles_local || 0; gc += part.goles_visitante || 0;
          if (part.goles_local > part.goles_visitante) g++;
          else if (part.goles_local === part.goles_visitante) e++;
          else p++;
        } else if (part.visitante_equipo_id === eq.id) {
          pj++; gf += part.goles_visitante || 0; gc += part.goles_local || 0;
          if (part.goles_visitante > part.goles_local) g++;
          else if (part.goles_visitante === part.goles_local) e++;
          else p++;
        }
      });
      const pts = (g * 3) + e;
      const dg = gf - gc;
      return { equipo: eq.nombre, pj, g, e, p, dg, pts };
    });

    tabla.sort((a, b) => b.pts - a.pts || b.dg - a.dg);
    const posiciones = tabla.map((pos, index) => ({ ...pos, pos: index + 1, dg: pos.dg > 0 ? `+${pos.dg}` : pos.dg }));

    res.json({ ok: true, posiciones });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al calcular posiciones' });
  }
});

router.get('/:slug/goleo', async (req, res) => {
  const { slug } = req.params;
  const { torneo } = req.query;
  try {
    const torneoId = await obtenerTorneoId(slug, torneo);
    if (!torneoId) return res.status(404).json({ ok: false, mensaje: 'Torneo no encontrado' });

    const [rows] = await db.query(`
      SELECT j.nombre AS jugador, e.nombre AS equipo, COUNT(ev.id) AS goles
      FROM eventos_partido ev
      JOIN partidos p ON ev.partido_id = p.id
      JOIN jugadores j ON ev.jugador_id = j.id
      JOIN jugadores_equipo je ON j.id = je.jugador_id AND je.torneo_id = p.torneo_id
      JOIN equipos e ON je.equipo_id = e.id
      WHERE ev.tipo = 'gol' AND p.torneo_id = ?
      GROUP BY j.id, j.nombre, e.nombre ORDER BY goles DESC
    `, [torneoId]);

    const goleo = rows.map((g, index) => ({ ...g, pos: index + 1 }));
    res.json({ ok: true, goleo });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al calcular goleo' });
  }
});

router.get('/:slug/calendario', async (req, res) => {
  const { slug } = req.params;
  const { torneo } = req.query;
  try {
    const torneoId = await obtenerTorneoId(slug, torneo);
    if (!torneoId) return res.status(404).json({ ok: false, mensaje: 'Torneo no encontrado' });

    const [rows] = await db.query(`
      SELECT p.id, p.jornada, p.fecha_hora, p.estado, p.goles_local, p.goles_visitante,
             c.nombre AS cancha, el.nombre AS local, ev.nombre AS visitante
      FROM partidos p
      JOIN canchas c ON p.cancha_id = c.id
      JOIN equipos el ON p.local_equipo_id = el.id
      JOIN equipos ev ON p.visitante_equipo_id = ev.id
      WHERE p.torneo_id = ? ORDER BY p.fecha_hora ASC
    `, [torneoId]);

    const partidosFormateados = rows.map(p => {
      const fecha = new Date(p.fecha_hora);
      const opcionesFecha = { weekday: 'short', day: 'numeric', month: 'short' };
      const fechaFormateada = fecha.toLocaleDateString('es-MX', opcionesFecha);
      const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      return { ...p, hora, fechaFormateada };
    });

    res.json({ ok: true, partidos: partidosFormateados });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al cargar calendario' });
  }
});

module.exports = router;