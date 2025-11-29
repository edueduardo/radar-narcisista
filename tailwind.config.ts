import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '375px',  // iPhone SE, pequenos smartphones
      'sm': '640px',  // Smartphones maiores
      'md': '768px',  // Tablets
      'lg': '1024px', // Laptops
      'xl': '1280px', // Desktops
      '2xl': '1536px', // Telas grandes
    },
    extend: {
      colors: {
        // ============================================
        // RADAR NARCISISTA BR - PALETA PREMIUM
        // ============================================
        radar: {
          // Backgrounds (dark mode)
          bg: '#020617',        // slate-950 - fundo principal
          surface: '#0F172A',   // slate-900 - cards
          elevated: '#1E293B',  // slate-800 - elementos elevados
          hover: '#334155',     // slate-700 - hover
          // Accent
          accent: '#7C3AED',    // violet-600 - CTA principal
          'accent-hover': '#6D28D9', // violet-700
          // Text
          'text-primary': '#F9FAFB',   // gray-50
          'text-secondary': '#9CA3AF', // gray-400
          'text-muted': '#6B7280',     // gray-500
        },
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'radar-gradient': 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #1E293B 100%)',
      },
    },
  },
  plugins: [],
}

export default config
