import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, logout, isAdmin, isTrainer, isClient } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    logout();
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [];

  // Links baseados no role
  if (isAdmin) {
    navLinks.push(
      { path: '/admin-dashboard', label: 'Dashboard' },
      { path: '/admin', label: 'Gestão de Utilizadores' },
      { path: '/admin/pt-requests', label: 'Pedidos de PT' },
      { path: '/admin/client-requests', label: '📋 Pedidos de Cliente' }
    );
  } else if (isTrainer) {
    navLinks.push(
      { path: '/', label: 'Dashboard' },
      { path: '/workouts', label: 'Planos de Treino' },
      { path: '/my-clients', label: 'Meus Clientes' },
      { path: '/messages', label: 'Mensagens' }
    );
  } else if (isClient) {
    navLinks.push(
      { path: '/', label: 'Dashboard' },
      { path: '/my-workouts', label: 'Meus Treinos' },
      { path: '/select-pt', label: 'Escolher PT' },
      { path: '/messages', label: 'Mensagens' }
    );
  }

  return (
    <nav className="bg-primary-600 dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center text-white font-bold text-xl"
            >
              <svg
                className="w-8 h-8 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              PT Platform
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.path)
                    ? 'bg-primary-700 dark:bg-gray-700 text-white'
                    : 'text-primary-100 dark:text-gray-300 hover:bg-primary-500 dark:hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side - Theme toggle & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-primary-100 dark:text-gray-300 hover:bg-primary-500 dark:hover:bg-gray-700 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity"
              >
                <Avatar src={user?.profileImage} name={user?.username} size="sm" />
                <span className="text-sm font-medium">{user?.username}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'PT' ? 'Personal Trainer' : user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-white hover:bg-primary-500 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-700 dark:bg-gray-900">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  block px-3 py-2 rounded-md text-base font-medium transition-colors
                  ${isActive(link.path)
                    ? 'bg-primary-800 dark:bg-gray-800 text-white'
                    : 'text-primary-100 dark:text-gray-300 hover:bg-primary-600 dark:hover:bg-gray-800'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
            
            <hr className="border-primary-500 dark:border-gray-700 my-2" />
            
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 dark:text-gray-300 hover:bg-primary-600 dark:hover:bg-gray-800"
            >
              Perfil
            </Link>
            
            <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary-100 dark:text-gray-300 hover:bg-primary-600 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-primary-600 dark:hover:bg-gray-800"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;