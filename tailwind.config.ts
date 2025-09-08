import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem',
        '2xl': '3.5rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
      },
      lineHeight: {
        tight: 'var(--line-height-tight)',
        snug: 'var(--line-height-snug)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
        loose: 'var(--line-height-loose)',
      },
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          '50': 'hsl(215, 100%, 97%)',
          '100': 'hsl(215, 100%, 92%)',
          '200': 'hsl(215, 95%, 85%)',
          '300': 'hsl(215, 95%, 70%)',
          '400': 'hsl(215, 95%, 50%)',
          '500': 'hsl(215, 95%, 40%)',
          '600': 'hsl(215, 95%, 30%)',
          '700': 'hsl(215, 95%, 25%)',
          '800': 'hsl(215, 95%, 20%)',
          '900': 'hsl(215, 95%, 15%)',
          '950': 'hsl(215, 95%, 10%)',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          '50': 'hsl(226, 100%, 97%)',
          '100': 'hsl(226, 100%, 92%)',
          '200': 'hsl(226, 95%, 85%)',
          '300': 'hsl(226, 95%, 70%)',
          '400': 'hsl(226, 95%, 50%)',
          '500': 'hsl(226, 95%, 40%)',
          '600': 'hsl(226, 95%, 30%)',
          '700': 'hsl(226, 95%, 25%)',
          '800': 'hsl(226, 95%, 20%)',
          '900': 'hsl(226, 95%, 15%)',
          '950': 'hsl(226, 95%, 10%)',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          foreground: 'hsl(var(--gold-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        purple: {
          '50': 'hsl(270, 100%, 97%)',
          '100': 'hsl(270, 100%, 92%)',
          '200': 'hsl(270, 95%, 85%)',
          '300': 'hsl(270, 95%, 70%)',
          '400': 'hsl(270, 95%, 50%)',
          '500': 'hsl(270, 95%, 40%)',
          '600': 'hsl(270, 95%, 30%)',
          '700': 'hsl(270, 95%, 25%)',
          '800': 'hsl(270, 95%, 20%)',
          '900': 'hsl(270, 95%, 15%)',
          '950': 'hsl(270, 95%, 10%)',
        },
      },
      borderColor: {
        DEFAULT: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'bell-ring': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(15deg)',
          },
          '50%': {
            transform: 'rotate(-15deg)',
          },
          '75%': {
            transform: 'rotate(5deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
        'fade-in': {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        'slide-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'scale-in': {
          from: {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'float-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(50px, -50px) scale(1.1)' },
          '50%': { transform: 'translate(-30px, 30px) scale(0.9)' },
          '75%': { transform: 'translate(30px, 50px) scale(1.05)' }
        },
        'float-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(-40px, 40px) scale(0.95)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.1)' },
          '75%': { transform: 'translate(-20px, -40px) scale(0.9)' }
        },
        'float-3': {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '33%': { transform: 'translate(calc(-50% + 30px), calc(-50% + 20px)) scale(1.05)' },
          '66%': { transform: 'translate(calc(-50% - 25px), calc(-50% - 30px)) scale(0.95)' }
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'bell-ring': 'bell-ring 0.5s ease-in-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'float-1': 'float-1 25s infinite ease-in-out',
        'float-2': 'float-2 30s infinite ease-in-out',
        'float-3': 'float-3 35s infinite ease-in-out',
      },
      maxWidth: {
        'screen-xl': '1280px',
        'screen-2xl': '1400px',
        'screen-3xl': '1600px',
      },
      aspectRatio: {
        document: '1/1.4',
        card: '1.58/1',
        '16/9': '16/9',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern':
          'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
      },
      boxShadow: {
        low: 'var(--shadow-elevation-low)',
        medium: 'var(--shadow-elevation-medium)',
        high: 'var(--shadow-elevation-high)',
        modal: 'var(--shadow-elevation-modal)',
        interactive: 'var(--shadow-interactive-rest)',
        'interactive-hover': 'var(--shadow-interactive-hover)',
        'interactive-active': 'var(--shadow-interactive-active)',
        'blue-sm':
          '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        'blue-md':
          '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
        'blue-lg':
          '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
