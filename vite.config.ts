import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `vite build --mode artifact` gera um único HTML com JS e CSS embutidos,
// no formato exigido para publicar como Artifact no claude.ai.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'artifact' ? [react(), viteSingleFile()] : [react()],
  base: './',
  build: mode === 'artifact' ? { outDir: 'dist-artifact' } : {},
}))
