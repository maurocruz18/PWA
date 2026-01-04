import React from 'react';

// Componente Card reutilizável
const Card = ({ 
  children, 
  title, 
  className = '',
  padding = true,
  hover = false,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-md 
        ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
    >
      {/* Título do card */}
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      
      {/* Conteúdo do card */}
      {children}
    </div>
  );
};

export default Card;
