/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0D14',
        sidebar: '#10131D',
        card: {
          DEFAULT: '#171B27',
          elevated: '#1C2130',
          hover: '#1F2536',
        },
        border: {
          DEFAULT: '#292F40',
          muted: '#1F2433',
          light: '#363E54',
        },
        text: {
          primary: '#F3F5FA',
          secondary: '#9299AD',
          muted: '#687187',
        },
        accent: {
          violet: '#8B7CFF',
          violetHover: '#7968FA',
          cyan: '#55D9E8',
          mint: '#5DE2B1',
          amber: '#FFBE69',
          coral: '#FF6B78',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
