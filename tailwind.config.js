/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        loginLeft: {
          200: "#E5E5E5"
        },
        authContainer: {
          200: "#F1F7FF"
        },
        'violet-gray-900': 'var(--VioletGray-900, #403A44)',
        'violet-gray-800': 'var(--VioletGray-800, #4E4852)',
        'bunker-neutrals-100': 'var(--Bunker-Neutrals-100, #DCDDDD)',
        'white-custom': 'var(--White, #FFF)',
        downloadButton:{
          200: '#4568DC'
        },
      },
      fontFamily: {
        archivo: ['Archivo', 'sans-serif'],
      },
      fontSize: {
        '14px': '14px',
        '28px': '28px',
        'custom-18': ['18px', {
          lineHeight: '24px',
        }],
      },
      lineHeight: {
        '32px': '32px',
        'custom-24': '24px',
      },
      fontWeight: {
        '400': '400',
        '700': '700',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
