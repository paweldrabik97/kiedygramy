import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // port dev servera Reacta
    proxy: {
      "/api": {
        target: "https://localhost:7088", // <-- wpisz tu dokładny adres HTTPS z Twojego backendu .NET (z konsoli po dotnet run)
        changeOrigin: true,
        secure: false, // bo używasz lokalnego certyfikatu (Kestrel)
      },
    },
  },
})
