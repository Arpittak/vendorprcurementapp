import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request that starts with "/api" will be forwarded
      '/api': {
        target: 'http://localhost:5001', // Update to your current backend port
        changeOrigin: true,
      },
    },
    // Update with your current ngrok URL
    allowedHosts: [
      '1116e39ab0a8.ngrok-free.app', // Your current ngrok URL
      'localhost',
      '127.0.0.1',
    ],
  }
})