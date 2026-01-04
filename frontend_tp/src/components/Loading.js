import React from 'react';

// Componente de Loading/Spinner
const Loading = ({ size = 'md', text = '' }) => {
  // Definir tamanhos do spinner
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Spinner animado */}
      <div
        className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin`}
      ></div>
      
      {/* Texto opcional */}
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default Loading;
