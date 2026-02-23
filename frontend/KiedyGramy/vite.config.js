import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // port dev servera Reacta
    // proxy: {
    //   "/api": {
    //     target: "https://kiedygramy-backend.azurewebsites.net", 
    //     //target: "https://localhost:7008", // lokalny backend .NET
    //     changeOrigin: true,
    //     secure: false, 
    //   },
    //   "/notificationHub": {
    //     target: "https://kiedygramy-backend.azurewebsites.net",
    //     //target: "https://localhost:7008",
    //     changeOrigin: true,
    //     secure: false,
    //     ws: true
    //   },
    //   "/chatHub": {
    //     target: "https://kiedygramy-backend.azurewebsites.net",
    //     //target: "https://localhost:7008",
    //     changeOrigin: true,
    //     secure: false,
    //     ws: true
    //   },
    // },
    
  },
});
