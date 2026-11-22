import { useNavigate } from 'react-router-dom';

export default function Encabezado({ titulo, mostrarVolver = false }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center h-[60px] px-4 border-b-[3px] border-texto bg-white sticky top-0 z-10">
      {mostrarVolver && (
        <button onClick={() => navigate(-1)} className="mr-3 p-2 -ml-2 min-w-[52px] min-h-[52px] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      )}
      <h1 className="text-xl font-bold text-texto truncate">{titulo}</h1>
    </header>
  );
}
