import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const themeVariables = {
  '@background-title': '#fff7f1',
  '@primary-color': '#ff9a3d',
  '@text-color': '#333',
  '@border-radius': '8px',
  '@font-size-base': '14px',
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3333,
    proxy: {
      '/api': {
        target: 'http://localhost:5511',
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: themeVariables,
        javascriptEnabled: true,
      },
    },
  },
})
