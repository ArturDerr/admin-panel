/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#eef1f4",
          panel: "#ffffff",
          sidebar: "#2f3542",
          card: "#ffffff",
          border: "#d9dde3",
          text: "#2b2f36",
          muted: "#98a1ac",
          accent: "#2f80ed",
          accentSoft: "#d9dde3",
          success: "#7ed957",
          warning: "#f59e0b",
        },
      },
      boxShadow: {
        panel: "0 6px 14px rgba(31, 35, 43, 0.08)",
      },
      borderRadius: {
        none: "0",
      },
    },
  },
  plugins: [],
};
