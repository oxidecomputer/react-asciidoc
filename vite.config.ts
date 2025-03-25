import react from '@vitejs/plugin-react'
import path from 'path'
import x from 'react/jsx-runtime'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/asciidoc/index.tsx'),
      name: 'ReactAsciiDoc',
      fileName: 'react-asciidoc',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'react',
        '@asciidoctor/core',
        'react-dom',
        'html-react-parser',
        'react/jsx-runtime',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})
