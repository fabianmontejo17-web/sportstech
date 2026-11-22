import { Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Calendario from './pages/Calendario';
import ProgramarPartido from './pages/ProgramarPartido';
import Cedula from './pages/Cedula';
import Equipos from './pages/Equipos';
import NuevoEquipo from './pages/NuevoEquipo';
import AgregarJugador from './pages/AgregarJugador';
import Tablas from './pages/Tablas';
import LigaPublica from './pages/LigaPublica';
import Torneos from './pages/Torneos'; // NUEVA PANTALLA

const Placeholder = ({ nombre }) => (
  <div className="p-4 pt-10 text-center font-bold">Pantalla: {nombre} (Próxima entrega)</div>
);

function App() {
  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white shadow-xl relative">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RutaProtegida />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cedula/:partidoId" element={<Cedula />} />
          <Route path="/admin/posiciones" element={<Tablas />} />
          <Route path="/admin/goleo" element={<Tablas />} />
          <Route path="/admin/equipos" element={<Equipos />} />
          <Route path="/admin/equipos/nuevo" element={<NuevoEquipo />} />
          <Route path="/admin/jugadores/nuevo" element={<AgregarJugador />} />
          <Route path="/admin/calendario" element={<Calendario />} />
          <Route path="/admin/calendario/nuevo" element={<ProgramarPartido />} />
          
          {/* NUEVA RUTA DE TORNEOS */}
          <Route path="/admin/torneos" element={<Torneos />} />
        </Route>

        <Route path="/liga/:slug" element={<LigaPublica />} />
        <Route path="/liga/:slug/goleo" element={<LigaPublica />} />
        <Route path="/liga/:slug/calendario" element={<LigaPublica />} />
      </Routes>
    </div>
  );
}

export default App;