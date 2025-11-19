/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '376px', // Medium Phones
        sm: '481px', // Large Phones / Phablet
        smd: '590px', // Custom breakpoint
        md: '671px', // Tablet portrait
        spmd: '729px', // Custom breakpoint
        lg: '901px', // Tablet landscape
        xl: '1025px', // Laptop
        '2xl': '1201px', // Laptop & Desktop small
        '3xl': '1441px', // Desktop large / Wide screens
        '4xl': '1601px', // Desktop Full HD+
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
      },
      colors: {
        'pink-cl': {
          DEFAULT: 'var(--vcn-pink-cl)',
        },
        'pink-hover-cl': {
          DEFAULT: 'var(--vcn-pink-hover-cl)',
        },
        'light-pink-cl': {
          DEFAULT: 'var(--vcn-light-pink-cl)',
        },
        'superlight-pink-cl': {
          DEFAULT: 'var(--vcn-superlight-pink-cl)',
        },
        'dark-pink-cl': {
          DEFAULT: 'var(--vcn-dark-pink-cl)',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'var(--vcn-pink-cl)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
        },
        border: 'hsl(var(--border))',
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 2s infinite linear',
        'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-slow': 'bounce-slow 1.5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
