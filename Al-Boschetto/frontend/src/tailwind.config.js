module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-green': '#228B22',
        'brand-green-hover': '#1e791e',
        'brand-cream': '#F5F5DC',
        'brand-wood': '#8B5A2B',
      },
      fontFamily: {
        'serif': ['Cormorant Garamond', 'serif'],
        'sans': ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgb(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
