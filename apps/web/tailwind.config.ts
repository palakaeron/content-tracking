import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        canvas: 'hsl(var(--canvas))',
        surface: 'hsl(var(--surface))',
        'surface-alt': 'hsl(var(--surface-alt))',
        ink: 'hsl(var(--ink))',
        'ink-secondary': 'hsl(var(--ink-secondary))',
        muted: 'hsl(var(--muted))',
        line: 'hsl(var(--line))',
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          light: 'hsl(var(--brand-light))',
          dark: 'hsl(var(--brand-dark))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          light: 'hsl(var(--accent-light))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          light: 'hsl(var(--success-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          light: 'hsl(var(--warning-light))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          light: 'hsl(var(--danger-light))',
        },
      },
      borderRadius: {
        '2xl': '16px',
        xl: '12px',
        lg: '10px',
        md: '8px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'elevated': '0 8px 24px -4px rgba(0,0,0,0.08), 0 4px 8px -4px rgba(0,0,0,0.04)',
        'modal': '0 24px 48px -12px rgba(0,0,0,0.18)',
        'glow': '0 0 0 3px hsl(var(--brand) / 0.12)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'heading-lg': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-sm': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],
        'body': ['0.875rem', { lineHeight: '1.25rem' }],
        'caption': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'kpi': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
