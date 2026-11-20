import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { primary: "var(--color-primary)", surface: "var(--color-surface)" },
    fontFamily: { sans: ["var(--font-ui)"] } } },
  plugins: [],
} satisfies Config;
