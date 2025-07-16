/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          700: '#374151',
          800: '#1f2937',
        }
      },
      animation: {
        'gradient-slow': 'gradient 8s ease infinite',
        'text': 'text 5s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        text: {
          '0%, 100%': {
            'background-size': '200% auto',
            'background-position': '0% center'
          },
          '50%': {
            'background-size': '200% auto',
            'background-position': '100% center'
          },
        }
      }
    },
  },
  plugins: [],
}
