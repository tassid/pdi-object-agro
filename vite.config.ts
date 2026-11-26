import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// GitHub Pages: https://tassid.github.io/pdi-object-agro/  (aluno)
//               https://tassid.github.io/pdi-object-agro/professor/  (professor)
export default defineConfig({
  base: '/pdi-object-agro/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { aluno: resolve(import.meta.dirname, 'index.html'), professor: resolve(import.meta.dirname, 'professor/index.html') },
    },
  },
})
