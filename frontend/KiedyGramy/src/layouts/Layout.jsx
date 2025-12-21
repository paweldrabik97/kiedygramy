import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/services/auth';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const navigate = useNavigate();
  // Stan paska bocznego (czy rozwinięty?)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Stan menu użytkownika (czy rozwinięte?)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Dark mode state z Contextu
  const { theme, toggleTheme } = useTheme();

  // Hook do sprawdzania, na której stronie jesteśmy
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Lista linków nawigacyjnych
  const navItems = [
    { name: 'Start', path: '/dashboard', icon: <HomeIcon /> },
    { name: 'Moje Gry', path: '/games', icon: <GamepadIcon /> },
    { name: 'Moje Sesje', path: '/sessions', icon: <GamepadIcon /> },
    { name: 'Statystyki', path: '/stats', icon: <ChartIcon /> },
  ];

  return (
    // ZMIANA: font-sans (Outfit) dla całej aplikacji, kolory tła surface-light/dark
    <div className="flex h-screen bg-surface-light dark:bg-surface-dark font-sans text-text-main dark:text-text-inverse overflow-hidden transition-colors duration-300">      
      
      {/* --- SIDEBAR (LEWY PASEK) --- */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-surface-card border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col relative z-20`}
      >
        {/* Przycisk zwijania/rozwijania paska */}
        <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-9 bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 z-50 text-text-muted hover:text-primary transition-colors"
            title={isSidebarOpen ? "Zwiń" : "Rozwiń"}
        >
            {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>

        {/* Logo w Sidebarze */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-3">
                
                {/* Logo (Kostka D20) - Zawsze widoczne */}
                <MiniLogo />

                {/* Tekst - Widoczny tylko gdy pasek otwarty */}
                <span 
                    className={`font-display font-bold text-xl tracking-tight text-text-main dark:text-text-inverse whitespace-nowrap transition-opacity duration-200 ${
                        isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                    }`}
                >
                    KiedyGramy<span className="text-primary">.</span>
                </span>

            </div>
        </div>

        {/* Linki nawigacyjne */}
        <nav className="flex-1 py-6 space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-lg transition-all group ${
                    isActive 
                    ? 'bg-primary/10 text-primary font-semibold' // Aktywny: Lekki fiolet tła + mocny tekst
                    : 'text-text-muted hover:bg-surface-light dark:hover:bg-gray-700 hover:text-primary' // Nieaktywny
                }`}
                title={!isSidebarOpen ? item.name : ''}
              >
                {/* Ikona */}
                <span className={`shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`}>
                    {item.icon}
                </span>
                
                {/* Tekst */}
                <span 
                    className={`ml-3 transition-opacity duration-200 whitespace-nowrap ${
                        isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
                    }`}
                >
                    {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>


      {/* --- GŁÓWNA ZAWARTOŚĆ (PRAWA STRONA) --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* --- TOPBAR --- */}
        <header className="h-16 bg-white dark:bg-surface-card border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm z-10 transition-colors">
          
          {/* Tytuł strony */}
          <h2 className="text-xl font-bold font-display text-text-main dark:text-text-inverse">
             {navItems.find(item => item.path === location.pathname)?.name || 'Panel'}
          </h2>

          {/* Prawa strona Topbara */}
          <div className="relative flex items-center gap-4">
            
            

            {/* Avatar */}
            <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                {/* ZMIANA: Tło avatara na primary */}
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-display hover:ring-2 hover:ring-primary-light transition-all shadow-md">
                    J
                </div>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 top-12 mt-2 w-56 bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-40 py-2 animate-fade-in-down">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-bold text-text-main dark:text-text-inverse font-display">Jan Kowalski</p>
                            <p className="text-xs text-text-muted">jan@example.com</p>
                        </div>
                        
                        <div className="py-1">
                            <Link 
                                to="/profile" 
                                className="block px-4 py-2 text-sm text-text-main dark:text-text-inverse hover:bg-surface-light dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                Ustawienia profilu
                            </Link>
                            {/* Przycisk zmiany motywu */}
                            <button 
                                onClick={toggleTheme}
                                // ZMIANA: Używam koloru secondary (Gold) dla ikon słońca/księżyca
                                className="p-2 rounded-full text-secondary hover:bg-primary/5 transition-colors"
                                title="Zmień motyw"
                            >
                                {theme === 'light' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Wyloguj się
                            </button>
                        </div>
                    </div>
                </>
            )}
          </div>
        </header>


        {/* --- TREŚĆ STRONY --- */}
        <main className="flex-1 overflow-y-auto bg-surface-light dark:bg-surface-dark p-6 transition-colors">
            <Outlet /> 
        </main>

      </div>
    </div>
  );
};

// Ikonki (bez zmian)
const HomeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const GamepadIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
);
const ChartIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const ChevronLeftIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRightIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);
const MiniLogo = () => (
  <>
    <div className="w-8 h-8 shrink-0 bg-primary rounded-lg flex items-center justify-center text-white relative shadow-md">
          {/* SVG D20 */}
        <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
            <path d="M50 5 L20 40 L80 40 Z" />
            <path d="M20 40 L50 85 L80 40" />
            <path d="M20 40 L7 72" />
            <path d="M80 40 L93 72" />
        </svg>
        {/* Złota kropka (Secondary Color) */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-white dark:border-surface-card"></div>
    </div>
  </>
);

export default Layout;