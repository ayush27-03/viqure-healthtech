import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // defaultPort: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5500',
        // Browser will never know that backend is on localhost:5500
        changeOrigin: true,
        secure: false,
      }
    }
  }
})