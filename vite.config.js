import { defineConfig } from 'vite'

// Sitio estático. `public/` (prototipos, design-system) se sirve tal cual y se copia
// a dist/ en el build; los zips de descarga los genera el hook prebuild (build-zips.mjs).
// Los prototipos viven acá (public/prototypes/); vendor-tokens.mjs solo re-vendoriza el DS.
export default defineConfig({
  // El hub usa hash routing (#/...), así que NO necesita SPA fallback.
  // 'mpa' evita que un path de prototipo faltante sea reemplazado por el
  // index.html del hub y quede cacheado en el iframe.
  appType: 'mpa',
  server: { port: 5173, open: true },
  build: { outDir: 'dist', emptyOutDir: true },
})
