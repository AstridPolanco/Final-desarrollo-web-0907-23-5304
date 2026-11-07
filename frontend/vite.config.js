import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API = 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': API,
      '/equipos': API,
      '/incidencias': API,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
