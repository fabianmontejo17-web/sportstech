import axios from 'axios';
import { mockData } from './mocks';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sportstech_token');
    if (token && !config.url.includes('/publico/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sportstech_token');
      // Solo redirigimos si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const USAR_MOCKS = import.meta.env.VITE_USAR_MOCKS === 'true';

export const api = {
  login: async (email, password) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res(mockData.login), 500));
    const response = await axiosClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  getProximosPartidos: async () => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: mockData.proximosPartidos }), 500));
    const response = await axiosClient.get('/dashboard/proximos-partidos');
    return response.data;
  },

  getTorneos: async () => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: [{ id: 1, nombre: 'Torneo Apertura 2026' }] }), 500));
    const response = await axiosClient.get('/torneos');
    return response.data;
  },

  crearTorneo: async (datos) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: { ok: true } }), 500));
    const response = await axiosClient.post('/torneos', datos);
    return response.data;
  },

  getPosiciones: async (torneoId = 1) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: mockData.posiciones }), 500));
    const response = await axiosClient.get(`/torneos/${torneoId}/posiciones`);
    return response.data;
  },

  getGoleo: async (torneoId = 1) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: mockData.goleo }), 500));
    const response = await axiosClient.get(`/torneos/${torneoId}/goleo`);
    return response.data;
  },

  getPartidos: async (jornada, torneoId = 1) => {
    if (USAR_MOCKS) {
      const partidosMock = [
        { id: 1, jornada: 2, cancha: 'Cancha Central', local: 'Tigres', visitante: 'Ribereño', estado: 'Programado', hora: '10:00' }
      ];
      return new Promise(res => setTimeout(() => res({ data: partidosMock }), 500));
    }
    const response = await axiosClient.get(`/partidos?jornada=${jornada || ''}&torneo_id=${torneoId}`);
    return response.data;
  },

  crearPartido: async (datos) => {
    if (USAR_MOCKS) {
      if (Number(datos.localEquipoId) === 1) {
        return Promise.reject({ response: { status: 409, data: { mensaje: 'EMPALME: El equipo ya tiene un partido programado.' } } });
      }
      return new Promise(res => setTimeout(() => res({ data: { ok: true } }), 500));
    }
    const response = await axiosClient.post('/partidos', datos);
    return response.data;
  },

  getPartidoDetalle: async (id) => {
    if (USAR_MOCKS) {
      const partidoMock = { id: 1, jornada: 2, cancha: 'Cancha Central', local: 'Tigres', visitante: 'Pinos', golesLocal: 3, golesVisitante: 2, eventos: [] };
      return new Promise(res => setTimeout(() => res({ data: partidoMock }), 500));
    }
    const response = await axiosClient.get(`/partidos/${id}`);
    return response.data; 
  },

  guardarCedula: async (id, datos) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: { ok: true } }), 800));
    const response = await axiosClient.put(`/partidos/${id}/cedula`, datos);
    return response.data;
  },

  getEquiposConPlantilla: async (torneoId = 1) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: [] }), 500));
    const response = await axiosClient.get(`/equipos?torneo_id=${torneoId}`);
    return response.data; 
  },

  getPlantilla: async (equipoId) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: [] }), 500));
    const response = await axiosClient.get(`/equipos/${equipoId}/plantilla`);
    return response.data;
  },

  crearEquipo: async (datos) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: { ok: true } }), 500));
    const response = await axiosClient.post('/equipos', datos);
    return response.data;
  },

  agregarJugador: async (equipoId, datos) => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: { ok: true } }), 500));
    const response = await axiosClient.post(`/equipos/${equipoId}/jugadores`, datos);
    return response.data;
  },

  getCanchas: async () => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: [{ id: 1, nombre: 'Cancha Central' }] }), 500));
    const response = await axiosClient.get('/canchas');
    return response.data;
  },

  getArbitros: async () => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: [{ id: 1, nombre: 'Árbitro Demo' }] }), 500));
    const response = await axiosClient.get('/arbitros');
    return response.data;
  },

  getPosicionesPublicas: async (slug, torneoId = '') => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: mockData.posiciones }), 500));
    const url = `/publico/${slug}/posiciones${torneoId ? `?torneo=${torneoId}` : ''}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  getGoleoPublico: async (slug, torneoId = '') => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: mockData.goleo }), 500));
    const url = `/publico/${slug}/goleo${torneoId ? `?torneo=${torneoId}` : ''}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  getCalendarioPublico: async (slug, torneoId = '') => {
    if (USAR_MOCKS) return new Promise(res => setTimeout(() => res({ data: [] }), 500));
    const url = `/publico/${slug}/calendario${torneoId ? `?torneo=${torneoId}` : ''}`;
    const response = await axiosClient.get(url);
    return response.data;
  }
};