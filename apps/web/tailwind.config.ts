import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0F19',
          card: '#161F30',
          accent: '#6366F1',
          success: '#34D399',
          warning: '#FBBF24',
          danger: '#F87171',
        },
        zinc: {
          450: '#898990',
          505: '#606067',
          550: '#5c5c63',
          555: '#58585f',
          705: '#333338',
          850: '#202023',
          855: '#1c1c1f',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
