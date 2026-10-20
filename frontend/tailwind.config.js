/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sloth: {
          50: '#f6f9f7',
          100: '#eaf2ec',
          200: '#d5e4d9',
          300: '#b1cfbb',
          400: '#84b294',
          500: '#5f9671',
          600: '#487a58',
          700: '#3a6247',
          800: '#1e3827',
          900: '#14291c',
          950: '#0a160f',
        },
        cream: {
          50: '#fdfcf9',
          100: '#fbf9f4',
          200: '#f5f0e6',
          300: '#ede5d4',
          400: '#ded1ba',
          500: '#cbb99a',
        },
        bark: {
          800: '#2b231d',
          900: '#1f1914',
          950: '#140f0c',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
