import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const themeVariables = {
  '@background-title': '#f3f4f6',
  '@primary-color': '#6698ff',
  '@text-color': '#333',
  '@border-radius': '4px',
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
        modifyVars: { '@primary-color': '#1DA57A', ...themeVariables },
        javascriptEnabled: true,
      },
    },
  },
})
