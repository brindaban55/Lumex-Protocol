/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        background: "#07090E",
        surface: {
          DEFAULT: "#0F141F",
          light: "#171F2F",
          border: "#1F2B42",
        },
        primary: {
          DEFAULT: "#00E599", // Stellar cyber emerald green
          dark: "#00B377",
          light: "#33EBAD",
          glow: "rgba(0, 229, 153, 0.25)",
        },
        stellar: {
          blue: "#3E7BFA",
          purple: "#7E57C2",
          gold: "#FFB300",
          cyan: "#00E5FF",
        }
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(0, 229, 153, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(62, 123, 250, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, #1f293d15 1px, transparent 1px), linear-gradient(to bottom, #1f293d15 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
