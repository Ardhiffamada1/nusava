import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#FAFAFA',
        muted: '#F4F4F5',
        border: '#E4E4E7',
        ink: {
          DEFAULT: '#09090B',
          secondary: '#71717A',
          tertiary: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
