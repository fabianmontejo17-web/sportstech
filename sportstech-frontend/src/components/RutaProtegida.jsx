import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div className="p-4 text-center mt-10 font-bold">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Outlet />;
}