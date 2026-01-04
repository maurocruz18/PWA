import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

const applyTheme = (theme) => {
  const html = document.documentElement;
  const preferredTheme = theme || 'dark'; // Default é dark
  
  if (preferredTheme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Aplicar tema do utilizador
        applyTheme(parsedUser.themePreference);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Aplicar tema default (dark)
        applyTheme('dark');
      }
    } else {
      // Sem utilizador, aplicar tema default (dark)
      applyTheme('dark');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user: userData } = response.data;

      if (userData.role === 'PT' && !userData.isValidated) {
        throw new Error('Sua conta de PT ainda não foi validada pelo administrador.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Aplicar tema do utilizador ao fazer login
      applyTheme(userData.themePreference);

      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const register = async (username, password, role, email) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        password,
        role,
        email,
      });

      if (role === 'PT') {
        toast.info('Conta criada! Aguarde a validação do administrador para fazer login.');
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao registar';
      throw new Error(errorMessage);
    }
  };

  const loginWithQRCode = async (qrToken) => {
    try {
      const response = await api.post('/auth/qr-login', { qrToken });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Aplicar tema do utilizador ao fazer login com QR
      applyTheme(userData.themePreference);

      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login com QR Code';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];

    setUser(null);
    setIsAuthenticated(false);

    // Aplicar tema default ao fazer logout
    applyTheme('dark');

    setTimeout(() => {
      window.location.href = '/login';
    }, 0);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Se mudou o tema, aplicar
    if (updatedData.themePreference) {
      applyTheme(updatedData.themePreference);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isTrainer = user?.role === 'PT';
  const isClient = user?.role === 'CLIENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isTrainer,
        isClient,
        login,
        register,
        loginWithQRCode,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};