/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — Orange
        brand:  '#F5BC6B',
        urgent: '#F07A34',
        // Secondary — Forest Green
        forest: '#263522',
        // Neutrals
        ink:    { primary: '#5C4D42', secondary: '#5C4D42' },
        canvas: { DEFAULT: '#FDF8F0', border: '#F9EDDC', surface: '#FDF8F0' },
        // Semantic badge colors
        cold:   { light: '#E8F4FB' },
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
