import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // port dev servera Reacta
    proxy: {
      "/api": {
        target: "https://localhost:7008", // <-- wpisz tu dokładny adres HTTPS z Twojego backendu .NET (z konsoli po dotnet run) 
        changeOrigin: true,
        secure: false, // bo używasz lokalnego certyfikatu (Kestrel)
      },
      "/notificationHub": { target: "https://localhost:7008", changeOrigin: true, secure: false, ws: true },
      "/chatHub": { target: "https://localhost:7008", changeOrigin: true, secure: false, ws: true }
    },
  },
});
