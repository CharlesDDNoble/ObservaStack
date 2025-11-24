/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Base layout colors
        background: '#111217',
        panel: '#181B1F',
        
        // Border and input colors
        border: '#2c2f32',
        input: '#2c2f32',
        ring: '#3274D9',
        
        // Semantic colors
        success: '#87A87E',
        warning: '#C4B86B',
        error: '#B87278',
        info: '#5B8FC4',
        alert: '#C4976B',
        
        // Text colors
        'text-primary': '#D8D9DA',
        'text-secondary': '#9FA2A5',
        'text-muted': '#6E7378',
        
        // shadcn/ui CSS variable support
        foreground: 'hsl(210 40% 98%)',
        card: {
          DEFAULT: '#181B1F',
          foreground: 'hsl(210 40% 98%)',
        },
        popover: {
          DEFAULT: '#181B1F',
          foreground: 'hsl(210 40% 98%)',
        },
        primary: {
          DEFAULT: '#5B8FC4',
          foreground: 'hsl(0 0% 100%)',
        },
        secondary: {
          DEFAULT: '#2c2f32',
          foreground: 'hsl(210 40% 98%)',
        },
        muted: {
          DEFAULT: '#2c2f32',
          foreground: '#9FA2A5',
        },
        accent: {
          DEFAULT: '#2c2f32',
          foreground: 'hsl(210 40% 98%)',
        },
        destructive: {
          DEFAULT: '#B87278',
          foreground: 'hsl(0 0% 100%)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
