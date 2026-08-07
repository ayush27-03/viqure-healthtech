import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The client talks to the API via the absolute VITE_APP_API_URL (see src/services/axiosConfig.js),
// so this dev proxy is only a convenience for any relative "/api" requests during development.
export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:5500',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
