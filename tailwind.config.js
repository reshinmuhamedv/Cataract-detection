/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        quantum: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
        dark: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'border-glow': 'borderGlow 4s ease-in-out infinite',
        'quantum-spin': 'quantumSpin 8s linear infinite',
      },
      backgroundImage: {
        'quantum-gradient': 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)',
        'quantum-subtle': 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
      },
    },
  },
  plugins: [],
};
