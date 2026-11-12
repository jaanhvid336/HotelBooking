import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
      '/v3/api-docs': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
      '/swagger-ui': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
    },
  },
})
