import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        card: "#ffffff",
        background: "#f9fafb",
        "muted-foreground": "#6b7280",
      },
    },
  },
  plugins: [],
};

export default config;