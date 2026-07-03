<<<<<<< HEAD
import { defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  // const env = loadEnv(mode, process.cwd(), '')
=======

/*FOR FRONTEND DEVELOPER:*/
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
<<<<<<< HEAD
          target:'https://localhost:5500',
=======
          target: env.VITE_APP_API_URL,
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
<<<<<<< HEAD
=======

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
>>>>>>> 822752b7f6ce15391a7c9e430cc1f6f92ff3e450
