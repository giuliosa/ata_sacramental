import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        brand: {
          50:  '#f0f4fe',
          100: '#dde6fc',
          200: '#c2d3fa',
          300: '#98b5f6',
          400: '#678df0',
          500: '#4267e8',
          600: '#2d4add',
          700: '#2538c3',
          800: '#24309e',
          900: '#232e7d',
          950: '#181e4d',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
}

export default config
