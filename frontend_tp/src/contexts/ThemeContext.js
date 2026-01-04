import React, { createContext, useState, useEffect, useContext } from 'react';

// Criar contexto do tema
const ThemeContext = createContext();

// Provider do tema
export const ThemeProvider = ({ children }) => {
  // Estado do tema (light ou dark)
  const [theme, setTheme] = useState(() => {
    // Recuperar tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Efeito para aplicar classe no HTML e salvar no localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remover classe anterior
    root.classList.remove('light', 'dark');
    
    // Adicionar classe do tema atual
    root.classList.add(theme);
    
    // Salvar no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para alternar tema
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook customizado para usar o contexto do tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};

export default ThemeContext;
