# Solvo Platform UI — Release 3 (prototipo)

Prototipo navegable de Solvo Sales Platform sobre los datos del motor de prospección rediseñado (épica *Ajustes Prospect Engine*). Es HTML + CSS + JS sin build ni servidor: se abre `index.html`, se elige un usuario demo por rol y todo corre en memoria y `localStorage`. Este README es la guía para implementarlo: qué muestra cada página, de dónde sale cada dato y qué contrato ya existe.

La revisión funcional y de datos del prototipo, con los puntos a decidir antes de escribir las HUs, vive en el vault: `analysis/solvo-platform/revision-prototipo-release-3.md`. Los comentarios `REVISIÓN R3-xx` del código citan sus hallazgos.

## Cómo abrirlo

1. Abrir `index.html` (o la entrada *Platform UI — Release 3* del sitio showcase).
2. Elegir un rol: Sales Rep y SDR ven solo su cartera; Coordinator y Supervisor ven todo, asignan y exportan; Administrator además entra a Users y Settings.
3. `localStorage` guarda la sesión (`user`), el tema (`theme`), el menú (`sidebarCollapsed`), la ventana on-demand (`odoConfig`) y el estado de Configuración (`positionsCatalog`, `citiesGrid`, `citiesCap`). Borrar esas claves devuelve el prototipo al seed.

## Mapa de páginas

| Página | Sección | Qué introduce Release 3 |
|---|---|---|
| `index.html` | Login | Selector de usuario demo (reemplaza el SSO de Entra ID). |
| `dashboard.html` | KPIs | Embudo de detección, dos tendencias diarias con vista de tabla, embudo de agendamiento y su registro diario. Ventana 7 / 30 días. Es volumen del motor: no se filtra por asignación. |
| `open-positions.html` | Open Positions (antes Vacancies) | Grilla de cards; búsqueda por título/descripción; selectores rápidos de empresa, posición y estado; popup de criterios declarativo; orden; exportación con acompañantes. |
| `prospects.html` | Prospects (antes Companies) | Filas por empresa con resumen de lead, señales, posiciones, decisores, outreach y dueños; mismo motor de criterios; alta de empresa; exportación con acompañantes. |
| `vacancy-detail.html` | Open Position | Cabecera, Job info + Analysis (veredicto, señales del aviso), descripción, Follow-up; barra lateral con empresa, decisores y asignación; edición, cambio de estado y borrado. |
| `company-detail.html` | Prospect | Cabecera, Info (firmografía, Research, Analysis), Positions, Follow-up; decisores y contactos sin analizar, con alta/edición/baja; asignación; scraping on-demand; solicitud de investigación; borrado. |
| `settings.html` | Settings | Search positions (catálogo), Search cities (grilla y tope por estado), Scraping window (on-demand). Solo Administrator. |
| `admin-users.html` | Users | Sin cambios respecto de Release 2. |

Cada página abre su `<script>` principal con un bloque que detalla datos, secciones, acciones y contratos.

## Arquitectura

```
tokens.css   tokens del brand (los escribe vendor-tokens del sitio; no editar a mano)
theme.css    tokens de estado, focus ring y [data-theme='dark']
styles.css   estilos de la app; su :root es un bridge a los tokens. Fork propio de
             este bundle: contiene los componentes .op-* (Open Positions), .pr-*
             (Prospects), .vd-* / .cd-* (detalles), .kp-* (KPIs), .st-* (Settings).
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

Open Positions y Prospects comparten el patrón; cada uno declara su propio `FILTERS`:

```js
{ key, group, label, type,      // single | multi | text | daterange | search | dm
  options | options(),          // valores; función cuando depende de datos
  def,                          // valor inicial — puede recortar (viables, no exportados, con decisores)
  neutral,                      // valor que NO recorta; es a donde va "limpiar"
  gated(),                      // visibilidad por rol
  chip(value),                  // texto del chip en la barra
  test(record, value) }         // predicado client-side; en la plataforma es un parámetro del endpoint
```

`state` es lo aplicado; `draft` lo que edita el popup hasta "Show results". La búsqueda por texto espera al botón; los selectores rápidos y los chips aplican al instante y escriben el mismo criterio que el popup. `isNeutral(f, v)` decide si un criterio se evalúa; `defaultFor` / `neutralFor` clonan objetos para no compartir referencias.

## Exportación

Dos archivos, y cada uno se basta solo:

| Archivo | Una fila por | Se pide desde | Lleva del otro lado |
|---|---|---|---|
| `posiciones_<fecha>.csv` | aviso | Open Positions (recorte del listado) o Prospects (acompañante: todas las posiciones de esas empresas) | `Correos de decisores`: los correos de los decisores de la empresa, separados por `;` |
| `prospectos_<fecha>.csv` | contacto | Prospects (recorte del listado) o Open Positions (acompañante: los decisores de esas empresas) | `Posiciones detectadas`: los cargos publicados, separados por barra |

- El de prospectos es la lista de personas —nombre, cargo, rol, nivel de decisión, correo con su verificación, teléfono y LinkedIn— y repite en cada fila las columnas de su empresa, para poder ordenarlo y filtrarlo sin cruzarlo con nada. Una empresa a la que todavía no se le encontró a nadie entrega igual su fila, con las celdas de persona vacías.
- Cada archivo entrega además lo que dedujo el motor: puntaje ICP y señales en el de prospectos; posición del catálogo, veredicto de viabilidad, confianza e idiomas en el de posiciones.
- El archivo de la entidad del listado hereda sus filtros; el acompañante no hereda ninguno y entrega todo lo relacionado con ese recorte.
- Un solo archivo se entrega como CSV; los dos, en `exportacion_<fecha>.zip`.
- UTF-8 con BOM, CRLF, celda vacía cuando no hay dato, orden por fecha de detección descendente y empresa ascendente. Encabezados en español, que son contrato.
- Modalidad, seniority, portal, pipeline de origen e industria se entregan con su etiqueta; relación y etapa del embudo, con el valor crudo de la base.
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
| Positions (Settings) | `public.positions_catalog` (`name`, `search_terms TEXT[]`, `is_active`) | tabla nueva | — |
| Cities (Settings) | `public.us_cities` + día de barrido | — | — |

Dos nombres invertidos a propósito, porque las páginas los leen así: en el mock `vacancy.source` es el **pipeline** (`vacancies.source_project`) y `vacancy.sourcePortal` es el **portal** (`vacancies.source`).

Los valores que guardan los objetos mock son los de la base: `relationship_type` (`client` | `prospect` | `inactive`), `source_project` (`prospect_engine`, `general-us-openings`, `current-client-us-openings`, `on_demand_openings`), `source` (`indeed` | `linkedin`), `work_modality` (`remote` | `hybrid` | `onsite` | `unknown`) y `seniority_level` (`entry` | `mid` | `senior` | `lead` | `executive` | `unspecified`). `city_name` guarda el nombre pelado y el día de barrido viaja con el estado, porque en la base lo define `us_state_schedule.weekday`.

Dos cosas que la HU tiene que decir y no se ven en el prototipo: el día de barrido sale de `scrapping_vacantes_potenciales.us_state_schedule.weekday` con join por `state_code` —`public.us_states` no tiene esa columna—, y el listado de Prospects necesita un `LEFT JOIN` a `company_research` para traer `lead_summary`. `revenue_usd` y `year_founded` se quedan como `VARCHAR`: ningún filtro resuelve sobre ellos.

## Contratos existentes que las páginas reutilizan

Definidos en las HUs del MVP, Release 2, el CR de UI, Mantenimiento y Release 3 (Settings); los parámetros nuevos de Release 3 están por definir.

- Listados y exportación: `GET /api/vacancies`, `GET /api/vacancies/export`, `GET /api/vacancies/export/count`, `GET /api/companies`, `GET /api/companies/export`, `GET /api/companies/export/count`.
- Detalles: `GET /api/vacancies/:id`, `PUT /api/vacancies/:id`, `POST /api/vacancies/:id/state`, `GET /api/vacancies/:id/history`, `PUT /api/vacancies/:id/assignment`; `GET /api/companies/:id`, `PUT /api/companies/:id`, `PUT /api/companies/:id/research`, `POST /api/companies/:id/state`, `GET /api/companies/:id/history`, `PUT /api/companies/:id/assignment`, `POST /api/companies`, `POST` / `PUT /api/companies/:companyId/contacts`, `POST /api/companies/:id/research/request` (a redefinir sobre `prospect_queue`).
- Configuración: `GET | POST /api/v1/settings/positions`, `PATCH | PUT | DELETE /api/v1/settings/positions/{id}`; `GET | POST /api/v1/settings/cities`, `PUT /api/v1/settings/cities/cap`, `PATCH | PUT | DELETE /api/v1/settings/cities/{id}`.
- Administración: `GET /api/admin/users`; staff para asignar: `GET /api/staff?role=…`.
- Tablero: hoy `GET /api/dashboard/kpis/vacancies` y `/companies`; el tablero nuevo necesita contrato propio.

## Mecanismos exclusivos del prototipo

No forman parte de ninguna feature:

- Login por selector de rol y sesión en `localStorage`.
- Persistencia de Configuración en `localStorage` y los botones "Restore the seeded catalog" / "Restore the seeded grid".
- Popup on-demand con espera simulada (`setTimeout`) y un nombre con `zzz` como "empresa no encontrada".
- `createCompany()` de Prospects es un stub (solo toast); `investigateFromEdit()` y "Run research" solo muestran un toast.
- Series del tablero sintéticas; `MOCK_EXECUTION_LOGS` sembrado pero no mostrado (R3-A12).
- Selector de idioma sin efecto (R3-D6).
- Derivación client-side de `role_code` para contactos manuales (`normalizeRoleCode`), espejo del prompt de HUPEA-2.3.

## Lo que el prototipo no representa

- El registro de ejecución del motor, que va a tener su propia página.
- El estado del item en `prospect_queue`: la interfaz no lo expone a propósito.
- Los estados de carga, error y progreso de la exportación, que la HU sí describe.
- Los filtros del historial de seguimiento, que se retiraron mientras el volumen no los justifique.

El código heredado del bundle original que ninguna página usaba —los filtros de Release 2, `exportToCSV`, el selector de idioma y sus ayudas— se retiró.
