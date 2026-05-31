import React from 'react';

export const Button = ({ variant = 'primary', children, className = '', onClick, ...props }) => {
  
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: `
      bg-gradient-to-r from-primary to-fuchsia-500 text-white
      shadow-lg shadow-primary/30
      hover:from-primary-hover hover:to-fuchsia-600
      dark:shadow-primary/50
    `,
    secondary: `
      bg-gradient-to-r from-secondary to-amber-300 text-amber-900
      shadow-md shadow-amber-200/50
      hover:from-yellow-400 hover:to-amber-400
    `,
    outline: `
      border-2 border-primary text-primary
      hover:bg-primary/10
      dark:border-primary-light dark:text-primary-light
    `
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props} onClick={onClick}>
      {children}
    </button>
  );
};