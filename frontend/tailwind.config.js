/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: '#fce7f3',
          bgDark: '#0e111a',
          card: '#ffffff',
          cream: '#fffdf5',
          border: '#181824',
          pink: '#f472b6',
          pinkLight: '#fbcfe8',
          yellow: '#fef08a',
          yellowDark: '#facc15',
          purple: '#d8b4fe',
          purpleDark: '#a855f7',
          cyan: '#7dd3fc',
          cyanDark: '#0284c7',
          green: '#86efac',
          greenDark: '#22c55e',
          orange: '#fdba74',
          gray: '#f1f5f9',
          dark: '#181824',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        silk: ['"Silkscreen"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'pixel': '3px 3px 0px #181824',
        'pixel-sm': '2px 2px 0px #181824',
        'pixel-lg': '5px 5px 0px #181824',
        'pixel-active': '0px 0px 0px #181824',
      }
    },
  },
  plugins: [],
}
