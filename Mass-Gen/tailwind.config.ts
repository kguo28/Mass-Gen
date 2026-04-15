import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      colors: {
        'green-deep': '#0a4a35',
        'green-mid': '#1D9E75',
        'green-light': '#5DCAA5',
        'green-pale': '#E1F5EE',
        'green-bg': '#f0faf6',
        'amber-ban': '#BA7517',
        'amber-pale': '#FAEEDA',
        'red-pale': '#FCEBEB',
        'red-mid': '#A32D2D',
        'purple-pale': '#EEEDFE',
        'purple-mid': '#534AB7',
        'blue-pale': '#E6F1FB',
        'blue-mid': '#185FA5',
        'gray-50-ban': '#f8f7f4',
        'gray-100-ban': '#f0ede8',
        'gray-200-ban': '#ddd9d2',
        'gray-400-ban': '#9e9a93',
        'gray-600-ban': '#5f5c56',
        'gray-900-ban': '#1a1916',
      },
    },
  },
  plugins: [],
}

export default config
