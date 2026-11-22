import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import Encabezado from '../components/Encabezado';
import MenuInferior from '../components/MenuInferior';
import Boton from '../components/Boton';
import Aviso from '../components/Aviso';

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [plantilla, setPlantilla] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarEquipos = async () => {
      try {
        const res = await api.getEquiposConPlantilla();
        
        // CORRECCIÓN: El backend envía { ok: true, equipos: [...] }
        const data = res.equipos || res.data || res;
        
        // Aseguramos que siempre sea un arreglo
        setEquipos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar equipos');
      } finally {
        setCargando(false);
      }
    };
    cargarEquipos();
  }, []);

  const verPlantilla = async (equipo) => {
    setEquipoSeleccionado(equipo);
    setPlantilla([]); // Limpiamos la anterior
    try {
      const res = await api.getPlantilla(equipo.id);
      // El backend envía { ok: true, jugadores: [...] }
      const data = res.jugadores || res.data || res;
      setPlantilla(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la plantilla');
    }
  };

  return (
    <div className="pb-[80px]">
      <Encabezado titulo="Equipos y plantilla" />
      
      <div className="p-4">
        <Aviso tipo="error" mensaje={error} />

        {cargando ? (
          <p className="font-bold text-center mt-10">Cargando equipos...</p>
        ) : equipos.length === 0 ? (
          <p className="font-bold text-center mt-10 text-textoSec">No hay equipos registrados.</p>
        ) : (
          <div className="space-y-3 mb-8">
            {equipos.map(eq => (
              <div key={eq.id} className="border-[3px] border-texto rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{eq.nombre}</p>
                  <p className="text-sm text-textoSec">{eq.jugadores || 0} jugadores</p>
                </div>
                <button 
                  onClick={() => verPlantilla(eq)}
                  className="bg-gray-200 font-bold px-4 py-2 rounded-lg border-[2px] border-texto min-h-[44px]"
                >
                  Ver plantilla
                </button>
              </div>
            ))}
          </div>
        )}

        <Link to="/admin/equipos/nuevo" className="block mb-8">
          <Boton variante="secundario">+ Nuevo equipo</Boton>
        </Link>

        {/* Sección de Plantilla (solo si hay un equipo seleccionado) */}
        {equipoSeleccionado && (
          <div className="mt-8 border-t-[3px] border-texto pt-4">
            <h2 className="text-xl font-bold mb-4">Plantilla · {equipoSeleccionado.nombre}</h2>
            
            <div className="space-y-2 mb-6">
              {plantilla.length === 0 ? (
                <p className="text-textoSec text-sm">No hay jugadores en este equipo.</p>
              ) : (
                plantilla.map(jug => (
                  <div key={jug.id} className="flex items-center gap-3 p-2 border-[2px] border-gray-300 rounded">
                    <span className="font-bold text-lg w-8 text-center bg-gray-100 rounded">{jug.dorsal}</span>
                    <span className="font-medium">{jug.nombre} {jug.apellidos}</span>
                  </div>
                ))
              )}
            </div>

            <Link to={`/admin/jugadores/nuevo?equipoId=${equipoSeleccionado.id}&equipoNombre=${equipoSeleccionado.nombre}`} className="block">
              <Boton variante="resalte">+ Agregar jugador</Boton>
            </Link>
          </div>
        )}
      </div>
      <MenuInferior />
    </div>
  );
}