import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the client-side Gemini service
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Define global for libraries that expect it
      global: 'window',
    },
    server: {
      port: 1234,
      host: true,
    }
  };
});