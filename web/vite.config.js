import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react';
const puerto = Number(process.env.PORT) || 8080;
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: {
    host: '0.0.0.0',
    port: puerto,
    strictPort: true,
    allowedHosts: true,
  },
});