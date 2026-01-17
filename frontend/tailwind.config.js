/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00d4ff',
        'neon-blue': '#0066ff',
        'neon-green': '#00ff88',
        'neon-magenta': '#ff00ff',
        'neon-red': '#ff3366',
        'neon-yellow': '#ffff00',
        'dark-bg': '#0a0a0f',
        'dark-surface': '#12121a',
      },
      fontFamily: {
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Cascadia Code',
          'SF Mono',
          'Consolas',
          'monospace'
        ],
      },
      boxShadow: {
        'neon': '0 0 5px #00d4ff, 0 0 10px #00d4ff, 0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-green': '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 20px rgba(0, 255, 136, 0.3)',
        'neon-magenta': '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px rgba(255, 0, 255, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}