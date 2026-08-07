import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutros estructurales: fondos, bordes y texto.
        gris: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          400: '#A1A1AA',
          600: '#52525B',
          900: '#18181B',
        },
        // Acento único: acciones primarias y estado activo. Nada más.
        acento: {
          DEFAULT: '#1B3FCC',
          hover: '#1734A8',
          tenue: '#EEF1FE',
        },
        // Semáforo de presupuesto: <70% · 70-100% · >100%
        rango: { DEFAULT: '#15803D', bg: '#DCFCE7' },
        limite: { DEFAULT: '#B45309', bg: '#FEF3C7' },
        excedido: { DEFAULT: '#B91C1C', bg: '#FEE2E2' },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        cifra: ['2.25rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      spacing: {
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-t': 'env(safe-area-inset-top)',
      },
      borderRadius: {
        tarjeta: '14px',
      },
      boxShadow: {
        fab: '0 6px 16px rgba(27, 63, 204, 0.35)',
        hoja: '0 -8px 30px rgba(24, 24, 27, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
