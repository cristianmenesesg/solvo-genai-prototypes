# Platform UI — Fase 1 (prototipo)

Prototipo navegable de Solvo Sales Platform con el alcance de **FSPL-1 · Habilitación Solvo Platform Prospect Engine Modular Fase-1**. Es la plataforma de Release 3 (`solvo-platform-ui-release-3`) con la configuración reemplazada por los catálogos del motor modular: Positions & terms, Geography y Decision-maker roles. El alcance futuro completo (Fase 2: triggers, prompts por país, envíos programados, solicitudes, actividad del motor, fuentes y estados de las entidades) es `solvo-platform-ui-release-4`.

HTML + CSS + JS sin build ni servidor: se abre `index.html`, se elige un usuario demo por rol y todo corre en memoria y `localStorage`.

## Qué contiene

- **Dashboard, Open Positions, detalle de vacante, Companies, detalle de empresa y Users**: iguales a Release 3, con el filtro de país (United States / Spain) en Open Positions y Companies, el filtro *US states*, el país en los formularios de edición de empresa y vacante, y la exportación.
- **Settings** (solo Administrator), con menú lateral:
  - *Prospect engine* → **Positions & terms**: catálogo de posiciones con interruptor de activa, título, áreas, países con su cantidad de términos (`ES · 4`) y total; filtro por país, búsqueda por título o término y paginación. El modal de alta/edición tiene título, activa, áreas y los términos agrupados por país en acordeón (agregar y quitar). Un término no se repite dentro de un país y el error nombra la posición que lo tiene. Borrar una posición pide confirmación y borra sus términos. Los países disponibles son los del catálogo de Geography.
  - *Prospect engine* → **Geography**: lista de países (divisiones activas sobre el total, ciudades activas sobre el total, idioma, zona horaria) con alta, edición y baja (código ISO, nombre, nombre de la división, uso venta/contratación, idioma, moneda, zona horaria); un país con divisiones no se borra. El detalle del país muestra las divisiones en acordeón con interruptor, filtro Active / Inactive / All, búsqueda y paginación, y las ciudades en columnas con su casilla de activa; alta, edición y baja de divisiones (nombre y código) y de ciudades (nombre, división, activa). Desactivar una división desactiva sus ciudades; activar una ciudad activa su división.
  - *Prospect engine* → **Decision-maker roles**: rol, nivel, áreas ("All areas" para dirección general), títulos de búsqueda e interruptores de correo y teléfono; alta y edición en modal; un rol que tienen decisores guardados no se borra.
  - *On-demand* → **Scraping window** y *Booking landing* → **Showcase**: iguales a Release 3.
- Release 3 tenía *Search positions* y *Search cities*: los reemplazan las tres subpáginas nuevas.
- **No incluye** (Fase 2): Triggers, Prompts by country, Scheduled sends, el popup Search Positions, Run research, Requests, Engine activity ni las marcas de fuente, trigger o estado de las entidades.

## Cómo abrirlo

1. Abrir `index.html` (o la entrada del sitio showcase).
2. Elegir un rol: Sales Rep y SDR ven solo su cartera; Coordinator y Supervisor ven todo, asignan y exportan; Administrator además entra a Users y Settings. Settings rechaza a los demás roles y los devuelve al Dashboard.
3. `localStorage` guarda la sesión (`user`), el tema (`theme`), el menú (`sidebarCollapsed`), la ventana on-demand (`odoConfig`), la vitrina (`showcaseRoles`, `showcaseLimit`) y los catálogos de Fase 1 (`f1Positions`, `f1Terms`, `f1Geo`, `f1Roles`). `f1SeedVersion` descarta los catálogos guardados cuando cambia la versión del seed. Borrar esas claves devuelve el prototipo al seed.

## Mapa de páginas

| Página | Sección | Contenido |
|---|---|---|
| `index.html` | Login | Selector de usuario demo (reemplaza el SSO de Entra ID). |
| `dashboard.html` | Dashboard | Igual a Release 3. |
| `open-positions.html` | Open Positions | Igual a Release 3 (filtro de país y *US states*, exportación). |
| `prospects.html` | Companies | Igual a Release 3 (filtro de país, alta de empresa, exportación). |
| `vacancy-detail.html` | Open Position | Igual a Release 3. |
| `company-detail.html` | Company | Igual a Release 3. |
| `settings.html` | Settings | Positions & terms, Geography, Decision-maker roles, Scraping window y Showcase. Secciones por hash: `#terms`, `#geography` (`#geography/US` abre el detalle), `#roles`, `#ondemand` (también `#window`), `#showcase`. |
| `admin-users.html` | Users | Igual a Release 3. |

## Datos de Settings (`fase1-config.js`)

`settings.html` carga `rbac.js` y después `fase1-config.js`; ninguna otra página lo carga. El modelo es el de `rbac.js` §20 de Release 4, recortado a Fase 1. Todos los globales llevan prefijo `F1_` / `f1` porque `rbac.js` de Release 3 ya declara `RECORD_COUNTRIES`, `countryName` y `POSITIONS_CATALOG`, y un `const` repetido entre scripts corta la carga.

| Global | Seed |
|---|---|
| `F1_COUNTRIES` | United States (State, English, USD, America/New_York) y Spain (Province, Spanish, EUR, Europe/Madrid), los dos de venta. |
| `F1_DIVISIONS` | Los 51 estados de `US_STATES` (`US-FL`…) y las 16 provincias de las ciudades de España (`ES-M`, `ES-B`…), en ISO 3166-2. Activa = tiene una ciudad activa. |
| `F1_CITIES` | EE. UU.: las 50 ciudades de la grilla de Release 3 (activas) y Dallas, Austin, Tampa y San Francisco, que aparecen en los registros (inactivas). España: las 20 ciudades de HUPES-1.1 (activas). |
| `F1_POSITIONS` | Las 21 posiciones de `POSITIONS_CATALOG`, con sus áreas (HUSPL-13.1). |
| `F1_TERMS` | 54 términos de EE. UU. (`search_terms` de Release 3) y 54 de España (`search_terms_es` de Release 3). |
| `F1_DECISION_ROLES` | 13 roles con nivel, áreas, títulos de búsqueda, correo y teléfono; los niveles de owner_founder, coo, vp_operations y director_operations son de ejemplo (marcados *To confirm*). |
| `F1_AREA_LABELS`, `F1_TIMEZONES` | Áreas y zonas horarias de los selectores. |

`f1-config.css` es `r4-config.css` de Release 4 con el prefijo `f1-` y solo las reglas que usan estas tres subpáginas.

## Arquitectura

```
tokens.css   tokens del brand (los escribe vendor-tokens del sitio; no editar a mano)
theme.css    tokens de estado, focus ring y [data-theme='dark']
styles.css   estilos de la app; su :root es un bridge a los tokens. Fork propio de
             este bundle: contiene los componentes .op-* (Open Positions), .pr-*
             (Companies), .vd-* / .cd-* (detalles), .kp-* (Dashboard), .st-* (Settings). f1-config.css suma los de los catálogos de Fase 1.
theme.js     anti-flash + toggle claro/oscuro (localStorage `theme`)
rbac.js      capa compartida: sesión y roles, datos mock, catálogos del motor,
             popups, exportación. Tiene índice de secciones al inicio.
*.html       una página por vista; cada una carga rbac.js y define su propio script.
```

**Este bundle es un fork y no se sincroniza con `solvo-platform-ui`** (ver README del sitio): `styles.css` y `rbac.js` son propios.

### rbac.js

Índice al inicio del archivo. Lo que importa para implementar:

- **Roles y permisos**: `ROLES`, `TEAM_MEMBERS` (public.solvo_staff), `canViewAll`, `canAssign`, `canDelete`, `canExport`, `canAccessAdmin`, `getVisibleCompanies` / `getVisibleVacancies` (visibilidad por slot para Sales Rep y SDR). Igual que la matriz de permisos del Executive Summary.
- **Entidades mock**: `MOCK_COMPANIES`, `MOCK_VACANCIES`, `MOCK_CONTACTS`, `MOCK_STATE_HISTORY`, `MOCK_EXECUTION_LOGS`. El bloque *Entidades mock y su columna en la base compartida* mapea cada campo a `tabla.columna` y a la HU que lo introduce. Los seeds se completan con funciones autoejecutadas (`seedQualification`, `seedContactAnalysis`, `seedLegacyClassification`, `seedRelease3State`, `seedStateHistory`, `seedExecutionLogs`, `seedCompanyResearch`, …) y son relativos a hoy, así que las antigüedades siempre tienen material.
- **Catálogos del motor**: `POSITIONS_CATALOG` (21 posiciones, 54 términos; igual al seed de FPEA-0), `LEAD_SIGNALS` (13 señales de empresa, dos descalificantes), `VACANCY_SIGNALS` (11 señales del aviso, `vacancies.ai_signals`), `icpTier` (0–33 / 34–66 / 67–100), `ROLE_CODES` + `ROLE_PATTERNS` + `DECISION_LEVEL_TABLE` + `companySizeBand` (HUPEA-2.3), `EMAIL_VERIFICATION` (qué hace el envío con cada estado), `US_STATES`, `INDUSTRY_CATALOG` (23), `COMPANY_SIZE_RANGES` (5 tramos), `PIPELINE_STAGES`, `SENIORITY_LEVELS`.
- **Etiquetas**: los objetos guardan el valor de la base y la interfaz lo muestra con su etiqueta — `portalLabel`, `sourceProjectLabel`, `seniorityLabel`, `modalityLabel`, `vacancySignalLabel`, `leadSignalLabel`, `pipelineLabel`, `getIndustryLabel`, `RELATIONSHIP_LABELS`.
- **Actividad**: `getVacancyActivity` / `getCompanyActivity` sobre `states_history`, de lo más reciente a lo más viejo. Los pasos de los flujos quedan sembrados en `MOCK_EXECUTION_LOGS` y consultables con `getVacancyExecutionLogs` / `getCompanyExecutionLogs`, pero no se muestran: el registro de ejecución va a tener su propia página de consulta y filtrado.
- **Contactos**: `getDecisionMakers` (los analizados, agrupados por rol), `getUnanalyzedContacts` (los anteriores al análisis, que no son decisores) y los vocabularios `CONTACT_DEPARTMENTS` y `CONTACT_SENIORITIES`, que son los que guarda el motor.
- **Componentes compartidos**: `renderSidebar`, `renderHeaderControls`, `showToast`, `openAssignmentPopup` / `renderAssignmentSection` (Release 2), `openConfirmPopup`, `openExportPopup`, `openScrapePopup` (On-Demand), `renderShellPicker` / `renderShellSearchbox` (selectores de la barra).
- **Exportación**: `EXPORT_COLUMNS_VACANCIES` y `EXPORT_COLUMNS_PROSPECTS`, `buildVacancyExportRows` / `buildProspectExportRows`, `deliverExport` (CSV UTF-8 con BOM y CRLF; ZIP sin compresión cuando salen los dos), `markExported`, `EXPORT_ROW_LIMIT`. Ver *Exportación* más abajo.
- **Tablero**: `MOCK_DAILY_METRICS` y `MOCK_BOOKING_FUNNEL`, series sintéticas deterministas (`seededNoise`); `dailyMetrics(days)`, `bookingFunnel(days)`, `BOOKING_FUNNEL_STAGES`.

### Motor de criterios de los listados

Open Positions y Companies comparten el patrón; cada uno declara su propio `FILTERS`:

```js
{ key, group, label, type,      // single | multi | text | daterange | search | dm
  options | options(),          // valores; función cuando depende de datos
  def,                          // valor inicial — puede recortar (viables, no exportados, con decisores)
  neutral,                      // valor que NO recorta; es a donde va "limpiar"
  gated(),                      // visibilidad por rol
  chip(value),                  // texto del chip en la barra
  test(record, value) }         // predicado client-side; en la plataforma es un parámetro del endpoint
```

**País**: Open Positions y Companies filtran por país (`United States`, `Spain`; los dos marcados por defecto, "US + Spain") desde la barra, el popup y su chip; el país de la vacante es el de su empresa, el filtro *US states* solo recorta las de EE. UU. y el archivo de posiciones suma la columna `País`.

`state` es lo aplicado; `draft` lo que edita el popup hasta "Show results". La búsqueda por texto espera al botón; los selectores rápidos y los chips aplican al instante y escriben el mismo criterio que el popup. `isNeutral(f, v)` decide si un criterio se evalúa; `defaultFor` / `neutralFor` clonan objetos para no compartir referencias.

## Exportación

Dos archivos, y cada uno se basta solo:

| Archivo | Una fila por | Se pide desde | Lleva del otro lado |
|---|---|---|---|
| `posiciones_<fecha>.csv` | aviso | Open Positions (recorte del listado) o Companies (acompañante: todas las posiciones de esas empresas) | `Correos de decisores`: los correos de los decisores de la empresa, separados por `;` |
| `prospectos_<fecha>.csv` | contacto | Companies (recorte del listado) o Open Positions (acompañante: los contactos de esas empresas) | `Posiciones detectadas`: los cargos publicados, separados por barra |

- El de prospectos es la lista de personas —nombre, cargo, rol, nivel de decisión, correo con su verificación, teléfono y LinkedIn— y repite en cada fila las columnas de su empresa, para poder ordenarlo y filtrarlo sin cruzarlo con nada. Una empresa a la que todavía no se le encontró a nadie entrega igual su fila, con las celdas de persona vacías.
- Cada archivo entrega además lo que dedujo el motor: puntaje ICP y señales en el de prospectos; posición del catálogo, veredicto de viabilidad, confianza e idiomas en el de posiciones.
- El archivo de la entidad del listado hereda sus filtros; el acompañante no hereda ninguno y entrega todo lo relacionado con ese recorte.
- Un solo archivo se entrega como CSV; los dos, en `exportacion_<fecha>.zip`.
- UTF-8 con BOM, CRLF, celda vacía cuando no hay dato, orden por fecha de detección descendente y empresa ascendente. Encabezados en español, que son contrato.
- Modalidad, seniority, portal e industria se entregan con su etiqueta; relación y etapa del embudo, con el valor crudo de la base.
- El tope de 10.000 filas se evalúa por archivo: marcar un acompañante que lo supera deshabilita la descarga con el motivo a la vista.
- Todo registro entregado queda marcado con quién lo exportó y cuándo, también los del acompañante.

Este diseño sustituye al contrato de tres entidades de HUSPL-2.6, que se entregó antes del motor nuevo: necesita una feature propia en Release 3, porque aquellas historias están cerradas.

## Correspondencia con la base compartida

Resumen; el detalle campo a campo está en el typedef de `rbac.js`.

| Objeto mock | Tablas | Campos que introduce el Prospect Engine (FPEA-0) | Campos que introduce Mantenimiento (FSPL-0) |
|---|---|---|---|
| Company | `public.company` + `public.company_research` (1:1) | `state_code`, `apollo_organization_id`, `icp_score`, `lead_signals`, `qualified_at`, `contacts_searched_at`, `is_excluded`, `exclusion_reason`; `company_research.lead_summary` | `industry_code`, `last_exported_by/at`, `export_count` |
| Vacancy | `public.vacancies` | `position_id`, `search_text`, `salary_min_usd`, `salary_max_usd`, `languages`, `ai_signals` poblado; UNIQUE pasa a (`source`, `job_key`) | `last_exported_*` |
| Contact | `public.company_contacts` | `decision_level`, `role_code`, `interest_signal`, `email_verification`, `analyzed_at` | `last_exported_*` |
| StateHistory | `public.states_history` | — | — |
| ExecutionLog | `public.execution_logs` | (la correlación con vacante/empresa va en `metadata`) | — |
| Positions & terms, Geography, Decision-maker roles (Settings) | catálogos de FSPL-1, por definir | — | — |

Dos nombres invertidos a propósito, porque las páginas los leen así: en el mock `vacancy.source` es el **pipeline** (`vacancies.source_project`) y `vacancy.sourcePortal` es el **portal** (`vacancies.source`).

Los valores que guardan los objetos mock son los de la base: `relationship_type` (`client` | `prospect` | `inactive`), `source_project` (`prospect_engine`, `general-us-openings`, `current-client-us-openings`, `on_demand_openings`), `source` (`indeed` | `linkedin`), `work_modality` (`remote` | `hybrid` | `onsite` | `unknown`) y `seniority_level` (`entry` | `mid` | `senior` | `lead` | `executive` | `unspecified`).

Algo que la HU tiene que decir y no se ve en el prototipo: el listado de Companies necesita un `LEFT JOIN` a `company_research` para traer `lead_summary`. `revenue_usd` y `year_founded` se quedan como `VARCHAR`: ningún filtro resuelve sobre ellos.

## Contratos existentes que las páginas reutilizan

Definidos en las HUs del MVP, Release 2, el CR de UI, Mantenimiento y Release 3 (Settings); los parámetros nuevos de Release 3 están por definir.

- Listados y exportación: `GET /api/vacancies`, `GET /api/vacancies/export`, `GET /api/vacancies/export/count`, `GET /api/companies`, `GET /api/companies/export`, `GET /api/companies/export/count`.
- Detalles: `GET /api/vacancies/:id`, `PUT /api/vacancies/:id`, `POST /api/vacancies/:id/state`, `GET /api/vacancies/:id/history`, `PUT /api/vacancies/:id/assignment`; `GET /api/companies/:id`, `PUT /api/companies/:id`, `PUT /api/companies/:id/research`, `POST /api/companies/:id/state`, `GET /api/companies/:id/history`, `PUT /api/companies/:id/assignment`, `POST /api/companies`, `POST` / `PUT /api/companies/:companyId/contacts`, `POST /api/companies/:id/research/request` (a redefinir sobre `prospect_queue`).
- Configuración: los contratos de Positions & terms, Geography y Decision-maker roles se definen en FSPL-1; reemplazan a los de Release 3 (`/api/v1/settings/positions`, `/api/v1/settings/cities`).
- Administración: `GET /api/admin/users`; staff para asignar: `GET /api/staff?role=…`.
- Tablero: hoy `GET /api/dashboard/kpis/vacancies` y `/companies`; el tablero nuevo necesita contrato propio.

## Mecanismos exclusivos del prototipo

No forman parte de ninguna feature:

- Login por selector de rol y sesión en `localStorage`.
- Persistencia de Configuración en `localStorage`, el reinicio por `f1SeedVersion` y el botón "Restore the seeded showcase".
- Popup on-demand con espera simulada (`setTimeout`) y un nombre con `zzz` como "empresa no encontrada".
- `createCompany()` de Companies es un stub (solo toast); `investigateFromEdit()` y "Run research" solo muestran un toast.
- Series del tablero sintéticas; `MOCK_EXECUTION_LOGS` sembrado pero no mostrado (R3-A12).
- Selector de idioma sin efecto (R3-D6).
- Derivación client-side de `role_code` para contactos manuales (`normalizeRoleCode`), espejo del prompt de HUPEA-2.3.

## Lo que el prototipo no representa

- El registro de ejecución del motor, que va a tener su propia página.
- El estado del item en `prospect_queue`: la interfaz no lo expone a propósito.
- Los estados de carga, error y progreso de la exportación, que la HU sí describe.
- Los filtros del historial de seguimiento, que se retiraron mientras el volumen no los justifique.

El código heredado del bundle original que ninguna página usaba —los filtros de Release 2, `exportToCSV`, el selector de idioma y sus ayudas— se retiró.
