export default function CampoTexto({ label, id, error, ...props }) {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={id} className="mb-1 font-bold text-texto text-sm">{label}</label>
      <input id={id} className={`h-[52px] px-3 border-[3px] rounded-lg text-lg font-medium outline-none transition-colors ${error ? 'border-error focus:border-error' : 'border-texto focus:border-primario'}`} {...props} />
      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </div>
  );
}
