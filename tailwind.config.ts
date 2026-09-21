import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#10241f',
        field: '#f3faf7',
        palm: '#123f2d',
        aqua: '#22c7cc',
        coral: '#e7354f',
        blush: '#fff1f3',
      },
    },
  },
  plugins: [],
} satisfies Config;
