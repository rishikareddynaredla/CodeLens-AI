/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111111',
          bg: '#F7F5F1',
          bgSecondary: '#EFEAE2',
          text: '#111111',
        },
        secondary: {
          DEFAULT: '#5B5B5B',
          text: '#5B5B5B',
        },
        card: {
          DEFAULT: '#FCFAF7',
        },
        accent: {
          DEFAULT: '#A67C52',
        },
        border: {
          DEFAULT: '#E5DED4',
        },
        success: {
          DEFAULT: '#4E6B57',
        },
        warning: {
          DEFAULT: '#B88A44',
        },
        error: {
          DEFAULT: '#A14C4C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        '4.5': '1.125rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(17, 17, 17, 0.05)',
      }
    },
  },
  plugins: [],
}
