/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#1C4532", // Deep forest green
          cream: "#F9F6F0", // Soft cream background
          white: "#FFFFFF",
          neutral: "#4A4A4A", // Subtle dark text
          lightNeutral: "#E5E5E5", // Borders and dividers
          danger: "#D32F2F", // For SOS/Panic
        }
      },
      fontFamily: {
        // We will add custom fonts in a later phase, defaulting to system sans for now
        sans: ['System'],
      }
    },
  },
  plugins: [],
}
