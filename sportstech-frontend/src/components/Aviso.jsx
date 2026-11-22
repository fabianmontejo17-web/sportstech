export default function Aviso({ tipo = 'error', mensaje }) {
  if (!mensaje) return null;
  const estilos = { error: 'bg-error text-white border-error', exito: 'bg-primario text-white border-primario', advertencia: 'bg-resalte text-texto border-resalte' };
  return <div className={`p-3 mb-4 rounded-lg border-[3px] font-bold text-sm ${estilos[tipo]}`}>{mensaje}</div>;
}