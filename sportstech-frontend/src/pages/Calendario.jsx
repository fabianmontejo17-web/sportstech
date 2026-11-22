import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { useTorneo } from '../context/TorneoContext';
import Encabezado from '../components/Encabezado';
import MenuInferior from '../components/MenuInferior';
import Boton from '../components/Boton';
import Aviso from '../components/Aviso';

export default function Calendario() {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [jornada, setJornada] = useState(1); 
  
  const { torneoActivo } = useTorneo();

  useEffect(() => {
    const cargarPartidos = async () => {
      if (!torneoActivo) return;
      
      setCargando(true);
      setError('');
      try {
        const res = await api.getPartidos(jornada, torneoActivo.id);
        const data = res.partidos || res.data || res;
        setPartidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el calendario');
      } finally {
        setCargando(false);
      }
    };
    cargarPartidos();
  }, [jornada, torneoActivo]); // Se recarga al cambiar de jornada o torneo

  return (
    <div className="pb-[80px]">
      <Encabezado titulo={`Calendario · ${torneoActivo?.nombre || 'Sin torneo'}`} />
      
      {/* Selector de Jornada con botones */}
      <div className="flex items-center justify-between p-4 border-b-[3px] border-texto bg-gray-50">
        <button 
          onClick={() => setJornada(prev => Math.max(1, prev - 1))} 
          className={`p-2 min-w-[52px] min-h-[52px] flex justify-center items-center ${jornada === 1 ? 'opacity-30' : ''}`}
          disabled={jornada === 1}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        <h2 className="text-lg font-bold">Jornada {String(jornada)}</h2>
        
        <button 
          onClick={() => setJornada(prev => prev + 1)} 
          className="p-2 min-w-[52px] min-h-[52px] flex justify-center items-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="p-4">
        <Aviso tipo="error" mensaje={error} />
        
        {!torneoActivo ? (
           <p className="font-bold text-center mt-10">Selecciona un torneo en la pestaña de Torneos.</p>
        ) : cargando ? (
          <p className="font-bold text-center mt-10">Cargando calendario...</p>
        ) : partidos.length === 0 ? (
          <div className="text-center mt-10">
            <p className="font-bold text-textoSec">No hay partidos en esta jornada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {partidos.map(partido => (
              <div key={partido.id} className="border-[3px] border-texto rounded-lg p-4">
                <p className="font-bold text-lg mb-1">{partido.hora} · {partido.cancha}</p>
                
                {partido.estado === 'finalizado' || partido.estado === 'Finalizado' ? (
                  <div className="mt-4 bg-gray-100 p-3 rounded border-[2px] border-gray-300">
                    <p className="text-sm font-bold text-textoSec mb-2">Finalizado</p>
                    <div className="flex justify-between font-bold text-lg">
                      <span className="flex-1 truncate">{partido.local}</span>
                      <span className="px-2">{partido.golesLocal} - {partido.golesVisitante}</span>
                      <span className="flex-1 truncate text-right">{partido.visitante}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg mb-2">{partido.local} vs {partido.visitante}</p>
                    <div className="flex flex-col space-y-2 mt-4">
                       <Link to={`/admin/cedula/${partido.id}`} className="w-full">
                          <Boton variante="resalte">Capturar cédula</Boton>
                       </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link to="/admin/calendario/nuevo">
            <Boton>+ Programar partido</Boton>
          </Link>
        </div>
      </div>
      <MenuInferior />
    </div>
  );
}