/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Instrument-panel palette: night-sky navies with one signal colour.
        night: { 900: '#061320', 800: '#0A1D2B', 700: '#0F2836', 600: '#163545', 500: '#1E4456' },
        signal: { 400: '#5AD7FB', 500: '#2FC2F0', 600: '#149BC6' },
        mist: { 100: '#EAF4F8', 200: '#C7DCE6', 300: '#9BB8C7', 400: '#7092A5' },
        risk: { low: '#49CFA1', moderate: '#F2B544', high: '#F07E3C', severe: '#E85A5A' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Segoe UI', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans"', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.05) inset, 0 18px 40px -24px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        horizon: 'radial-gradient(120% 90% at 50% 0%, #17475C 0%, #0B2131 45%, #061320 100%)',
      },
      keyframes: {
        rise: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'none' } },
        pulseDot: { '0%,100%': { opacity: '0.35' }, '50%': { opacity: '1' } },
      },
      animation: {
        rise: 'rise .45s cubic-bezier(.2,.7,.3,1) both',
        'pulse-dot': 'pulseDot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
