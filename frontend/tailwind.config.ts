import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FAF8F5",
          surface: "#FFFFFF",
          subtle: "#F3EFEA",
          border: "#E6E1D8",
        },
        ink: {
          DEFAULT: "#1C1917",
          muted: "#57534E",
          subtle: "#A8A29E",
        },
        brand: {
          DEFAULT: "#1E3A2F",
          hover: "#152921",
          soft: "#EBF2EE",
        },
        accent: {
          DEFAULT: "#C85A32",
          soft: "#FCEEE9",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(28, 25, 23, 0.06), 0 1px 2px -1px rgba(28, 25, 23, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;