import { defineConfig } from 'vite'

// Sitio estático. `public/` (prototipos, downloads, design-system) se sirve tal cual
// y se copia a dist/ en el build. Ver scripts/prep-prototypes.mjs para regenerarlo.
export default defineConfig({
  // El hub usa hash routing (#/...), así que NO necesita SPA fallback.
  // 'mpa' evita que un path de prototipo faltante (p.ej. durante `npm run sync`)
  // sea reemplazado por el index.html del hub y quede cacheado en el iframe.
  appType: 'mpa',
  server: { port: 5173, open: true },
  build: { outDir: 'dist', emptyOutDir: true },
})
