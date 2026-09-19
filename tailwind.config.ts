import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#10201e',
        field: '#f4f7f5',
        palm: '#0f766e',
        coral: '#dc6b4f',
      },
    },
  },
  plugins: [],
} satisfies Config;
