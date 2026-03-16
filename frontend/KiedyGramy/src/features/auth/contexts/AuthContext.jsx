// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// Import your API functions
import { me, login as apiLogin, logout as apiLogout, register as apiRegister, googleLogin as apiGoogleLogin, discordLogin as apiDiscordLogin } from '../services/auth.ts';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await me(); // Use your me() function
        setUser(userData);
      } catch (err) {
        // User is not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // 2. Login wrapper
  const login = async (username, password) => {
    // First call API (sets cookie)
    await apiLogin(username, password);
    
    // Since apiLogin returns void, fetch user data manually
    // to update the UI without refreshing the page
    const userData = await me(); 
    setUser(userData);
  };

  // 3. Registration wrapper
  const register = async (data) => {
    
    await apiRegister(data);
    
    // Assume backend auto-logs in after registration (sets cookie).
    // If yes, fetch user data.
    // If backend does NOT log in after registration, call login() here or redirect to login.
    // Assuming it logs in:
    //const userData = await me();
    //setUser(userData);
  };

  // 4. Logout wrapper
  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  // 5. Google Login wrapper
  const googleLogin = async (credential) => {
    await apiGoogleLogin(credential);
    
    // After Google login, fetch user data to update UI
    const userData = await me();
    setUser(userData);
  }

  const discordLogin = async (code, language) => {
    await apiDiscordLogin(code, language);
    const userData = await me();
    setUser(userData);
};

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, googleLogin, discordLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);