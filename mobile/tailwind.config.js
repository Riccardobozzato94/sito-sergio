/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#d4a574',
        'primary-light': '#e2be96',
        bg: '#0e0e0e',
        'bg-card': '#161616',
        border: '#2a2725',
        'text-main': '#f0ece6',
        'text-muted': '#a8a39e',
        'text-dim': '#7a7570',
        'text-faint': '#5a5650',
      },
      fontFamily: {
        heading: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
