import { useEffect, useState } from 'react';

export default function useDarkMode() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    // Remove old class
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    // Add new class
    root.classList.add(theme);
    
    // Save in browser storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, setTheme];
}