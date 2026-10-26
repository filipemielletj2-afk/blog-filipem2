/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          DEFAULT: '#DC2626', // Classic Filipem2 Red
          dark: '#991B1B',
          glow: '#EF4444'
        },
        dark: {
          950: '#070709',
          900: '#0C0D10',
          850: '#111217',
          800: '#171922',
          700: '#232634',
          600: '#32374A',
          500: '#525B75',
          400: '#8892B0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(220, 38, 38, 0.45)',
        'neon-hover': '0 0 25px 0px rgba(220, 38, 38, 0.65)'
      }
    },
  },
  plugins: [],
}
