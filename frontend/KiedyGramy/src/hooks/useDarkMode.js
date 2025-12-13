import { useEffect, useState } from 'react';

export default function useDarkMode() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    // Usuń starą klasę
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    // Dodaj nową
    root.classList.add(theme);
    
    // Zapisz w pamięci przeglądarki
    localStorage.setItem('theme', theme);
  }, [theme]);

  return [theme, setTheme];
}