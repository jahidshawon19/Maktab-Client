/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        gradient: {
          from: '#667eea',
          to: '#764ba2',
        }
      },
      backgroundImage: {
        'gradient-auth': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-radial': `
          radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.3) 0%, transparent 40%),
          radial-gradient(circle at 70% 60%, rgba(118, 75, 162, 0.3) 0%, transparent 40%),
          radial-gradient(circle at 50% 80%, rgba(102, 126, 234, 0.2) 0%, transparent 50%)
        `,
      },
    },
  },
  plugins: [],
}
