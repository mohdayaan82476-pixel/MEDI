/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand / clinical teal
        brand: {
          DEFAULT: '#0F766E',
          hover: '#0B5A54',
          light: '#E6F2F0',
          50: '#F0F9F8',
          100: '#D9EFEC',
          200: '#B3DFDA',
          300: '#7CC0B8',
          400: '#4A9E94',
          500: '#0F766E',
          600: '#0B5A54',
          700: '#094A45',
          800: '#073B37',
          900: '#052C29',
        },
        // Status colors (used ONLY as indicators)
        status: {
          high: '#DC2626',
          highBg: '#FEF2F2',
          highBorder: '#FECACA',
          low: '#DC2626',
          lowBg: '#FEF2F2',
          lowBorder: '#FECACA',
          conflict: '#DC2626',
          conflictBg: '#FEF2F2',
          conflictBorder: '#FECACA',
          review: '#D97706',
          reviewBg: '#FFFBEB',
          reviewBorder: '#FDE68A',
          normal: '#16A34A',
          normalBg: '#F0FDF4',
          normalBorder: '#BBF7D0',
          verified: '#0F766E',
          verifiedBg: '#E6F2F0',
          verifiedBorder: '#B3DFDA',
          unknown: '#6B7280',
          unknownBg: '#F9FAFB',
          unknownBorder: '#E5E7EB',
        },
        // Neutrals
        ink: {
          DEFAULT: '#111827',
          muted: '#6B7280',
          faint: '#9CA3AF',
        },
        canvas: '#F5F7F7',
        line: '#E5E7EB',
        sidebar: '#111827',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        container: '10px',
        control: '5px',
      },
      fontSize: {
        xxs: ['11px', '16px'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
