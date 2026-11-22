import { useState, useEffect } from 'react';
import { api } from '../api/axiosClient';
import { useTorneo } from '../context/TorneoContext';
import Encabezado from '../components/Encabezado';
import MenuInferior from '../components/MenuInferior';
import Boton from '../components/Boton';
import CampoTexto from '../components/CampoTexto';
import Aviso from '../components/Aviso';

export default function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  // Usamos el contexto global
  const { torneoActivo, setTorneoActivo } = useTorneo();

  const cargarTorneos = async () => {
    try {
      const res = await api.getTorneos();
      const data = res.torneos || res.data || res;
      setTorneos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar torneos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTorneos();
  }, []);

  const handleCrearTorneo = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setGuardando(true);
    setError('');
    try {
      await api.crearTorneo({ nombre: nuevoNombre });
      setNuevoNombre('');
      cargarTorneos();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear torneo');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="pb-[80px]">
      <Encabezado titulo="Torneos" />
      
      <div className="p-4">
        <Aviso tipo="error" mensaje={error} />

        {/* Formulario para crear torneo */}
        <form onSubmit={handleCrearTorneo} className="mb-8 p-4 border-[3px] border-texto rounded-lg bg-gray-50">
          <h2 className="font-bold text-lg mb-3">Crear nuevo torneo</h2>
          <CampoTexto 
            label="Nombre del torneo" 
            id="nombre" 
            placeholder="Ej. Torneo Clausura 2027" 
            value={nuevoNombre}
            onChange={e => setNuevoNombre(e.target.value)}
            required 
          />
          <Boton type="submit" disabled={guardando} variante="resalte">
            {guardando ? 'Creando...' : 'Crear torneo'}
          </Boton>
        </form>

        {/* Lista de torneos */}
        <h2 className="font-bold text-lg mb-3">Torneos existentes</h2>
        {cargando ? (
          <p className="font-bold text-center mt-10">Cargando torneos...</p>
        ) : torneos.length === 0 ? (
          <p className="text-textoSec text-center mt-10">No hay torneos registrados.</p>
        ) : (
          <div className="space-y-3">
            {torneos.map(torneo => {
              const esActivo = torneoActivo?.id === torneo.id;
              return (
                <div 
                  key={torneo.id} 
                  className={`border-[3px] rounded-lg p-4 flex justify-between items-center ${esActivo ? 'border-primario bg-green-50' : 'border-texto'}`}
                >
                  <div>
                    <p className="font-bold">{torneo.nombre}</p>
                    <p className="text-sm text-textoSec">ID: {torneo.id}</p>
                  </div>
                  {esActivo ? (
                    <span className="bg-primario text-white text-xs font-bold px-2 py-1 rounded">Activo</span>
                  ) : (
                    <button 
                      onClick={() => setTorneoActivo(torneo)}
                      className="bg-gray-200 font-bold px-3 py-2 rounded-lg border-[2px] border-texto text-sm"
                    >
                      Seleccionar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <MenuInferior />
    </div>
  );
}