import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7fb',
          100: '#eceff7',
          200: '#d5daea',
          300: '#b0b8d2',
          400: '#7f8ba9',
          500: '#5a6787',
          600: '#414d68',
          700: '#313a50',
          800: '#222936',
          900: '#11151d'
        },
        sand: '#f3efe2',
        coral: '#ff7a59',
        mint: '#59d4a9',
        gold: '#f6c453'
      },
      boxShadow: {
        soft: '0 20px 50px rgba(17, 21, 29, 0.12)',
        lift: '0 10px 30px rgba(17, 21, 29, 0.16)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
        'hero-glow': 'linear-gradient(135deg, rgba(255, 122, 89, 0.28), rgba(89, 212, 169, 0.18), rgba(246, 196, 83, 0.2))'
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif']
      },
      borderRadius: {
        '3xl': '1.75rem'
      }
    }
  },
  plugins: []
};

export default config;
