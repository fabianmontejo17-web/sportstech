export const mockData = {
  login: {
    ok: true,
    token: 'fake-jwt-token-123',
    usuario: { id: 1, nombre: 'Admin', rol: 'admin' }
  },
  proximosPartidos: [
    { id: 1, hora: '10:00', cancha: 'Cancha Central', local: 'Tigres del Barrio', visitante: 'Atlético Ribereño', estado: 'Programado' },
    { id: 2, hora: '10:00', cancha: 'Cancha El Parque', local: 'Deportivo Los Pinos', visitante: 'Club Los Cacaoteros', estado: 'Falta árbitro' }
  ],
  posiciones: [
    { pos: 1, equipo: 'Tigres del Barrio', pj: 1, g: 1, e: 0, p: 0, dg: '+2', pts: 3 },
    { pos: 2, equipo: 'Atlético Ribereño', pj: 1, g: 0, e: 1, p: 0, dg: '0', pts: 1 },
    { pos: 3, equipo: 'Club Los Cacaoteros', pj: 1, g: 0, e: 1, p: 0, dg: '0', pts: 1 },
    { pos: 4, equipo: 'Dep. Los Pinos', pj: 1, g: 0, e: 0, p: 1, dg: '-2', pts: 0 },
  ],
  goleo: [
    { pos: 1, jugador: 'Carlos Hernández', equipo: 'Tigres del Barrio', goles: 2 },
    { pos: 2, jugador: 'Jorge López', equipo: 'Deportivo Los Pinos', goles: 1 },
    { pos: 3, jugador: 'Luis Ramírez', equipo: 'Tigres del Barrio', goles: 1 },
  ]
};