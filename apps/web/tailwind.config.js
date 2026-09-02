/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // High-contrast palette for low-literacy, outdoor/ward-lighting readability.
        brand: {
          DEFAULT: '#0b6bcb',
          dark: '#084a8f',
        },
      },
      keyframes: {
        // Starts zoomed-in and settles to normal size — used for the
        // national welcome page's hero image.
        zoomOut: {
          '0%': { transform: 'scale(1.35)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        // Rises up then settles — staggered per element (via inline
        // animation-delay) reads as a left-to-right/top-to-bottom wave.
        waveIn: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '60%': { transform: 'translateY(-4px)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'zoom-out': 'zoomOut 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'wave-in': 'waveIn 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
