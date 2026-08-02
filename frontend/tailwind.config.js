/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-hover': 'var(--surface-hover)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        brand: {
          DEFAULT: 'var(--brand)',
          2: 'var(--brand-2)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      boxShadow: {
        glow: '0 0 30px -8px var(--brand-glow)',
        card: '0 1px 2px rgba(0,0,0,0.2), 0 8px 24px -12px rgba(0,0,0,0.4)',
        'card-hover': '0 1px 2px rgba(0,0,0,0.2), 0 18px 40px -12px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
