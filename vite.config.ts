/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Vendor code changes far less often than app code, so it caches separately.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/motion') || id.includes('framer-motion')) return 'motion'
          if (id.includes('@dnd-kit')) return 'dnd-kit'
          if (id.includes('/react') || id.includes('scheduler')) return 'react'
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
