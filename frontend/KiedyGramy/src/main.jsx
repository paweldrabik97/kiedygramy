import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./features/auth/contexts/AuthContext.jsx";
import { NotificationsProvider } from "./features/notifications/contexts/NotificationsContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import "./i18n.js";
import App from "./App.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("Client ID:", GOOGLE_CLIENT_ID)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <ThemeProvider>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <App />
            </GoogleOAuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>
);
