
/*FOR FRONTEND DEVELOPER:*/
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_APP_API_URL,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})

/* FOR PRODUCTION:

import { defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {

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

*/