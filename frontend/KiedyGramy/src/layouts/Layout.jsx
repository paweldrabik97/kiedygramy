import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';

const Layout = () => {
  // Stan paska bocznego (czy rozwinięty?)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Stan menu użytkownika (czy rozwinięte?)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Dark mode state
  const [theme, setTheme] = useDarkMode();

  // Hook do sprawdzania, na której stronie jesteśmy (do podświetlania linków)
  const location = useLocation();

  // Funkcja wylogowania (atrapa)
  const handleLogout = () => {
    console.log("Wylogowano użytkownika");
    // Tutaj dodasz logikę czyszczenia tokena i przekierowania
  };

  // Funkcja przełączająca
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Lista linków nawigacyjnych
  const navItems = [
    { name: 'Start', path: '/', icon: <HomeIcon /> },
    { name: 'Moje Gry', path: '/games', icon: <GamepadIcon /> },
    { name: 'Statystyki', path: '/stats', icon: <ChartIcon /> }, // Przykładowa podstrona
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-300">      
      {/* --- SIDEBAR (LEWY PASEK) --- */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col relative z-20`}
      >
        {/* Przycisk zwijania/rozwijania paska (Strzałka) */}
        <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 z-50 text-gray-500"
            title={isSidebarOpen ? "Zwiń" : "Rozwiń"}
        >
            {isSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>

        {/* Logo w Sidebarze */}
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
            {isSidebarOpen ? (
                 <span className="text-xl font-bold text-blue-600">KiedyGramy</span>
            ) : (
                 <span className="text-xl font-bold text-blue-600">KG</span>
            )}
        </div>

        {/* Linki nawigacyjne */}
        <nav className="flex-1 py-6 space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors group ${
                    isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={!isSidebarOpen ? item.name : ''}
              >
                {/* Ikona */}
                <span className="shrink-0">{item.icon}</span>
                
                {/* Tekst (ukrywany gdy pasek zwinięty) */}
                <span 
                    className={`ml-3 font-medium transition-opacity duration-200 whitespace-nowrap ${
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
        
        {/* --- TOPBAR (GÓRNY PASEK) --- */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm z-10">
          
          {/* Lewa strona Topbara (np. Tytuł aktualnej strony lub Pustka) */}
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
             {/* Opcjonalnie: Wyświetl nazwę strony na podstawie URL */}
                {navItems.find(item => item.path === location.pathname)?.name || 'Strona'}
          </h2>

          {/* Prawa strona Topbara (Awatar + Menu) */}
          <div className="relative">
            <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg hover:ring-2 hover:ring-blue-300 transition-all">
                    J {/* Pierwsza litera imienia */}
                </div>
            </button>

            {/* Dropdown Menu (Pojawia się po kliknięciu w awatar) */}
            {isUserMenuOpen && (
                <>
                    {/* Niewidzialna warstwa pod spodem, żeby zamknąć menu klikając gdziekolwiek */}
                    <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsUserMenuOpen(false)}
                    ></div>
                    
                    {/* Właściwe menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-40 py-1 animate-fade-in-down">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">Jan Kowalski</p>
                            <p className="text-xs text-gray-500">jan@example.com</p>
                        </div>
                        <Link 
                            to="/profile" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                        >
                            Ustawienia profilu
                        </Link>
                        <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                title="Zmień motyw"
            >
                {theme === 'light' ? (
                    // Ikona Księżyca (gdy jest jasno)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                ) : (
                    // Ikona Słońca (gdy jest ciemno)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </button>
                        <button 
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            Wyloguj się
                        </button>
                    </div>
                </>
            )}
          </div>
        </header>


        {/* --- TREŚĆ STRONY (OUTLET) --- */}
        {/* Tutaj React Router wstrzykuje komponenty podstron (np. GamesPage) */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
            <Outlet /> 
        </main>

      </div>
    </div>
  );
};

// --- Proste ikonki SVG (aby nie instalować dodatkowych bibliotek na razie) ---
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

export default Layout;