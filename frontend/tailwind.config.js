/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // OMMAX Corporate Design - Premium Digital Strategy Consultancy
        ommax: {
          // Primary Brand Colors
          red: '#E30613',
          'red-dark': '#B8050F',
          'red-light': '#FF1A27',
          
          // Text Colors
          black: '#000000',
          'dark-gray': '#111111',
          'medium-gray': '#333333',
          'light-gray': '#666666',
          
          // Background Colors
          white: '#FFFFFF',
          'off-white': '#F9F9F9',
          'light-bg': '#F5F5F5',
          'border-gray': '#E0E0E0',
          
          // Accent Colors
          'deep-blue': '#0A1628',
          'navy': '#1A2744',
        },
      },
      fontFamily: {
        // Clean, bold Sans-Serif typography
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        // Sharp edges - minimal border-radius for corporate feel
        'none': '0',
        'sharp': '2px',
        'subtle': '4px',
      },
      boxShadow: {
        // Minimal shadows for clean design
        'sharp': '0 1px 3px rgba(0, 0, 0, 0.08)',
        'sharp-md': '0 2px 6px rgba(0, 0, 0, 0.1)',
        'sharp-lg': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'border': 'inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

