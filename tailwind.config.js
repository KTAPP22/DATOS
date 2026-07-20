/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oled: '#000000',
        'oled-surface': '#09090b',
        'oled-card': '#121215',
        'oled-border': '#27272a',
        'race-purple': '#D946EF',
        'race-purple-light': '#E879F9',
        'race-red': '#FF3344',
        'race-yellow': '#FFCC00',
        'race-cyan': '#00F0FF'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
