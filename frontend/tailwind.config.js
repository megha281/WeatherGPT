/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Light theme palette: white surfaces, slate text, and a bright blue accent.
        night: { 900: '#F8FAFC', 800: '#F1F5F9', 700: '#E2E8F0', 600: '#CBD5E1', 500: '#94A3B8' },
        signal: { 400: '#7DD3FC', 500: '#0EA5E9', 600: '#0284C7' },
        mist: { 100: '#0F172A', 200: '#1E293B', 300: '#334155', 400: '#475569' },
        risk: { low: '#22C55E', moderate: '#F59E0B', high: '#F97316', severe: '#EF4444' },
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
