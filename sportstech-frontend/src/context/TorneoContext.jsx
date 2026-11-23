import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api/axiosClient';

const TorneoContext = createContext();

export const TorneoProvider = ({ children }) => {
  const [torneoActivo, setTorneoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let isMounted = true; // Bandera para evitar actualizaciones de estado si el componente se desmonta

    const cargarTorneoInicial = async () => {
      try {
        const res = await api.getTorneos();
        const data = res.torneos || res.data || res;
        
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setTorneoActivo(data[0]);
          }
        }
      } catch (error) {
        console.error("Error al cargar torneo inicial:", error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarTorneoInicial();

    return () => {
      isMounted = false; // Limpiamos la bandera al desmontar
    };
  }, []);

  return (
    <TorneoContext.Provider value={{ torneoActivo, setTorneoActivo, cargando }}>
      {children}
    </TorneoContext.Provider>
  );
};

export const useTorneo = () => useContext(TorneoContext);