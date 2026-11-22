import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api/axiosClient';

const TorneoContext = createContext();

export const TorneoProvider = ({ children }) => {
  const [torneoActivo, setTorneoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar, cargamos los torneos y seleccionamos el primero (o el que esté activo)
  useEffect(() => {
    const cargarTorneoInicial = async () => {
      try {
        const res = await api.getTorneos();
        const data = res.torneos || res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          // Seleccionamos el primer torneo por defecto
          setTorneoActivo(data[0]);
        }
      } catch (error) {
        console.error("Error al cargar torneo inicial", error);
      } finally {
        setCargando(false);
      }
    };
    cargarTorneoInicial();
  }, []);

  return (
    <TorneoContext.Provider value={{ torneoActivo, setTorneoActivo, cargando }}>
      {children}
    </TorneoContext.Provider>
  );
};

export const useTorneo = () => useContext(TorneoContext);