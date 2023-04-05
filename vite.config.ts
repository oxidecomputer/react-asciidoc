import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      skipDiagnostics: false,
    }),
  ],
  resolve: {
    alias: {
      '~': path.resolve('./src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/asciidoc/index.tsx'),
      name: 'ReactAsciiDoc',
      fileName: 'react-asciidoc',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
