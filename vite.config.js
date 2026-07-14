import { defineConfig } from 'vite'

// Sitio estático. `public/` (prototipos, downloads, design-system) se sirve tal cual
// y se copia a dist/ en el build. Ver scripts/prep-prototypes.mjs para regenerarlo.
export default defineConfig({
  server: { port: 5173, open: true },
  build: { outDir: 'dist', emptyOutDir: true },
})
