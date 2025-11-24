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
        // shadcn/ui standard colors
        background: '#111217',
        foreground: '#D8D9DA',
        
        card: {
          DEFAULT: '#181B1F',
          foreground: '#D8D9DA',
        },
        
        popover: {
          DEFAULT: '#181B1F',
          foreground: '#D8D9DA',
        },
        
        primary: {
          DEFAULT: '#5B8FC4',
          foreground: '#ffffff',
        },
        
        secondary: {
          DEFAULT: '#2c2f32',
          foreground: '#D8D9DA',
        },
        
        muted: {
          DEFAULT: '#2c2f32',
          foreground: '#9FA2A5',
        },
        
        accent: {
          DEFAULT: '#2c2f32',
          foreground: '#D8D9DA',
        },
        
        destructive: {
          DEFAULT: '#B87278',
          foreground: '#ffffff',
        },
        
        // Border and input (shadcn standard)
        border: '#2c2f32',
        input: '#2c2f32',
        ring: '#3274D9',
        
        // Custom semantic colors (app-specific)
        success: {
          DEFAULT: '#87A87E',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#C4B86B',
          foreground: '#1a1a1a',
        },
        info: {
          DEFAULT: '#5B8FC4',
          foreground: '#ffffff',
        },
        alert: {
          DEFAULT: '#C4976B',
          foreground: '#1a1a1a',
        },
        
        // Chart colors for data visualization
        chart: {
          primary: '#5B8FC4',
          success: '#87A87E',
          warning: '#C4B86B',
          error: '#B87278',
          purple: '#9B7EBF',
          cyan: '#7EB8BF',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
