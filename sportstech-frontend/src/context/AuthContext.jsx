import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sportstech_token');
    if (token) setUsuario({ nombre: 'Admin' }); 
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      const data = res.data || res; 
      if (data.ok) {
        localStorage.setItem('sportstech_token', data.token);
        setUsuario(data.usuario);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en login", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('sportstech_token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);