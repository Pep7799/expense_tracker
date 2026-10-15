import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// strictPort keeps the app on 5173. Your FastAPI CORS list allows
// http://localhost:5173, so if Vite silently moved to 5174 every
// request would be blocked.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
