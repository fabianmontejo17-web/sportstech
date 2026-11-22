import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axiosClient';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import Aviso from '../components/Aviso';

export default function Cedula() {
  const { partidoId } = useParams();
  const navigate = useNavigate();
  
  const [partido, setPartido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [eventos, setEventos] = useState([]);
  
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ equipo: 'local', jugador: '', tipo: 'gol', minuto: '' });

  useEffect(() => {
    const cargarPartido = async () => {
      try {
        const res = await api.getPartidoDetalle(partidoId);
        // Manejo del formato del backend: { partido: {...} }
        const data = res.data?.partido || res.partido || res.data || res;
        
        setPartido(data);
        setGolesLocal(data.golesLocal || 0);
        setGolesVisitante(data.golesVisitante || 0);
        setEventos(data.eventos || []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el partido');
      } finally {
        setCargando(false);
      }
    };
    cargarPartido();
  }, [partidoId]);

  const handleAgregarEvento = (e) => {
    e.preventDefault();
    if (!nuevoEvento.jugador || !nuevoEvento.minuto) return;

    const evento = {
      id: Date.now(),
      tipo: nuevoEvento.tipo,
      jugador: nuevoEvento.jugador,
      minuto: parseInt(nuevoEvento.minuto),
      equipo: nuevoEvento.equipo
    };

    setEventos([...eventos, evento]);
    
    // Auto-actualizar marcador visual solo si es gol o autogol
    if (evento.tipo === 'gol') {
      if (evento.equipo === 'local') setGolesLocal(prev => prev + 1);
      else setGolesVisitante(prev => prev + 1);
    } else if (evento.tipo === 'autogol') {
      if (evento.equipo === 'local') setGolesVisitante(prev => prev + 1);
      else setGolesLocal(prev => prev + 1);
    }

    setMostrarPanel(false);
    setNuevoEvento({ equipo: 'local', jugador: '', tipo: 'gol', minuto: '' });
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError('');
    try {
      await api.guardarCedula(partidoId, {
        golesLocal,
        golesVisitante,
        eventos: eventos.map(ev => ({ jugador: ev.jugador, tipo: ev.tipo, minuto: ev.minuto }))
      });
      navigate('/admin/calendario');
    } catch (err) {
      console.error(err);
      setError('Error al guardar la cédula');
      setGuardando(false);
    }
  };

  // --- CÁLCULO DE VALIDACIÓN ---
  let golesLocalEnEventos = 0;
  let golesVisitanteEnEventos = 0;

  eventos.forEach(ev => {
    if (ev.tipo === 'gol' && ev.equipo === 'local') golesLocalEnEventos++;
    if (ev.tipo === 'gol' && ev.equipo === 'visitante') golesVisitanteEnEventos++;
    if (ev.tipo === 'autogol' && ev.equipo === 'visitante') golesLocalEnEventos++;
    if (ev.tipo === 'autogol' && ev.equipo === 'local') golesVisitanteEnEventos++;
  });

  const marcadorCoincide = Number(golesLocal) === golesLocalEnEventos && Number(golesVisitante) === golesVisitanteEnEventos;

  if (cargando) return <div className="p-4 mt-10 text-center font-bold">Cargando cédula...</div>;
  if (!partido) return <div className="p-4 mt-10 text-center font-bold">Partido no encontrado</div>;

  return (
    <div className="pb-24">
      <Encabezado titulo={`Jornada ${partido.jornada} · ${partido.cancha}`} mostrarVolver={true} />
      
      <div className="p-4">
        <Aviso tipo="error" mensaje={error} />
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Cédula arbitral</h2>
        </div>

        {/* Marcador con botones + y - */}
        <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-lg border-[3px] border-texto">
          <div className="flex-1 text-center">
            <p className="font-bold text-lg mb-2">{partido.local}</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setGolesLocal(Math.max(0, golesLocal - 1))} className="w-12 h-12 border-[3px] border-texto rounded bg-white font-bold text-2xl flex items-center justify-center">-</button>
              <span className="text-4xl font-bold">{golesLocal}</span>
              <button onClick={() => setGolesLocal(golesLocal + 1)} className="w-12 h-12 border-[3px] border-texto rounded bg-white font-bold text-2xl flex items-center justify-center">+</button>
            </div>
          </div>
          
          <div className="px-2 text-2xl font-bold">-</div>
          
          <div className="flex-1 text-center">
            <p className="font-bold text-lg mb-2">{partido.visitante}</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setGolesVisitante(Math.max(0, golesVisitante - 1))} className="w-12 h-12 border-[3px] border-texto rounded bg-white font-bold text-2xl flex items-center justify-center">-</button>
              <span className="text-4xl font-bold">{golesVisitante}</span>
              <button onClick={() => setGolesVisitante(golesVisitante + 1)} className="w-12 h-12 border-[3px] border-texto rounded bg-white font-bold text-2xl flex items-center justify-center">+</button>
            </div>
          </div>
        </div>

        {/* Lista de Eventos */}
        <h3 className="font-bold text-lg mb-3">Eventos ({eventos.length})</h3>
        <div className="border-[3px] border-texto rounded-lg divide-y-[3px] divide-texto mb-6">
          {eventos.length === 0 ? (
            <p className="p-4 text-center text-textoSec">No hay eventos registrados</p>
          ) : (
            eventos.map(ev => (
              <div key={ev.id} className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-bold w-8 text-right">{ev.minuto}'</span>
                  <span className="capitalize">{ev.tipo === 'amarilla' ? '🟨 Amarilla' : ev.tipo === 'roja' ? '🟥 Roja' : ev.tipo === 'autogol' ? 'Autogol' : '⚽ Gol'}</span>
                </div>
                <span className="font-medium text-sm text-right">{ev.jugador}</span>
              </div>
            ))
          )}
        </div>

        {/* Aviso Dinámico con mensaje simplificado */}
        <div className={`p-3 mb-6 rounded-lg border-[3px] font-bold text-sm ${marcadorCoincide ? 'bg-resalte text-texto border-resalte' : 'bg-error text-white border-error'}`}>
          {marcadorCoincide 
            ? 'El marcador coincide con los eventos registrados.' 
            : 'El marcador NO coincide con los eventos. Ajusta los goles con los botones + y -.'}
        </div>

        <Boton onClick={() => setMostrarPanel(true)} className="mb-4" variante="resalte">
          + Agregar evento
        </Boton>

        <Boton onClick={handleGuardar} disabled={!marcadorCoincide || guardando} variante={marcadorCoincide ? "primario" : "secundario"}>
          {guardando ? 'Guardando...' : 'Guardar y finalizar'}
        </Boton>
      </div>

      {/* Panel Inferior para agregar eventos */}
      {mostrarPanel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-[480px] rounded-t-xl p-4 border-t-[3px] border-texto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Nuevo Evento</h3>
              <button onClick={() => setMostrarPanel(false)} className="font-bold text-xl p-2 w-[52px] h-[52px] flex items-center justify-center">X</button>
            </div>
            
            <form onSubmit={handleAgregarEvento} className="space-y-3">
              <div>
                <label className="block mb-1 font-bold text-sm">Equipo</label>
                <select value={nuevoEvento.equipo} onChange={e => setNuevoEvento({...nuevoEvento, equipo: e.target.value})} className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg bg-white">
                  <option value="local">{partido.local}</option>
                  <option value="visitante">{partido.visitante}</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold text-sm">Jugador</label>
                <input type="text" required placeholder="Nombre del jugador" value={nuevoEvento.jugador} onChange={e => setNuevoEvento({...nuevoEvento, jugador: e.target.value})} className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg" />
              </div>

              <div>
                <label className="block mb-1 font-bold text-sm">Minuto</label>
                <input type="number" required placeholder="Ej. 12" value={nuevoEvento.minuto} onChange={e => setNuevoEvento({...nuevoEvento, minuto: e.target.value})} className="w-full h-[52px] px-3 border-[3px] border-texto rounded-lg" />
              </div>

              <div>
                <label className="block mb-1 font-bold text-sm">Tipo de evento</label>
                <div className="grid grid-cols-2 gap-2">
                  {['gol', 'autogol', 'amarilla', 'roja'].map(tipo => (
                    <button key={tipo} type="button" onClick={() => setNuevoEvento({...nuevoEvento, tipo})} className={`h-[52px] rounded-lg border-[3px] font-bold capitalize ${nuevoEvento.tipo === tipo ? 'bg-texto text-white border-texto' : 'bg-white text-texto border-texto'}`}>
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Boton type="submit">Agregar al acta</Boton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}