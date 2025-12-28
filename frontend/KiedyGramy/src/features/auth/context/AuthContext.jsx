// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// Importujemy Twoje funkcje API
import { me, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/auth.ts';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Sprawdzanie sesji przy starcie
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await me(); // Używamy Twojej funkcji me()
        setUser(userData);
      } catch (err) {
        // Użytkownik nie jest zalogowany
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. Wrapper na Logowanie
  const login = async (username, password) => {
    // Najpierw wołamy API (ustawia cookie)
    await apiLogin(username, password);
    
    // Skoro apiLogin zwraca void, musimy ręcznie pobrać dane użytkownika
    // żeby zaktualizować interfejs bez odświeżania strony
    const userData = await me(); 
    setUser(userData);
  };

  // 3. Wrapper na Rejestrację
  const register = async (data) => {
    
    await apiRegister(data);
    
    // Zakładamy, że po rejestracji backend automatycznie loguje (ustawia cookie).
    // Jeśli tak, pobieramy dane usera.
    // Jeśli backend NIE loguje po rejestracji, tutaj trzeba wywołać login() albo przekierować do logowania.
    // Przyjmijmy wariant, że loguje:
    //const userData = await me();
    //setUser(userData);
  };

  // 4. Wrapper na Wylogowanie
  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);