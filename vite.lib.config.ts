import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true, tsconfigPath: './tsconfig.json' })],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/lib.tsx', import.meta.url)),
      name: 'Kukul',
      fileName: 'kukul',
      formats: ['es', 'cjs'],
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'framer-motion': 'framerMotion',
          'lucide-react': 'lucideReact',
        },
      },
    },
  },
})