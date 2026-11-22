import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/axiosClient';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import CampoTexto from '../components/CampoTexto';
import Aviso from '../components/Aviso';

export default function AgregarJugador() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Obtenemos los datos del equipo desde la URL (si venimos de la pantalla de Equipos)
  const urlEquipoId = searchParams.get('equipoId');
  const urlEquipoNombre = searchParams.get('equipoNombre');

  const [equipos, setEquipos] = useState([]);
  const [formData, setFormData] = useState({
    equipoId: urlEquipoId || '',
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    dorsal: ''
  });
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(!urlEquipoId); // Solo carga si no venimos con equipo

  useEffect(() => {
    // Si no venimos con un equipo seleccionado, cargamos la lista de equipos
    if (!urlEquipoId) {
      const cargarEquipos = async () => {
        try {
          const res = await api.getEquiposConPlantilla();
          const data = res.equipos || res.data || res;
          setEquipos(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error(err);
          setError('Error al cargar la lista de equipos');
        } finally {
          setCargandoDatos(false);
        }
      };
      cargarEquipos();
    }
  }, [urlEquipoId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validación de cliente
    if (isNaN(formData.dorsal) || formData.dorsal === '') {
      setError('El dorsal debe ser un número.');
      return;
    }
    if (!formData.equipoId) {
      setError('Debes seleccionar un equipo.');
      return;
    }

    setCargando(true);
    try {
      await api.agregarJugador(formData.equipoId, {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        fechaNacimiento: formData.fechaNacimiento,
        dorsal: parseInt(formData.dorsal)
      });
      navigate('/admin/equipos');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError('Error al agregar el jugador.');
      }
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) return <div className="p-4 mt-10 text-center font-bold">Cargando equipos...</div>;

  return (
    <div className="pb-10">
      <Encabezado titulo="Agregar jugador" mostrarVolver={true} />
      
      <div className="p-4">
        <Aviso tipo="error" mensaje={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Equipo (Solo si no venimos con un equipo preseleccionado) */}
          <div>
            <label className="block mb-1 font-bold text-sm">Equipo</label>
            {urlEquipoId ? (
              <div className="h-[52px] px-3 border-[3px] border-texto rounded-lg flex items-center bg-gray-100 font-medium">
                {urlEquipoNombre || 'Equipo Seleccionado'}
              </div>
            ) : (
              <select 
                id="equipoId" 
                required 
                value={formData.equipoId} 
                onChange={handleChange} 
                className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg bg-white outline-none focus:border-primario"
              >
                <option value="">Selecciona un equipo</option>
                {equipos.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                ))}
              </select>
            )}
          </div>

          <CampoTexto label="Nombre" id="nombre" value={formData.nombre} onChange={handleChange} required />
          <CampoTexto label="Apellidos" id="apellidos" value={formData.apellidos} onChange={handleChange} required />
          <CampoTexto label="Nacimiento (opc.)" id="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} />
          <CampoTexto label="Dorsal" id="dorsal" type="number" value={formData.dorsal} onChange={handleChange} required />
          
          <p className="text-xs text-textoSec mt-2">Un jugador solo puede estar en un equipo por torneo.</p>

          <div className="pt-4">
            <Boton type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar jugador'}</Boton>
          </div>
        </form>
      </div>
    </div>
  );
}