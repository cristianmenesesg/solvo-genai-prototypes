# Platform Design System — catálogo

Catálogo del sistema de diseño de las aplicaciones internas de Solvo (Solvo Global · platform).
Es la fuente para implementarlo en Angular: la épica [[solvo-platform-release-3]] lo consume desde
FSPL-0 (`F0-prework-sistema-diseno-angular.md`).

## Qué hay acá

| Archivo | Qué es |
|---|---|
| `index.html` | El catálogo. Fundamentos (color, tipografía, espaciado, forma, densidad) y cada componente con su marcado al lado. |
| `tokens.css` | El contrato: core + capa platform del brand. **Lo genera `npm run tokens`** desde `shared/design-system/solvo-global/` — no se edita acá. |
| `theme.css` | Pares de estado y tintes que el modo oscuro necesita. |
| `styles.css` | Los componentes. Copia de la hoja de `solvo-platform-ui-release-3`, que es su implementación de referencia. |
| `theme.js` | Fija `data-theme` antes del primer pintado y monta el botón de cambio de tema. |

## Cómo se mantiene

Los valores que muestra la página se leen en vivo del documento con `getComputedStyle`: si el
contrato cambia, el catálogo cambia con él y el modo oscuro muestra los suyos. Los componentes
se declaran en el array `SECTIONS` del propio `index.html`, y de ese mismo marcado salen la demo
y el bloque de código — no hay dos copias que puedan separarse.

Cuando cambie `styles.css` en `solvo-platform-ui-release-3`, copiarlo acá. Cuando cambie el design
system del vault, correr `npm run tokens` en la raíz del sitio.
