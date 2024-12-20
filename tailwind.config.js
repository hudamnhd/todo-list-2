/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "collapsible-down": {
          from: { height: 0 },
          to: { height: 200 },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height -100)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-collapsible-content-height -100)" },
          to: { height: 0 },
        },
        rocket: {
          "0%": {
            transform: "translateY(0) scale(1) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-200px) scale(1.2) rotate(-5deg)",
          },
          "100%": {
            transform: "translateY(-500px) scale(1.5) rotate(0deg)",
          },
        },
        "roll-reveal": {
          from: {
            transform: "rotate(12deg) scale(0)",
            opacity: "0",
          },
          to: {
            transform: "rotate(0deg) scale(1)",
            opacity: "1",
          },
        },
        "slide-left": {
          from: {
            transform: "translateX(20px)",
            opacity: "0",
          },
          to: {
            transform: "translateX(0px)",
            opacity: "1",
          },
        },
        "slide-top": {
          from: {
            transform: "translateY(20px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0px)",
            opacity: "1",
          },
        },
        "slide-bottom": {
          from: {
            transform: "translateY(-20px)",
            opacity: "0",
          },
          to: {
            transform: "translateY(0px)",
            opacity: "1",
          },
        },
      },
      animation: {
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
        rocket: "rocket 3s ease-in-out infinite",
        "roll-reveal": "roll-reveal 0.4s cubic-bezier(.22,1.28,.54,.99)",
        "slide-left": "slide-left 0.3s ease-out",
        "slide-top": "slide-top 0.3s ease-out",
        "slide-bottom": "slide-bottom 0.3s ease-out",
        "accordion-down": "accordion-down 0.4s ease-out",
        "accordion-up": "accordion-up 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
