import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import { useTorneo } from '../context/TorneoContext';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import CampoTexto from '../components/CampoTexto';
import Aviso from '../components/Aviso';

export default function NuevoEquipo() {
  const navigate = useNavigate();
  const { torneoActivo } = useTorneo();
  
  const [nombre, setNombre] = useState('');
  const [color, setColor] = useState('#FFC400');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const colores = ['#FFC400', '#0A5C2E', '#1E40AF', '#B00020', '#0B0B0B'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.crearEquipo({ 
        nombre, 
        colorPrincipal: color, 
        torneoId: torneoActivo?.id // <-- Le pasamos el ID del torneo activo
      });
      navigate('/admin/equipos');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.mensaje) {
        setError(err.response.data.mensaje);
      } else {
        setError('Error al crear el equipo.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pb-10">
      <Encabezado titulo="Nuevo equipo" mostrarVolver={true} />
      
      <div className="p-4">
        <Aviso tipo="error" mensaje={error} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <CampoTexto 
            label="Nombre del equipo" 
            id="nombre" 
            placeholder="Ej. Halcones FC" 
            value={nombre} 
            onChange={e => setNombre(e.target.value)} 
            required 
          />

          <div>
            <label className="block mb-2 font-bold text-sm">Color principal</label>
            <div className="flex gap-3">
              {colores.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-12 h-12 rounded-full border-[3px] ${color === c ? 'border-texto scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-sm">Se inscribe en el torneo</label>
            <div className="h-[52px] px-3 border-[3px] border-texto rounded-lg flex items-center bg-gray-100 font-medium">
              {torneoActivo?.nombre || 'Selecciona un torneo primero'}
            </div>
            <p className="text-xs text-textoSec mt-2">El nombre no puede repetirse dentro de la misma liga.</p>
          </div>

          <div className="pt-4">
            <Boton type="submit" disabled={cargando || !torneoActivo}>
              {cargando ? 'Guardando...' : 'Guardar equipo'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
}