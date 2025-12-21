import React from 'react';

export const Button = ({ variant = 'primary', children, ...props }) => {
  
  const baseStyles = "px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: `
      bg-primary text-white shadow-lg shadow-primary/30 
      hover:bg-primary-hover 
      dark:shadow-primary/50 dark:hover:shadow-primary/70 
      /* W dark mode primary button po prostu mocniej "świeci" */
    `,
    secondary: `
      bg-secondary text-amber-900 
      hover:bg-yellow-400
    `,
    outline: `
      border-2 border-primary text-primary
      hover:bg-primary/10
      dark:border-primary-light dark:text-primary-light
    `
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};