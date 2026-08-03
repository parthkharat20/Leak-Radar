export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        hp: {
          primary: "#024ad8",
          "primary-bright": "#296ef9",
          "primary-deep": "#0e3191",
          "primary-soft": "#c9e0fc",
          ink: "#1a1a1a",
          "ink-deep": "#000000",
          "ink-soft": "#292929",
          canvas: "#ffffff",
          cloud: "#f7f7f7",
          fog: "#e8e8e8",
          steel: "#c2c2c2",
          graphite: "#636363",
          charcoal: "#3d3d3d",
          hairline: "#e8e8e8",
          "bloom-coral": "#ff5050",
          "bloom-rose": "#f9d4d2",
          "bloom-deep": "#b3262b",
          "storm-mist": "#8ebdce",
          "storm-sea": "#7fadbe",
          "storm-deep": "#356373",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        'hp-xs': '2px',
        'hp-sm': '3px',
        'hp-md': '4px',
        'hp-lg': '8px',
        'hp-xl': '16px',
      },
      boxShadow: {
        'hp-soft': '0 2px 8px rgba(26, 26, 26, 0.08)',
        'hp-modal': '0 8px 24px rgba(26, 26, 26, 0.12)',
      }
    },
  },
  plugins: [],
}

