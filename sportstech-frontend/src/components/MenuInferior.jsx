import { Link, useLocation } from 'react-router-dom';

export default function MenuInferior() {
  const location = useLocation();
  const items = [
    { path: '/admin', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/calendario', label: 'Partidos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path: '/admin/posiciones', label: 'Tablas', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2' },
    { path: '/admin/equipos', label: 'Más', icon: 'M4 6h16M4 12h16M4 18h16' }
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t-[3px] border-texto flex justify-around items-center z-50 max-w-[480px] mx-auto">
      {items.map((item) => {
        const activo = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
        return (
          <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center w-full h-full min-h-[52px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={activo ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round" className={activo ? 'text-texto' : 'text-textoSec'}><path d={item.icon} /></svg>
            <span className={`text-xs mt-1 ${activo ? 'font-bold text-texto' : 'text-textoSec'}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
