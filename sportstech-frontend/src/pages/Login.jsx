import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Boton from '../components/Boton';
import CampoTexto from '../components/CampoTexto';

export default function Login() {
  const [email, setEmail] = useState('admin@sportstech.test');
  const [password, setPassword] = useState('123456');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Estado para manejar errores
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const exito = await login(email, password);
    
    if (exito) {
      navigate('/admin');
    } else {
      setError('Credenciales incorrectas. Intenta de nuevo.');
      setCargando(false);
    }
  };

  return (
    <div className="p-6 pt-20">
      <h1 className="text-3xl font-bold mb-2">SportsTech</h1>
      <p className="text-textoSec mb-8">Tu liga, sin papel ni WhatsApp.</p>
      
      <form onSubmit={handleSubmit}>
        <CampoTexto 
          label="Correo" 
          id="email" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        
        <CampoTexto 
          label="Contraseña" 
          id="pass" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />

        {/* Mostramos el error si las credenciales fallan */}
        {error && (
          <div className="bg-error text-white font-bold p-3 rounded-lg mb-4 border-[3px] border-error">
            {error}
          </div>
        )}

        <Boton type="submit" className="mt-6" disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </Boton>
      </form>
      
      <div className="mt-6 text-center">
        <Link to="/liga/liga-demo" className="text-primario font-bold underline text-lg min-h-[52px] inline-block py-2">
          Ver tablas públicas
        </Link>
      </div>
    </div>
  );
}