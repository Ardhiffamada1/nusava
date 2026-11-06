import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F4F6',
        card: '#FFFFFF',
        sidebar: '#FAFAFC',
        border: {
          DEFAULT: '#E5E7EB',
          subtle: '#F0F1F3',
        },
        ink: {
          DEFAULT: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
        primary: {
          DEFAULT: '#111827',
          hover: '#1F2937',
        },
        brand: {
          DEFAULT: '#6366F1',
          light: '#EEF2FF',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
