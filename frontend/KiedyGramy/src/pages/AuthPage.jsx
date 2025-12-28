import React, { useState } from "react";
import { useAuth } from "../features/auth/context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";

const AuthPage = () => {
  // --- STATE ---
  const { login, register } = useAuth();
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    city: "",
  });
  const [newFormData, setNewFormData] = useState({
    newUsername: "",
    newEmail: "",
    newPassword: "",
    newConfirmPassword: "",
    newFullName: "",
    newCity: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewFormData({ ...newFormData, [name]: value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(formData.username, formData.password);
      navigate("/dashboard"); 
    } catch (err) {
      setError(`Błąd logowania. Sprawdź swoje dane.`);
      console.error("Login failed:", err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newFormData.newPassword !== newFormData.newConfirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: newFormData.newUsername,
        email: newFormData.newEmail,
        password: newFormData.newPassword,
        fullName: newFormData.newFullName,
        city: newFormData.newCity,
      });
      // Po rejestracji możemy od razu przekierować lub kazać się zalogować
      //navigate("/dashboard");
    } catch (err) {
      setError("Rejestracja nieudana. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  // Wspólne style dla inputów
  const inputClasses = "w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-text-main dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Tło dekoracyjne (opcjonalne) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      {/* --- PRZYCISK POWROTU --- */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-medium bg-white/80 dark:bg-surface-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span>Wróć na stronę główną</span>
      </Link>

      {/* --- GŁÓWNY KONTENER --- */}
      <div className="relative bg-white dark:bg-surface-card rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl min-h-[650px] flex">
        
        {/* --- SEKCJA LOGOWANIA (Lewa strona) --- */}
        <div className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center p-12 bg-white dark:bg-surface-card z-10 transition-opacity duration-700">
          <div className="w-full max-w-sm">
            <h2 className="text-4xl font-bold font-display mb-2 text-slate-900 dark:text-white text-center">Witaj ponownie!</h2>
            <p className="text-text-muted text-center mb-8">Zaloguj się, aby zarządzać sesjami.</p>
            
            {error && !isRegisterActive && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Nazwa użytkownika"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Hasło"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={inputClasses}
                />
              </div>
              
              <div className="flex justify-end">
                <a href="#" className="text-sm text-primary hover:text-primary-hover font-medium">Zapomniałeś hasła?</a>
              </div>

              <Button type="submit" className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg shadow-primary/30 transition-all font-bold text-lg">
                Zaloguj się
              </Button>
            </form>
          </div>
        </div>

        {/* --- SEKCJA REJESTRACJI (Prawa strona) --- */}
        <div className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-center p-12 bg-white dark:bg-surface-card z-10">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold font-display mb-2 text-slate-900 dark:text-white text-center">Stwórz konto</h2>
            <p className="text-text-muted text-center mb-6">Dołącz do społeczności KiedyGramy.</p>

            {error && isRegisterActive && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-200 rounded-lg text-sm text-center border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Nazwa użytkownika"
                name="newUsername"
                value={newFormData.newUsername}
                onChange={handleNewInputChange}
                required
                className={inputClasses}
              />
              <input
                type="email"
                placeholder="Email"
                name="newEmail"
                value={newFormData.newEmail}
                onChange={handleNewInputChange}
                required
                className={inputClasses}
              />
              <div className="flex gap-3">
                <input
                  type="password"
                  placeholder="Hasło"
                  name="newPassword"
                  value={newFormData.newPassword}
                  onChange={handleNewInputChange}
                  required
                  className={inputClasses}
                />
                <input
                  type="password"
                  placeholder="Powtórz"
                  name="newConfirmPassword"
                  value={newFormData.newConfirmPassword}
                  onChange={handleNewInputChange}
                  required
                  className={inputClasses}
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Pełne imię"
                  name="newFullName"
                  value={newFormData.newFullName}
                  onChange={handleNewInputChange}
                  className={inputClasses}
                />
                <input
                  type="text"
                  placeholder="Miasto"
                  name="newCity"
                  value={newFormData.newCity}
                  onChange={handleNewInputChange}
                  className={inputClasses}
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl shadow-lg shadow-secondary/30 transition-all font-bold text-lg mt-2">
                {loading ? "Tworzenie..." : "Zarejestruj się"}
              </Button>
            </form>
          </div>
        </div>

        {/* --- OVERLAY SLIDING PANEL (Animacja) --- */}
        <div 
          className={`absolute top-0 right-0 h-full w-1/2 z-50 transition-transform duration-700 ease-in-out ${
            isRegisterActive ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          {/* TŁO BAZOWE */}
          <div className="absolute inset-0 bg-white dark:bg-surface-card" />

          {/* GRADIENT 1: FIOLETOWY (Primary) - Widoczny przy Logowaniu */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-primary to-purple-800 transition-opacity duration-700 ease-in-out ${
              isRegisterActive ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* GRADIENT 2: ZŁOTY/BURSZTYNOWY (Secondary) - Widoczny przy Rejestracji */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-secondary to-orange-600 transition-opacity duration-700 ease-in-out ${
              isRegisterActive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* ZAWARTOŚĆ OVERLAYU */}
          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-white px-12 text-center">
            
            {/* LOGO w Overlayu */}
            <div className="mb-8 p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-xl border border-white/20">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary relative shadow-inner">
                        <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M50 5 L93 28 V72 L50 95 L7 72 V28 Z" />
                            <path d="M50 5 L20 40 L80 40 Z" />
                            <path d="M20 40 L50 85 L80 40" />
                            <path d="M20 40 L7 72" />
                            <path d="M80 40 L93 72" />
                        </svg>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isRegisterActive ? 'bg-primary' : 'bg-secondary'}`}></div>
                    </div>
                    <span className="font-display font-bold text-3xl tracking-tight">
                        KiedyGramy<span className={isRegisterActive ? "text-primary-dark" : "text-secondary"}>.</span>
                    </span>
                </div>
            </div>

            <h2 className="text-4xl font-bold font-display mb-4 drop-shadow-md">
              {isRegisterActive ? "Masz już konto?" : "Nowy gracz?"}
            </h2>
            <p className="mb-10 text-lg text-white/90 font-medium max-w-xs leading-relaxed">
              {isRegisterActive 
                ? "Wróć do karczmy i sprawdź, co nowego u Twojej drużyny." 
                : "Rozpocznij swoją przygodę, twórz gry i umawiaj sesje z przyjaciółmi."}
            </p>
            
            <button
              onClick={() => {
                setIsRegisterActive(!isRegisterActive);
                setError(null);
              }}
              className="px-10 py-3 border-2 border-white rounded-full font-bold text-lg hover:bg-white hover:text-slate-900 transition-all shadow-lg transform hover:scale-105 active:scale-95"
            >
              {isRegisterActive ? "Zaloguj się" : "Załóż konto"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;