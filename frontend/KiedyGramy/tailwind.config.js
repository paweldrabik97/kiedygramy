
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
        // Definition of your brandbook palette
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
          dark: '#0F172A',  // Board Dark (background in dark mode)
          card: '#1E293B',  // Slate-800 (cards in dark mode)
        },
        text: {
          main: '#1E293B',      // Slate-800
          muted: '#64748B',     // Slate-500
          inverse: '#F1F5F9',   // Slate-100 (text in dark mode)
        }
      },
      backgroundImage: {
        'fantasy-flow': 'linear-gradient(to right, #7C3AED, #D946EF, #FBBF24)',
      }
    },
  },
  plugins: [],
}