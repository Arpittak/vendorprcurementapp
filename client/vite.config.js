import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      // Proxy API requests to your local backend
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      '96a55ecfb27f.ngrok-free.app', // Your ngrok URL without protocol
      'localhost',
      '127.0.0.1',
    ],
  }
})