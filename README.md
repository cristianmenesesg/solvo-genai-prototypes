# Solvo GenAI · Prototipos

Sitio showcase que centraliza los prototipos HTML **por producto**, con **design system swappable por producto** (definido en código, no desde el front), **dark mode** en las apps y **descarga de zip** por prototipo. Deployable a Vercel (Vite / estático).

## Comandos

```bash
npm install
npm run sync     # sincroniza public/ desde el vault softgic (prototipos + design-system + zips)
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # sirve dist/
```

> `npm run sync` **lee del vault softgic** (`../../prototipos` y `../../shared/design-system`) — solo corre dentro del workspace. Su salida (`public/prototypes`, `public/downloads`, `public/design-system`) **se commitea** a este repo, para que Vercel solo corra `vite build`. El sync es **in-place** (sobrescribe y poda, no borra carpetas): así el dev server ve los cambios en caliente sin reiniciar.

## Arquitectura

- [`src/catalog.js`](src/catalog.js) — **manifiesto, fuente de verdad**: `products[] → prototipos[] → versions[]`. Define nombre, bundle de origen, pestañas de versión, notas y el `designSystem` del producto.
- [`src/main.js`](src/main.js) + [`src/chrome.css`](src/chrome.css) — hub SPA (hash routing): cards por producto, visor iframe, tabs de versión, botón de descarga. El chrome consume el contrato de tokens.
- [`src/theme/contract.css`](src/theme/contract.css) — normaliza el contrato entre brands (fallbacks para los tokens que solo define solvo-genai).
- [`scripts/prep-prototypes.mjs`](scripts/prep-prototypes.mjs) — copia cada bundle del vault a `public/prototypes/`, escribe el `tokens.css` del bundle (contract + brand del producto), arregla rutas de tokens/logos.
- [`scripts/build-zips.mjs`](scripts/build-zips.mjs) — un zip por prototipo (+ README de cómo abrirlo) en `public/downloads/`.
- `vite.config.js` — `appType: 'mpa'`: sin SPA-fallback, un path inexistente da 404 real (nunca el hub dentro del iframe).

## Cómo cambiar el design system de un producto

1. Editar `designSystem` del producto en `src/catalog.js` (`'solvo-global' | 'solvo-genai' | 'softgic'`).
2. `npm run sync` — regenera el `tokens.css` de cada bundle de ese producto con el brand nuevo.
3. Commit + push → deploy.

No hay switcher en el front (decisión de producto): el brand se define solo acá.

## Cómo están theminizadas las apps (Platform UI / Recruiter)

Fuente canónica: `<vault>/prototipos/solvo-platform-ui/` y `<vault>/prototipos/solvo-recruiter-platform-app/`. Cada página carga, en este orden:

```html
<link rel="stylesheet" href="tokens.css" />   <!-- tokens del brand (lo escribe prep según designSystem) -->
<link rel="stylesheet" href="theme.css" />    <!-- tokens de estado (--status-*), --focus-ring y [data-theme='dark'] -->
<link rel="stylesheet" href="styles.css">     <!-- estilos de la app; su :root es un BRIDGE a los tokens -->
<script src="theme.js"></script>              <!-- anti-flash + toggle flotante claro/oscuro (localStorage) -->
```

- **Bridge**: el `:root` de `styles.css` mapea las variables históricas de la app (`--bg-primary`, `--accent-primary`, `--spacing-*`, …) a los tokens del DS (`--bg-body`, `--color-primary`, `--space-*`, …). Los componentes no cambiaron de nombres; heredan la marca y responden a `[data-theme]`.
- **Dark mode**: `theme.css` overridea superficies/texto/bordes y tints semánticos en `[data-theme='dark']`, conservando los hues de marca. Claro por defecto.
- Ambas apps comparten `styles.css` idéntico — si editás uno, copialo al otro bundle.

## Cómo refactorizar / agregar un prototipo

1. Editar o crear el bundle en `<vault>/prototipos/<bundle>/` (fuente canónica; el sitio solo sincroniza).
2. Reglas para que el theming funcione:
   - Consumir tokens del DS (`--color-*`, `--bg-*`, `--text-*`, `--radius-*`, `--shadow-*`); estados con `--status-*-bg/-fg` (definidos en `theme.css`).
   - **No hardcodear hex** de colores de estado ni de marca.
   - Linkear `tokens.css` local (prep lo escribe/reescribe con el brand del producto).
3. Registrarlo/ajustarlo en `src/catalog.js` (bundle, versiones, notas).
4. `npm run sync` → verificar en `npm run dev` → commit en ambos repos (vault y sitio).

## Deploy (Vercel) y submódulo

1. Crear el repo remoto de este sitio y hacer push (`git remote add origin <url> && git push -u origin main`).
2. Importar en Vercel — framework **Vite**, build `npm run build`, output `dist` (el CSP va en `vercel.json`).
3. Registrar como submódulo en el vault: `git submodule add <url> websites/solvo-genai-prototypes`.

Ciclo: editar prototipos en el vault → `npm run sync` → commit/push del sitio (deploy) → bump del puntero del submódulo en softgic.
