import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react';
const puerto = Number(process.env.PORT) || 8080;
export default defineConfig({
  plugins: [react()],
  // host:true atiende IPv4 + IPv6: http://localhost:5173 y http://127.0.0.1:5173.
  server: { host: true, port: 5173 },
  preview: {
    host: '0.0.0.0',
    port: puerto,
    strictPort: true,
    allowedHosts: true,
  },
});
