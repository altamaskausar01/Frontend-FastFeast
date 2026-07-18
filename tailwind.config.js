/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '360px',
      },
      colors: {
        page: '#0D060A',
        card: '#1A0D12',
        'card-elevated': '#241014',
        'card-highlight': '#321A24',
        'glass-bg': 'rgba(200, 60, 80, 0.04)',
        'glass-border': 'rgba(200, 60, 80, 0.07)',
        'glass-border-hover': 'rgba(200, 60, 80, 0.14)',
        'text-primary': '#FFFFFF',
        'text-secondary': '#C4A8B8',
        'text-muted': '#8A6A78',
        'text-accent': '#D94A5A',
        'rush-low': '#10B981',
        'rush-medium': '#F59E0B',
        'rush-high': '#FF3B3B',
        'success-bg': '#0D2818',
        'warning-bg': '#2A1F00',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        '2xl': '20px',
        '3xl': '24px',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'glow-orange': '0 4px 16px rgba(217, 74, 90, 0.35)',
        'glow-orange-sm': '0 2px 8px rgba(217, 74, 90, 0.25)',
        'glow-red': '0 0 12px rgba(200, 60, 80, 0.3)',
        'glow-red-lg': '0 0 20px rgba(200, 60, 80, 0.2)',
        'glow-red-pulse': '0 0 40px rgba(200, 60, 80, 0.4)',
        'glow-green': '0 0 12px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 12px rgba(245, 158, 11, 0.3)',

        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.4)',
        'cart-bar': '0 -4px 24px rgba(0, 0, 0, 0.4)',
        'token-glow': '0 0 40px rgba(200, 60, 80, 0.5), 0 0 80px rgba(200, 60, 80, 0.2)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%": { transform: "translateY(100vh) rotate(0deg) translateX(0px)", opacity: "0" },
          "10%": { opacity: "0.06" },
          "90%": { opacity: "0.06" },
          "100%": { transform: "translateY(-10vh) rotate(360deg) translateX(var(--drift-x, 20px))", opacity: "0" },
        },
        "float-sway": {
          "0%": { transform: "translateY(110vh) rotate(0deg) translateX(0px)", opacity: "0" },
          "10%": { opacity: "0.05", transform: "translateY(90vh) rotate(30deg) translateX(10px)" },
          "30%": { transform: "translateY(60vh) rotate(100deg) translateX(-20px)" },
          "50%": { transform: "translateY(35vh) rotate(180deg) translateX(15px)" },
          "70%": { transform: "translateY(15vh) rotate(260deg) translateX(-10px)" },
          "90%": { opacity: "0.05", transform: "translateY(2vh) rotate(330deg) translateX(8px)" },
          "100%": { transform: "translateY(-10vh) rotate(360deg) translateX(0px)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(200, 60, 80, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(200, 60, 80, 0.35)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "wine-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(200, 60, 80, 0.2)" },
          "50%": { boxShadow: "0 0 16px rgba(200, 60, 80, 0.5)" },
        },
        "flame-flicker": {
          "0%, 100%": { transform: "scale(1) rotate(-1deg)" },
          "25%": { transform: "scale(1.05) rotate(2deg)" },
          "50%": { transform: "scale(1) rotate(-2deg)" },
          "75%": { transform: "scale(1.03) rotate(1deg)" },
        },
        "orbit": {
          "0%": { transform: "rotate(0deg) translateX(60px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(60px) rotate(-360deg)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "scale-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 1.5s infinite ease-in-out",
        "float": "float 3s infinite ease-in-out",
        "float-slow": "float-slow 20s infinite linear",
        "float-sway": "float-sway 28s infinite ease-in-out",
        "pulse-glow": "pulse-glow 2s infinite ease-in-out",
        "flame-flicker": "flame-flicker 0.8s infinite ease-in-out",
        "orbit": "orbit 3s infinite linear",
        "spin-slow": "spin-slow 8s infinite linear",
        "scale-pulse": "scale-pulse 2s infinite ease-in-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "wine-pulse": "wine-pulse 2s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
