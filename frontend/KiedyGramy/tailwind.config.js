
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        // Definicja Twojej palety z Brandbooka
        primary: {
          DEFAULT: '#7C3AED', // Magic Violet
          hover: '#6D28D9',
          light: '#8B5CF6',
        },
        secondary: {
          DEFAULT: '#FBBF24', // Winner Gold
          dark: '#D97706',
        },
        surface: {
          light: '#F8FAFC', // Slate-50
          dark: '#0F172A',  // Board Dark (Tło w trybie ciemnym)
          card: '#1E293B',  // Slate-800 (Karty w trybie ciemnym)
        },
        text: {
          main: '#1E293B',      // Slate-800
          muted: '#64748B',     // Slate-500
          inverse: '#F1F5F9',   // Slate-100 (Tekst w trybie ciemnym)
        }
      },
      backgroundImage: {
        'fantasy-flow': 'linear-gradient(to right, #7C3AED, #D946EF, #FBBF24)',
      }
    },
  },
  plugins: [],
}