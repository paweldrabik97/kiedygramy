// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
// Import your API functions
import { me, login as apiLogin, logout as apiLogout, register as apiRegister, googleLogin as apiGoogleLogin, discordLogin as apiDiscordLogin } from '../services/auth.ts';

const GUEST_TOKEN_KEY   = "kiedygramy_guest_token";
const GUEST_CODE_KEY    = "kiedygramy_guest_code";
const GUEST_NAME_KEY    = "kiedygramy_guest_name";
const GUEST_ID_KEY      = "kiedygramy_guest_id";
const GUEST_SESSION_KEY = "kiedygramy_guest_session_id";

const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
};

const extractGuestId = (token) => {
  const payload = decodeJwtPayload(token);
  const raw = payload['nameid']
    ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    ?? payload['sub'];
  const id = parseInt(raw, 10);
  return Number.isFinite(id) ? id : null;
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await me();
        setUser(userData);
      } catch {
        const guestToken = localStorage.getItem(GUEST_TOKEN_KEY);
        const guestCode  = localStorage.getItem(GUEST_CODE_KEY);
        const guestName  = localStorage.getItem(GUEST_NAME_KEY);
        if (guestToken && guestCode) {
          const guestId        = parseInt(localStorage.getItem(GUEST_ID_KEY) || '', 10) || extractGuestId(guestToken);
          const guestSessionId = parseInt(localStorage.getItem(GUEST_SESSION_KEY) || '', 10) || null;
          setUser({ isGuest: true, id: guestId, guestCode, guestSessionId, username: guestName || guestCode, fullName: guestName || guestCode });
        } else {
          setUser(null);
        }
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
    localStorage.removeItem(GUEST_TOKEN_KEY);
    localStorage.removeItem(GUEST_CODE_KEY);
    localStorage.removeItem(GUEST_NAME_KEY);
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_SESSION_KEY);
    setUser(null);
  };

  // 5. Guest login (no account required)
  const loginAsGuest = (guestResponse, guestName) => {
    const guestId        = extractGuestId(guestResponse.token);
    const guestSessionId = guestResponse.dto?.id ?? null;
    localStorage.setItem(GUEST_TOKEN_KEY,   guestResponse.token);
    localStorage.setItem(GUEST_CODE_KEY,    guestResponse.guestCode);
    localStorage.setItem(GUEST_NAME_KEY,    guestName);
    if (guestId)        localStorage.setItem(GUEST_ID_KEY,      String(guestId));
    if (guestSessionId) localStorage.setItem(GUEST_SESSION_KEY, String(guestSessionId));
    setUser({ isGuest: true, id: guestId, guestCode: guestResponse.guestCode, guestSessionId, username: guestName, fullName: guestName });
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

  const refreshUser = async () => {
    const userData = await me();
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, googleLogin, discordLogin, refreshUser, loginAsGuest }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);