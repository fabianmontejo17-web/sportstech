import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { useTorneo } from '../context/TorneoContext';
import Encabezado from '../components/Encabezado';
import MenuInferior from '../components/MenuInferior';
import Aviso from '../components/Aviso';

export default function AdminDashboard() {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const { torneoActivo } = useTorneo();

  useEffect(() => {
    const cargarPartidos = async () => {
      try {
        const res = await api.getProximosPartidos();
        const data = res.data?.partidos || res.partidos || res.data || res;
        setPartidos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los partidos');
      } finally {
        setCargando(false);
      }
    };
    cargarPartidos();
  }, []);

  // Obtenemos la jornada del primer partido próximo (si hay)
  const jornadaActual = partidos.length > 0 ? partidos[0].jornada : null;

  return (
    <div className="pb-[80px]">
      <Encabezado titulo="Liga Municipal Demo" />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-1">Hola, Admin</h2>
        
        {/* TEXTO DINÁMICO: Muestra el torneo y la jornada real */}
        <p className="text-textoSec mb-6">
          {torneoActivo?.nombre || 'Sin torneo activo'} 
          {jornadaActual ? ` · Jornada ${jornadaActual}` : ''}
        </p>
        
        <h3 className="font-bold text-lg mb-3">Próximos partidos</h3>
        <Aviso tipo="error" mensaje={error} />
        
        {cargando ? (
          <p className="font-bold text-center mt-10">Cargando partidos...</p>
        ) : partidos.length === 0 ? (
          <div className="border-[3px] border-texto rounded-lg p-4 mb-6 text-center">
            <p className="font-bold text-textoSec">No hay partidos programados.</p>
            <Link to="/admin/calendario/nuevo" className="text-primario font-bold underline text-sm mt-2 block">
              Programar un partido
            </Link>
          </div>
        ) : (
          <div className="border-[3px] border-texto rounded-lg p-4 mb-6">
            {partidos.map((partido, index) => (
              <div key={partido.id} className={index !== partidos.length - 1 ? "mb-4 pb-4 border-b-[2px] border-gray-300" : ""}>
                
                {/* MOSTRAMOS LA FECHA REAL DE CADA PARTIDO */}
                <p className="text-sm font-bold mb-2 capitalize">
                  {partido.fechaFormateada || 'Fecha por definir'}
                </p>
                
                <p className="font-bold">{partido.hora} · {partido.cancha}</p>
                <p className="text-sm mb-2">{partido.local} vs {partido.visitante}</p>
                
                <Link to={`/admin/cedula/${partido.id}`} className="block w-full">
                  <button className="bg-resalte text-texto font-bold px-3 py-2 rounded border-[3px] border-texto min-h-[52px] w-full">
                    Capturar cédula
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-8">
          <Link to="/admin/equipos" className="flex flex-col items-center justify-center p-4 border-[3px] border-texto rounded-lg font-bold text-center min-h-[80px]">Equipos</Link>
          <Link to="/admin/jugadores/nuevo" className="flex flex-col items-center justify-center p-4 border-[3px] border-texto rounded-lg font-bold text-center min-h-[80px]">Jugadores</Link>
          <Link to="/admin/calendario" className="flex flex-col items-center justify-center p-4 border-[3px] border-texto rounded-lg font-bold text-center min-h-[80px]">Calendario</Link>
          <Link to="/admin/torneos" className="flex flex-col items-center justify-center p-4 border-[3px] border-texto rounded-lg font-bold text-center min-h-[80px] bg-resalte">Torneos</Link>
        </div>
      </div>
      <MenuInferior />
    </div>
  );
}