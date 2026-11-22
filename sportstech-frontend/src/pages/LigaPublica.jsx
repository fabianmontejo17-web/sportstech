import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import Aviso from '../components/Aviso';

export default function LigaPublica() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [datos, setDatos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const esGoleo = location.pathname.includes('/goleo');
  const esCalendario = location.pathname.includes('/calendario');

  useEffect(() => {
    const cargarTorneos = async () => {
      try {
        const res = await api.getTorneos();
        const data = res.torneos || res.data || res;
        setTorneos(Array.isArray(data) ? data : []);
        if (data.length > 0) setTorneoSeleccionado(data[0].id.toString());
      } catch (err) { console.error(err); }
    };
    cargarTorneos();
  }, []);

  useEffect(() => {
    if (!torneoSeleccionado) return;

    const cargarDatos = async () => {
      setCargando(true);
      setError('');
      try {
        if (esCalendario) {
          const res = await api.getCalendarioPublico(slug, torneoSeleccionado);
          const data = res.partidos || res.data || res;
          setDatos(Array.isArray(data) ? data : []);
        } else if (esGoleo) {
          const res = await api.getGoleoPublico(slug, torneoSeleccionado);
          const data = res.goleo || res.data || res;
          setDatos(Array.isArray(data) ? data : []);
        } else {
          const res = await api.getPosicionesPublicas(slug, torneoSeleccionado);
          const data = res.posiciones || res.data || res;
          setDatos(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar la información');
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [slug, esGoleo, esCalendario, torneoSeleccionado]);

  const nombreTorneo = torneos.find(t => t.id.toString() === torneoSeleccionado)?.nombre || 'Cargando...';

  return (
    <div className="pb-10">
      <header className="bg-texto text-white p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-300">Liga Municipal Demo</p>
          <button onClick={() => navigate('/login')} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded border border-gray-500">
            ← Volver al Login
          </button>
        </div>
        <h1 className="text-xl font-bold">{nombreTorneo}</h1>
      </header>

      {torneos.length > 1 && (
        <div className="bg-gray-100 p-2 border-b-[2px] border-gray-300">
          <select 
            value={torneoSeleccionado}
            onChange={(e) => setTorneoSeleccionado(e.target.value)}
            className="w-full h-[44px] px-2 border-[2px] border-texto rounded bg-white font-bold text-sm"
          >
            {torneos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>
      )}

      <div className="flex border-b-[3px] border-texto bg-gray-50 text-sm font-bold text-center">
        <Link to={`/liga/${slug}`} className={`flex-1 py-3 border-r-[2px] border-gray-300 ${!esGoleo && !esCalendario ? 'bg-resalte text-texto' : 'text-textoSec'}`}>Posiciones</Link>
        <Link to={`/liga/${slug}/goleo`} className={`flex-1 py-3 border-r-[2px] border-gray-300 ${esGoleo ? 'bg-resalte text-texto' : 'text-textoSec'}`}>Goleo</Link>
        <Link to={`/liga/${slug}/calendario`} className={`flex-1 py-3 ${esCalendario ? 'bg-resalte text-texto' : 'text-textoSec'}`}>Calendario</Link>
      </div>

      <div className="p-4">
        <Aviso tipo="error" mensaje={error} />
        
        {cargando ? (
          <p className="font-bold text-center mt-10">Cargando...</p>
        ) : esCalendario ? (
          <div className="space-y-4">
            {datos.length === 0 ? <p className="text-center text-textoSec">No hay partidos programados.</p> : datos.map(p => (
              <div key={p.id} className="border-[2px] border-gray-300 rounded p-3">
                {/* AQUÍ SE MUESTRA LA FECHA Y LA JORNADA */}
                <p className="text-xs font-bold text-textoSec mb-2 capitalize">{p.fechaFormateada} · Jornada {p.jornada}</p>
                
                {p.estado === 'finalizado' ? (
                  <div className="flex justify-between items-center font-bold">
                    <span className="flex-1 truncate">{p.local}</span>
                    <span className="px-2 text-lg">{p.goles_local} - {p.goles_visitante}</span>
                    <span className="flex-1 truncate text-right">{p.visitante}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="flex-1 truncate text-sm">{p.local}</span>
                    <span className="px-2 font-bold text-xs text-gray-500">vs</span>
                    <span className="flex-1 truncate text-right text-sm">{p.visitante}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">{p.hora} · {p.cancha}</p>
              </div>
            ))}
          </div>
        ) : esGoleo ? (
          <div>
             <div className="flex text-[10px] font-bold text-center items-center uppercase border-b-[2px] border-texto pb-2 mb-2">
              <div className="w-6 text-left">#</div>
              <div className="flex-1 text-left pl-1">Jugador</div>
              <div className="w-12 text-right pr-2">Goles</div>
            </div>
            <div className="space-y-3">
              {datos.length === 0 ? <p className="text-center text-textoSec mt-4">No hay datos de goleo.</p> : datos.map(gol => (
                <div key={gol.pos} className="flex text-sm items-center border-b-[1px] border-gray-200 pb-2">
                  <div className="w-6 text-center font-bold">{gol.pos}</div>
                  <div className="flex-1 pl-1 text-xs truncate">
                    {gol.jugador}
                    <span className="block text-[10px] text-textoSec">{gol.equipo}</span>
                  </div>
                  <div className="w-12 text-right pr-2 font-bold">{gol.goles}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
              {datos.length === 0 ? <p className="text-center text-textoSec mt-4">No hay datos de posiciones.</p> : datos.map(pos => (
                <div key={pos.pos} className="flex text-sm items-center border-b-[1px] border-gray-200 pb-2">
                  <div className="w-6 text-center font-bold">{pos.pos}</div>
                  <div className="flex-1 truncate text-xs pl-1">{pos.equipo}</div>
                  <div className="w-[22px] text-center">{pos.pj}</div>
                  <div className="w-[22px] text-center">{pos.g}</div>
                  <div className="w-[22px] text-center">{pos.e}</div>
                  <div className="w-[22px] text-center">{pos.p}</div>
                  <div className="w-[26px] text-center font-bold">{pos.dg}</div>
                  <div className="w-[28px] text-center font-bold">{pos.pts}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-8 pb-4">
        Se actualiza al cerrar cada partido · SportsTech
      </div>
    </div>
  );
}