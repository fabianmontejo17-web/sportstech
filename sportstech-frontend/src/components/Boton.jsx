export default function Boton({ children, variante = 'primario', className = '', ...props }) {
  const base = "flex items-center justify-center w-full min-h-[52px] px-4 font-bold text-lg border-[3px] border-texto rounded-lg transition-colors focus:outline-none disabled:opacity-50";
  const variantes = {
    primario: "bg-primario text-white border-primario hover:bg-green-800",
    secundario: "bg-white text-texto hover:bg-gray-100",
    resalte: "bg-resalte text-texto hover:bg-yellow-500",
    peligro: "bg-error text-white border-error hover:bg-red-800",
    fantasma: "bg-transparent border-transparent hover:bg-gray-200"
  };
  return <button className={`${base} ${variantes[variante]} ${className}`} {...props}>{children}</button>;
}