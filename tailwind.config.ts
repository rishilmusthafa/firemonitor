import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        alert: "var(--alert)",
        alertBackground: "var(--alertBackground)",
        maintenance: "var(--maintenance)",
        textPrimary: "var(--textPrimary)",
        textSecondary: "var(--textSecondary)",
      },
    },
  },
  plugins: [],
};

export default config; 