import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul Eléctrico y Armónicos
        electric: {
          50: '#F0F6FF',
          100: '#E0EDFF',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0066FF', // Azul Eléctrico Puro
          600: '#0052FF', // Azul Eléctrico Primario Intenso
          700: '#0043D6',
          800: '#0033A8',
          900: '#0A196F',
          950: '#0B132B', // Azul Marino Profundo / Obsidian
        },
        navy: {
          900: '#0B132B',
          950: '#070D1F',
        },
        brand: {
          50: '#F0F6FF',
          100: '#E0EDFF',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0066FF',
          600: '#0052FF',
          700: '#0043D6',
          800: '#0033A8',
          900: '#0B132B',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
        },
        emerald: {
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'electric': '0 10px 25px -3px rgba(0, 82, 255, 0.2), 0 4px 6px -4px rgba(0, 82, 255, 0.1)',
        'electric-sm': '0 4px 14px 0 rgba(0, 82, 255, 0.25)',
        'clean': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
};
export default config;
