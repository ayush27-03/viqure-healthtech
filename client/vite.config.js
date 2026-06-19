import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // defaultPort: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        // Temporary 5000 for backend testing. 
        // Change to 5500 otherwise browser will never know that backend is on localhost:5500
        changeOrigin: true,
        secure: false,
      }
    }
  }
})