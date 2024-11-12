import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/asciidoc/index.tsx'),
      name: 'ReactAsciiDoc',
      fileName: 'react-asciidoc',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', '@asciidoctor/core', 'react-dom', 'html-react-parser'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
})
