import { defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target:'https://localhost:5500',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
