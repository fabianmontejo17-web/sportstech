import { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useTorneo } from '../context/TorneoContext';
import Encabezado from '../components/Encabezado';
import MenuInferior from '../components/MenuInferior';
import Aviso from '../components/Aviso';

export default function Tablas() {
  const [pestana, setPestana] = useState('posiciones');
  const [posiciones, setPosiciones] = useState([]);
  const [goleo, setGoleo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const { torneoActivo } = useTorneo();

  useEffect(() => {
    const cargarDatos = async () => {
      if (!torneoActivo) {
        setCargando(false);
        return;
      }
      setCargando(true);
      setError('');
      try {
        const [resPos, resGol] = await Promise.all([
          api.getPosiciones(torneoActivo.id), 
          api.getGoleo(torneoActivo.id)
        ]);
        
        const dataPos = resPos.posiciones || resPos.data || resPos;
        const dataGol = resGol.goleo || resGol.data || resGol;

        setPosiciones(Array.isArray(dataPos) ? dataPos : []);
        setGoleo(Array.isArray(dataGol) ? dataGol : []);
      } catch (err) {
        setError('Error al cargar las tablas');
        setPosiciones([]);
        setGoleo([]);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [torneoActivo]); // Se recarga si cambia el torneo

  return (
    <div className="pb-[80px]">
      <Encabezado titulo={`Tablas · ${torneoActivo?.nombre || 'Sin torneo'}`} />
      
      <div className="flex border-b-[3px] border-texto">
        <button 
          onClick={() => setPestana('posiciones')}
          className={`flex-1 py-3 font-bold text-center border-r-[3px] border-texto min-h-[52px] ${pestana === 'posiciones' ? 'bg-resalte text-texto' : 'bg-white text-textoSec'}`}
        >
          Posiciones
        </button>
        <button 
          onClick={() => setPestana('goleo')}
          className={`flex-1 py-3 font-bold text-center min-h-[52px] ${pestana === 'goleo' ? 'bg-resalte text-texto' : 'bg-white text-textoSec'}`}
        >
          Goleo
        </button>
      </div>

      <div className="p-2">
        <Aviso tipo="error" mensaje={error} />
        {!torneoActivo ? (
           <p className="font-bold text-center mt-10">Selecciona un torneo en la pestaña de Torneos.</p>
        ) : cargando ? (
          <p className="font-bold text-center mt-10">Cargando datos...</p>
        ) : pestana === 'posiciones' ? (
          <div>
            <div className="flex text-[10px] font-bold text-center items-center uppercase border-b-[2px] border-texto pb-2 mb-2">
              <div className="w-6 text-left">#</div>
              <div className="flex-1 text-left pl-1">Equipo</div>
              <div className="w-[22px]">PJ</div>
              <div className="w-[22px]">G</div>
              <div className="w-[22px]">E</div>
              <div className="w-[22px]">P</div>
              <div className="w-[26px]">DG</div>
              <div className="w-[28px]">PTS</div>
            </div>
            <div className="space-y-2">
              {!posiciones || posiciones.length === 0 ? (
                <p className="p-4 text-center text-textoSec text-sm">No hay datos de posiciones.</p>
              ) : (
                posiciones.map((pos, index) => (
                  <div key={index} className="flex text-sm items-center border-b-[1px] border-gray-300 pb-2 pt-1">
                    <div className="w-6 text-center font-bold">{pos.pos}</div>
                    <div className="flex-1 truncate text-xs pl-1">{pos.equipo}</div>
                    <div className="w-[22px] text-center">{pos.pj}</div>
                    <div className="w-[22px] text-center">{pos.g}</div>
                    <div className="w-[22px] text-center">{pos.e}</div>
                    <div className="w-[22px] text-center">{pos.p}</div>
                    <div className="w-[26px] text-center font-bold">{pos.dg}</div>
                    <div className="w-[28px] text-center font-bold">{pos.pts}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex text-[10px] font-bold text-center items-center uppercase border-b-[2px] border-texto pb-2 mb-2">
              <div className="w-6 text-left">#</div>
              <div className="flex-1 text-left pl-1">Jugador</div>
              <div className="w-12 text-right pr-2">Goles</div>
            </div>
            <div className="space-y-3">
              {!goleo || goleo.length === 0 ? (
                <p className="p-4 text-center text-textoSec text-sm">No hay datos de goleo.</p>
              ) : (
                goleo.map((gol, index) => (
                  <div key={index} className="flex text-sm items-center border-b-[1px] border-gray-300 pb-2 pt-1">
                    <div className="w-6 text-center font-bold">{gol.pos}</div>
                    <div className="flex-1 pl-1 text-xs truncate">
                      {gol.jugador}
                      <span className="block text-[10px] text-textoSec truncate">{gol.equipo}</span>
                    </div>
                    <div className="w-12 text-right pr-2 font-bold text-lg">{gol.goles}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      <MenuInferior />
    </div>
  );
}