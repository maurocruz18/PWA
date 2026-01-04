import React from 'react';
import { getInitials, generateColor } from '../utils/helpers';

// Componente Avatar
const Avatar = ({ 
  src, 
  name = '', 
  size = 'md', 
  className = '' 
}) => {
  // Tamanhos do avatar
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  // Se tem imagem, mostrar imagem
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  // Se não tem imagem, mostrar iniciais com cor gerada
  const initials = getInitials(name);
  const bgColor = generateColor(name);

  return (
    <div
      className={`
        ${sizes[size]} 
        rounded-full 
        flex items-center justify-center 
        font-semibold text-white
        ${className}
      `}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
