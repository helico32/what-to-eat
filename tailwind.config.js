/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — Orange
        brand:  '#F6C27A',
        urgent: '#F07A34',
        // Secondary — Forest Green
        forest: { DEFAULT: '#3E5A3A', light: '#E7F3E2' },
        // Neutrals
        ink:    { primary: '#2A1E17', secondary: '#6B5D4B' },
        canvas: { DEFAULT: '#FDF8F0', border: '#E8DDCA', surface: '#FFFFFF' },
        // Semantic badge colors
        cold:   { DEFAULT: '#3AA2D8', light: '#E8F4FB' },
        fresh:  { DEFAULT: '#7DBA43', light: '#E7F3E2' },
        days:   { DEFAULT: '#F4A261', light: '#FEF3E8' },
        pantry: { DEFAULT: '#8A6B52', light: '#EAEED3' },
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body:    ['Inter',   'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xs':   '4px',
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '20px',
        'pill': '999px',
      },
      boxShadow: {
        'sm': '0px 1px 2px rgba(0,0,0,0.05)',
        'md': '0px 4px 12px rgba(0,0,0,0.08)',
        'lg': '0px 12px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
