/** React/Vite development and preview configuration; deployment settings live in netlify.toml. */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Fail on an occupied port so the printed URL cannot silently change between runs.
  server: { port: 5173, strictPort: true },
  // Preview serves the production dist/ build; it does not deploy the site.
  preview: { port: 4173, strictPort: true },
});
