import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { useTorneo } from '../context/TorneoContext';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import CampoTexto from '../components/CampoTexto';
import Aviso from '../components/Aviso';

export default function ProgramarPartido() {
  const navigate = useNavigate();
  const { torneoActivo } = useTorneo();
  
  const [equipos, setEquipos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [arbitros, setArbitros] = useState([]);
  
  const [formData, setFormData] = useState({
    localEquipoId: '', 
    visitanteEquipoId: '', 
    canchaId: '', 
    fecha: '', 
    hora: '', 
    arbitroId: '',
    jornada: '1' // Por defecto Jornada 1, pero ahora es libre
  });
  
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resEq, resCan, resArb] = await Promise.all([
          api.getEquiposConPlantilla(), 
          api.getCanchas(), 
          api.getArbitros()
        ]);
        
        const eqData = resEq.equipos || resEq.data || resEq;
        const canData = resCan.canchas || resCan.data || resCan;
        const arbData = resArb.arbitros || resArb.data || resArb;

        setEquipos(Array.isArray(eqData) ? eqData : []);
        setCanchas(Array.isArray(canData) ? canData : []);
        setArbitros(Array.isArray(arbData) ? arbData : []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos iniciales');
      } finally {
        setCargandoDatos(false);
      }
    };
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    if (formData.localEquipoId === formData.visitanteEquipoId) {
      setError('El equipo local y visitante no pueden ser el mismo.');
      setCargando(false);
      return;
    }

    try {
      const fechaHora = `${formData.fecha}T${formData.hora}:00`;
      
      await api.crearPartido({
        localEquipoId: parseInt(formData.localEquipoId),
        visitanteEquipoId: parseInt(formData.visitanteEquipoId),
        canchaId: parseInt(formData.canchaId),
        arbitroId: formData.arbitroId ? parseInt(formData.arbitroId) : null,
        fechaHora: fechaHora,
        hora: formData.hora,
        jornada: parseInt(formData.jornada), // Enviamos la jornada libre
        torneoId: torneoActivo?.id || 1
      });
      navigate('/admin/calendario');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError('Ocurrió un error al guardar el partido.');
      }
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) return <div className="p-4 mt-10 text-center font-bold">Cargando datos...</div>;

  return (
    <div className="pb-10">
      <Encabezado titulo="Programar partido" mostrarVolver={true} />
      
      <div className="p-4">
        <div className="mb-4 p-2 bg-gray-100 rounded border-[2px] border-gray-300 text-sm font-bold text-center">
          Torneo: {torneoActivo?.nombre || 'Sin torneo seleccionado'}
        </div>

        <Aviso tipo="error" mensaje={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CAMPO DE JORNADA LIBRE */}
          <div>
            <label className="block mb-1 font-bold text-sm">Jornada</label>
            <input 
              id="jornada" 
              type="number" 
              min="1" 
              value={formData.jornada} 
              onChange={handleChange} 
              className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg bg-white outline-none focus:border-primario font-bold"
              placeholder="Ej. 6"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-sm">Local</label>
            <select id="localEquipoId" required value={formData.localEquipoId} onChange={handleChange} className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg bg-white outline-none focus:border-primario">
              <option value="">Selecciona equipo local</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-bold text-sm">Visitante</label>
            <select id="visitanteEquipoId" required value={formData.visitanteEquipoId} onChange={handleChange} className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg bg-white outline-none focus:border-primario">
              <option value="">Selecciona equipo visitante</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-bold text-sm">Cancha</label>
            <select id="canchaId" required value={formData.canchaId} onChange={handleChange} className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg bg-white outline-none focus:border-primario">
              <option value="">Selecciona cancha</option>
              {canchas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <CampoTexto label="Fecha" id="fecha" type="date" required value={formData.fecha} onChange={handleChange} />
            </div>
            <div className="flex-1">
              <CampoTexto label="Hora" id="hora" type="time" required value={formData.hora} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-sm">Árbitro (opcional)</label>
            <select id="arbitroId" value={formData.arbitroId} onChange={handleChange} className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg bg-white outline-none focus:border-primario">
              <option value="">Sin asignar</option>
              {arbitros.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          <div className="pt-4">
            <Boton type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar partido'}</Boton>
          </div>
        </form>
      </div>
    </div>
  );
}