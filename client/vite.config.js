import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // כל בקשה שמתחילה ב-api/ מועברת לשרת שרץ על פורט 5000.
    // ככה אפשר לכתוב fetch("/api/...") בלי לכתוב את הכתובת המלאה.
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
