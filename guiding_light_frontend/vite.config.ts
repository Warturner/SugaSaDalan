import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: true
    },
    preview: {
      allowedHosts: true // <-- Added this to allow the tunnel in preview mode!
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // The server configuration below was specific to the AI Studio environment and is not needed for local development.
    // Vite's default server settings will be used.
  };
});