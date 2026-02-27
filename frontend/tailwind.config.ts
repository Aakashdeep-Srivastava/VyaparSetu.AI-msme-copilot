import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1E40AF' },
        secondary: { DEFAULT: '#3B82F6', light: '#60A5FA' },
        accent: { DEFAULT: '#FF6B35', light: '#FF8A5C' },
        chat: { incoming: '#FFFFFF', outgoing: '#DBEAFE', bg: '#EFF6FF' },
        band: { green: '#22C55E', yellow: '#EAB308', red: '#EF4444' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
export default config
