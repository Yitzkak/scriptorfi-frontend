/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      animation: {
        wiggle: 'wiggle 0.2s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      colors: {
        'mint-green': '#0FFCBE',
      },
      screens:{
        'xs': '481px',
        'cmd': '769px',
        'lg': '1025',
      }
    },
    
  },
  plugins: [],
}