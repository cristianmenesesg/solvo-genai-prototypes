/* ========================================================================
   Búsqueda de candidatos — un solo flujo, dos disparadores.
   El flujo deja de armar su propia cola y recibe el conjunto de
   combinaciones ya resuelto. El cron y la búsqueda asistida son dos
   maneras de construir ese mismo JSON.
   ======================================================================== */

const HU_C = { 'HUSRP-2.1':'#ef4444', 'HUSRP-2.2':'#0ea5e9', 'HUSRP-2.3':'#f59e0b' };

/* Catálogo de HUs que no se implementan dentro de un flujo. */
const HU_INFO = {
  'HUSRP-0.1':   { g:'Prework', c:'#8b5cf6', n:'Esquema de la ejecución y su asociación con candidatos',
    d:'Crea <code>solvo_pipeline.ai_searches</code> y <code>ai_search_candidates</code>, y agrega <code>execution_id</code> a <code>search_queue</code> para que la cola deje de truncarse.' },
  'HUSRP-0.2':   { g:'Prework', c:'#8b5cf6', n:'Spike del intérprete sobre descripciones reales',
    d:'Valida sobre descripciones de distinta longitud que el modelo produce criterios válidos y los tres niveles jerárquicos. El prompt que resulte es el que se implementa en el flujo.' },
  'HUSRP-1.1-BE':{ g:'Parámetros', c:'#0ea5e9', n:'API de techo, período, profundidad y umbral',
    d:'De acá salen el <code>min_results</code> que dispara la ampliación y la profundidad máxima que un reclutador puede pedir por ciudad.' },
  'HUSRP-1.2-BE':{ g:'Parámetros', c:'#0ea5e9', n:'Consumo acumulado contra el techo',
    d:'Lee de <code>public.execution_logs</code> lo que el flujo dejó registrado y lo expone contra el límite vigente.' },
  'HUSRP-1.3-BE':{ g:'Parámetros', c:'#0ea5e9', n:'Servicio de cálculo de costo',
    d:'Las tarifas de los proveedores viven del lado del servidor. Alimenta la proyección mensual y el estimado del popup.' },
  'HUSRP-1.4-FE':{ g:'Parámetros', c:'#0ea5e9', n:'Presupuesto y proyección en la página',
    d:'El techo editable, la barra de consumo y la proyección que recalcula al mover cobertura o cadencia.' },
  'HUSRP-2.4-BE':{ g:'Plataforma', c:'#6366f1', n:'Endpoint de disparo y validación de presupuesto',
    d:'Contrasta el estimado contra el saldo, crea la fila en <code>ai_searches</code> y llama al webhook. Rechaza si el techo está agotado.' },
  'HUSRP-2.5-BE':{ g:'Plataforma', c:'#6366f1', n:'Consulta de resultados por ejecución',
    d:'Devuelve solo los candidatos atados a esa búsqueda y su estado, mientras el flujo sigue corriendo.' },
  'HUSRP-2.6-BE':{ g:'Plataforma', c:'#6366f1', n:'Estimación de alcance y costo',
    d:'Páginas totales, candidatos máximos y esperados, y el costo separando búsqueda de correo.' },
  'HUSRP-2.7-FE':{ g:'Plataforma', c:'#6366f1', n:'Cuadro de diálogo de AI Search',
    d:'Perfil, descripción, idioma, ciudades y páginas, con el alcance y el costo recalculando en vivo.' },
  'HUSRP-2.8-FE':{ g:'Plataforma', c:'#6366f1', n:'Listado reactivo de la búsqueda',
    d:'La tabla se llena a medida que llegan los candidatos y refleja la respuesta del flujo: terminada, ampliada, vacía o parcial.' },
  'HUSRP-2.9':   { g:'Plataforma', c:'#6366f1', n:'Despliegue a Producción',
    d:'Los tres flujos en el n8n de Producción, webhook autenticado y credenciales del gestor de secretos.' },
};

const T = {
  webhook:  { c:'#885577', i:'M12 2a10 10 0 1 0 10 10M12 2v10l7 7' },
  cron:     { c:'#885577', i:'M12 7v5l3 2M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9z' },
  respond:  { c:'#885577', i:'M20 12H4M10 6l-6 6 6 6' },
  set:      { c:'#0aa8a7', i:'M4 7h16M4 12h10M4 17h7' },
  code:     { c:'#6b7280', i:'M9 6l-5 6 5 6M15 6l5 6-5 6' },
  agent:    { c:'#10a37f', i:'M12 4v3M12 17v3M4 12h3M17 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2' },
  openai:   { c:'#10a37f', i:'M12 3a4 4 0 0 1 4 4v10a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4z' },
  postgres: { c:'#336791', i:'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6' },
  subwf:    { c:'#ff6d5a', i:'M4 5h7v6H4zM13 13h7v6h-7zM11 8h2a2 2 0 0 1 2 2v3' },
  trigger:  { c:'#885577', i:'M13 2L4 14h7l-1 8 9-12h-7z' },
  switch:   { c:'#506690', i:'M4 12h5l4-6h7M13 18h7M9 12l4 6' },
  if:       { c:'#506690', i:'M12 4v6M12 10l-6 4v6M12 10l6 4v6' },
  merge:    { c:'#506690', i:'M6 4v5l6 5v6M18 4v5l-6 5' },
  wait:     { c:'#506690', i:'M12 7v5l3 2M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9z' },
};

/* ============ 1 · El flujo único, refactorizado ============ */
const SEARCH = {
  key:'search', name:'TS_SEARCH_CANDIDATES', hu:'HUSRP-2.1',
  huName:'Flujo único de búsqueda con entrada por JSON',
  rel:[ { id:'HUSRP-0.1', how:'depende de' },
        { id:'HUSRP-2.2', how:'lo llama' },
        { id:'HUSRP-2.3', how:'lo llama' } ],
  sub:'Refactor del flujo actual · recibe el JSON completo y no sabe quién lo llamó',
  intro:'Hoy este flujo arma su propia cola leyendo perfiles y ciudades activas. Después del refactor recibe las combinaciones ya resueltas y solo las ejecuta: es el único lugar donde se scrapea, se evalúa disponibilidad, se compra correo y se persiste. Lo comparten el disparo programado y la búsqueda asistida.',
  nodes: [
    { id:'trg', n:'Receive Search\nRequest Trigger', t:'trigger', x:0, y:230, trigger:true,
      d:{ does:'Punto de entrada único del flujo. Lo invocan tanto el cron como la búsqueda asistida, con el mismo contrato.',
          in:'El JSON completo de la búsqueda a ejecutar.',
          op:`{
  "execution_id": "610394",
  "source": "cron" | "ai_search",
  "ai_search_id": null | "uuid",
  "options": { "min_results": 8 },
  "combinations": [
    { "search_profile_id": "uuid", "profile_title": "Legal Assistant",
      "country": "Colombia", "city": "Bogotá",
      "query": "(\\"Asistente Legal\\" OR \\"Legal Assistant\\") AND (...) NOT (...)",
      "take_pages": 1, "max_items": 25, "level": 1 }
  ]
}`,
          note:'La consulta booleana <b>ya viene armada</b>. El flujo no la construye ni consulta la configuración: eso es responsabilidad de quien dispara.' } },

    { id:'val', n:'Validate Search\nPayload Code', t:'code', x:190, y:230,
      d:{ does:'Valida el payload antes de tocar la base, para que un disparo mal armado falle rápido y con un motivo legible en el log.',
          in:'El JSON del trigger.', out:'Las combinaciones normalizadas.',
          note:'Rechaza el lote si falta <code>execution_id</code>, si <code>combinations</code> viene vacío o si una combinación no trae <code>query</code>. Recorta <code>take_pages</code> al máximo permitido por configuración.' } },

    { id:'seed', n:'Seed Execution Queue\nDatabase', t:'postgres', x:380, y:230,
      d:{ does:'Siembra en la cola las combinaciones de esta ejecución, para poder procesarlas por lotes y saber en todo momento cuáles faltan.',
          out:'Una fila por combinación en estado <code>PENDING</code>.',
          op:`INSERT INTO solvo_pipeline.search_queue
  (execution_id, profile_id, profile_title, country, city,
   query, take_pages, max_items, level, status)
SELECT $1, c.profile_id, c.profile_title, c.country, c.city,
       c.query, c.take_pages, c.max_items, c.level, 'PENDING'
FROM jsonb_to_recordset($2::jsonb) AS c(...);`,
          note:'<b>Cambio central del refactor: se elimina el TRUNCATE.</b> Hoy el flujo vacía la tabla entera al arrancar; con dos disparadores que pueden coincidir, un cron y una búsqueda asistida simultáneos se borrarían la cola mutuamente. La cola pasa a estar particionada por <code>execution_id</code>.' } },

    { id:'fetch', n:'Fetch Combination\nBatch Database', t:'postgres', x:570, y:230,
      d:{ does:'Toma el próximo lote de trabajo y lo marca como en proceso en la misma sentencia, de modo que dos ciclos no tomen la misma combinación.',
          out:'Hasta 25 combinaciones de esta ejecución.',
          op:`UPDATE solvo_pipeline.search_queue
SET status = 'PROCESSING'
WHERE id IN (
  SELECT id FROM solvo_pipeline.search_queue
  WHERE execution_id = $1 AND status = 'PENDING'
  ORDER BY id LIMIT 25
)
RETURNING *;`,
          note:'Mismo mecanismo de lotes de 25 que hoy, ahora acotado por <code>execution_id</code>.' } },

    { id:'batch', n:'Create Parallel\nBatches Code', t:'code', x:760, y:230,
      d:{ does:'Parte el lote de 25 en cinco grupos, uno por worker, para paralelizar el scraping.',
          out:'Cinco arreglos de combinaciones, uno por rama del switch.' } },

    { id:'route', n:'Route Execution\nBatches Switch', t:'switch', x:950, y:230,
      d:{ does:'Despacha cada grupo a su worker. Las cinco ramas salen a la vez.',
          note:'Hoy la quinta rama apunta a un id de workflow que no corresponde al worker entregado, y ese worker está inactivo: una quinta parte de cada lote no se procesa. El refactor lo corrige.' } },

    { id:'w1', n:'Execute Process\nBatch One Tool', t:'subwf', x:1140, y:20,
      d:{ does:'Worker de scraping. Por cada combinación llama al actor de Apify con la consulta que vino en el JSON, normaliza los perfiles, resuelve disponibilidad y hace upsert del candidato.',
          api:'Actor Apify <code>M2FMdjRVeF1HPGFcc</code> (<code>harvestapi/linkedin-profile-search</code>).',
          op:`{ "searchQuery": <combination.query>,
  "locations": [ <combination.city> ],
  "takePages": <combination.take_pages>,
  "maxItems":  <combination.max_items>,
  "startPage": 1,
  "profileScraperMode": "Full",
  "autoQuerySegmentation": false }

INSERT INTO solvo_pipeline.candidates (...)
ON CONFLICT (linkedin_url) DO UPDATE SET ...
-- no pisa email, analyzed_at ni search_profile_id`,
          note:'<b>Dos cambios respecto del worker actual.</b> Ya no arma la consulta desde <code>search_es</code>/<code>search_en</code>: la recibe. Y normaliza <code>linkedin_url</code> antes de usarla como llave —minúsculas, sin barra final ni querystring—, algo que hoy no hace. Cobro: $0.10 por página abierta más $0.004 por perfil.' } },
    { id:'w2', n:'Execute Process\nBatch Two Tool', t:'subwf', x:1140, y:170, sameAs:'w1' },
    { id:'w3', n:'Execute Process\nBatch Three Tool', t:'subwf', x:1140, y:320, sameAs:'w1' },
    { id:'w4', n:'Execute Process\nBatch Four Tool', t:'subwf', x:1140, y:470, sameAs:'w1' },
    { id:'w5', n:'Execute Process\nBatch Five Tool', t:'subwf', x:1140, y:620, sameAs:'w1' },

    { id:'merge', n:'Merge Parallel\nExecutions Node', t:'merge', x:1330, y:230,
      d:{ does:'Junta las cinco ramas en un solo hilo para poder evaluar si queda trabajo.',
          note:'Modo append. El fallo de un worker no aborta a los demás: su combinación queda en <code>PROCESSING</code> y se reporta en el log.' } },

    { id:'wait', n:'Wait For\nWorkers Node', t:'wait', x:1520, y:230,
      d:{ does:'Da tiempo a que los workers terminen antes de volver a contar la cola.',
          note:'Hoy es una espera fija de 5 minutos, que sobra o falta según el lote. Con la cola por ejecución conviene esperar a que no queden <code>PENDING</code> ni <code>PROCESSING</code> de <b>esa</b> ejecución.' } },

    { id:'pend', n:'Count Pending\nCombinations Database', t:'postgres', x:1710, y:230,
      d:{ does:'Pregunta si a esta ejecución le queda trabajo por hacer.',
          op:`SELECT count(*) AS pending
FROM solvo_pipeline.search_queue
WHERE execution_id = $1 AND status = 'PENDING';` } },

    { id:'ifp', n:'Evaluate Pending\nCount Conditional', t:'if', x:1900, y:230,
      d:{ does:'Cierra el ciclo de lotes: mientras queden combinaciones vuelve a tomar 25; cuando no queda ninguna, sigue al post-proceso.',
          out:'<b>true</b> → vuelve a <i>Fetch Combination Batch</i> · <b>false</b> → sigue.',
          note:'Condición: <code>pending &gt; 0</code>.' } },

    { id:'otw', n:'Evaluate Open To\nWork Subworkflow', t:'subwf', x:2090, y:230,
      d:{ does:'Reevalúa los candidatos que el scraping dejó marcados como no disponibles y rescata a los que sí lo están según su historial laboral.',
          api:'<code>TS_EVALUATE_AVAILABILITY</code> · id <code>2IvDcuGON0mpdT3U</code>. Se reutiliza sin cambios.',
          note:'Sin posiciones vigentes marcadas <code>Present</code> → desempleo técnico. Todas las vigentes de tipo independiente (<code>freelance|self-employed|autónomo|independiente|contratista|contract</code>) → disponible. Actualiza <code>open_to_work</code> y <code>analyzed_at</code>.' } },

    { id:'mail', n:'Execute Email\nFinder Subworkflow', t:'subwf', x:2280, y:230,
      d:{ does:'Compra el correo de contacto de los candidatos disponibles que todavía no lo tienen.',
          api:'<code>TS_EMAIL_FINDER</code> · id <code>PJDJzwJb2j9oPpO1</code> → actor Apify <code>LpVuK3Zozwuipa5bp</code>, modo <i>Profile details + email search</i> ($10 por 1.000).',
          op:`SELECT * FROM solvo_pipeline.candidates
WHERE email IS NULL AND open_to_work = TRUE;`,
          note:'Ese filtro es lo que evita re-comprar correos y gastar en candidatos descartados. La fuente no cobra el intento cuando el perfil no da datos suficientes.' } },

    { id:'link', n:'Link Candidates To\nAI Search Database', t:'postgres', x:2470, y:230,
      d:{ does:'Ata los candidatos de esta ejecución a la búsqueda asistida que los pidió, para que el listado del reclutador muestre solo esos y no todo el pool del perfil.',
          op:`INSERT INTO solvo_pipeline.ai_search_candidates
  (ai_search_id, candidate_id, level, city)
SELECT $1, c.id, $2, $3
FROM solvo_pipeline.candidates c
WHERE c.linkedin_url = ANY($4)
ON CONFLICT (ai_search_id, candidate_id) DO NOTHING;`,
          note:'<b>Es la única rama del flujo que distingue quién lo llamó.</b> Solo corre si el payload trae <code>ai_search_id</code>; con <code>source=\'cron\'</code> se salta. El <code>ON CONFLICT</code> es lo que hace que la ampliación por niveles acumule sin duplicar.' } },

    { id:'sum', n:'Return Execution\nSummary Code', t:'code', x:2660, y:230,
      d:{ does:'Devuelve al llamador qué pasó, para que el cron lo reporte y la búsqueda asistida decida si amplía.',
          op:`{ "execution_id": "610394",
  "combinations_done": 40,
  "pages_used": 40,
  "profiles_scraped": 1000,
  "candidates_found": 280,
  "candidates_otw": 238,
  "emails_captured": 191 }` } },
  ],
  links: [
    ['trg','val'],['val','seed'],['seed','fetch'],['fetch','batch'],['batch','route'],
    ['route','w1'],['route','w2'],['route','w3'],['route','w4'],['route','w5'],
    ['w1','merge'],['w2','merge'],['w3','merge'],['w4','merge'],['w5','merge'],
    ['merge','wait'],['wait','pend'],['pend','ifp'],
    ['ifp','fetch',{back:true,label:'true · quedan pendientes'}],
    ['ifp','otw',{label:'false'}],
    ['otw','mail'],['mail','link'],['link','sum'],
  ],
};

/* ============ 2 · Disparador programado ============ */
const CRON = {
  key:'cron', name:'TS_ORCHESTRATE_SOURCING', hu:'HUSRP-2.2',
  huName:'Disparo programado por cron',
  rel:[ { id:'HUSRP-2.1', how:'llama a' } ],
  sub:'Disparador programado · arma el JSON desde la configuración vigente',
  intro:'Se queda con lo que hoy hace TS_EXTRACT_PROFILES antes de scrapear: resolver la cadencia, leer perfiles y ciudades activas y armar las combinaciones. Después llama al flujo de búsqueda y entrega el CSV.',
  nodes: [
    { id:'sch', n:'Schedule\nTrigger', t:'cron', x:0, y:160, trigger:true,
      d:{ does:'Despierta el pipeline todos los días. No decide si toca ejecutar: eso lo resuelve el nodo siguiente contra la configuración.',
          note:'Hoy la periodicidad está fija en el nodo (semanal, día 5) y la rama de producción termina sin salida, así que el pipeline nunca corre solo. Esta HU lo corrige.' } },

    { id:'freq', n:'Fetch Frequency\nParameter Database', t:'postgres', x:190, y:160,
      d:{ does:'Lee cada cuántos días debe correr y cuándo corrió por última vez.',
          op:`SELECT p.frequency_days,
       (SELECT max(execution_at) FROM public.execution_logs
        WHERE project_name = 'talent_sourcer'
          AND message LIKE 'ejecución iniciada%') AS last_run
FROM solvo_pipeline.parameters p LIMIT 1;`,
          note:'La cadencia deja de estar embebida en el nodo de cron: un cambio en configuración rige sin tocar el flujo.' } },

    { id:'due', n:'Evaluate Due\nExecution Conditional', t:'if', x:380, y:160,
      d:{ does:'Decide si hoy corresponde ejecutar.',
          out:'<b>true</b> → sigue · <b>false</b> → termina sin scrapear.',
          note:'Condición: <code>now() - last_run &gt;= frequency_days</code>. La ejecución omitida queda registrada en el log, no desaparece en silencio.' } },

    { id:'cov', n:'Fetch Active Profiles\nAnd Cities Database', t:'postgres', x:570, y:160,
      d:{ does:'Trae el universo de búsqueda: cada perfil activo cruzado con cada ciudad activa.',
          op:`SELECT sp.id AS profile_id, sp.title AS profile_title,
       sp.search_es, sp.search_en,
       p.country, p.city
FROM solvo_pipeline.search_profiles sp
CROSS JOIN solvo_pipeline.parameters p
WHERE sp.is_active AND p.is_active;`,
          note:'Es el producto cartesiano que hoy vive dentro del flujo de búsqueda. Sale de ahí y pasa a ser responsabilidad del disparador. Con la configuración actual son 12 perfiles × 10 ciudades = 120 combinaciones.' } },

    { id:'pay', n:'Build Search\nPayload Code', t:'code', x:760, y:160,
      d:{ does:'Arma la consulta booleana de cada combinación y con eso construye el JSON que espera el flujo de búsqueda.',
          op:`query = '(' + search_es + ' OR ' + search_en + ')'
      + ' AND ("Open to work" OR "Búsqueda activa"'
      + ' OR "Nuevos retos" OR "Looking for opportunities")'
      + ' NOT (recruiter OR reclutador)'

{ execution_id, source: 'cron', ai_search_id: null,
  combinations: [ { ...perfil, ...ciudad, query,
                    take_pages: 1, max_items: 25, level: 1 } ] }`,
          note:'Único lugar donde se construye la consulta del pipeline programado. Operadores en mayúscula, comillas para frase exacta; LinkedIn no soporta <code>*</code>, <code>+</code>, <code>-</code>, <code>[]</code> ni <code>{}</code>.' } },

    { id:'call', n:'Execute Search\nCandidates Subworkflow', t:'subwf', x:950, y:160,
      d:{ does:'Ejecuta la búsqueda llamando al flujo compartido y espera su resumen.',
          api:'<code>TS_SEARCH_CANDIDATES</code>, el mismo flujo que usa la búsqueda asistida.',
          note:'Acá está el valor del refactor: una sola implementación de scraping, disponibilidad, correo y persistencia que mantener.' } },

    { id:'rep', n:'Deliver Candidate\nReport Subworkflow', t:'subwf', x:1140, y:160,
      d:{ does:'Entrega el CSV del pool a los destinatarios configurados.',
          api:'<code>TS_DELIVER_REPORT</code> · id <code>haaAh4qslcPI1FFT</code>.',
          note:'Solo lo hace el disparo programado. La búsqueda asistida no envía CSV: sus resultados se ven en la plataforma.' } },

    { id:'log', n:'Log Execution\nSummary Subworkflow', t:'subwf', x:1140, y:320,
      d:{ does:'Deja en el log central el resumen de la ejecución programada.',
          api:'<code>99_HLP_LOGGER_SYSTEM</code> · id <code>RVWYKqLh0m7DTaKK</code>.',
          op:`provider = 'apify'
usage_type = 'requests'   usage_unit = 'count'
usage_amount = <páginas abiertas>
metadata = { combinations, candidates_found, candidates_otw }` } },
  ],
  links: [
    ['sch','freq'],['freq','due'],['due','cov',{label:'true'}],['cov','pay'],['pay','call'],
    ['call','rep'],['call','log',{dashed:true}],
  ],
};

/* ============ 3 · Disparador de la búsqueda asistida ============ */
const AI = {
  key:'ai', name:'AS_ORCHESTRATE_AI_SEARCH', hu:'HUSRP-2.3',
  huName:'Disparo desde la búsqueda asistida y respuesta a la plataforma',
  rel:[ { id:'HUSRP-2.4-BE', how:'lo dispara' },
        { id:'HUSRP-0.1', how:'depende de' },
        { id:'HUSRP-0.2', how:'depende de' },
        { id:'HUSRP-1.1-BE', how:'depende de' },
        { id:'HUSRP-2.1', how:'llama a' },
        { id:'HUSRP-2.5-BE', how:'consume su resultado' },
        { id:'HUSRP-1.2-BE', how:'consume su traza' } ],
  sub:'Disparador bajo demanda · interpreta, arma el JSON por nivel y responde a la plataforma',
  intro:'Convierte el texto del reclutador en tres consultas de amplitud creciente, arma el mismo JSON que arma el cron y llama al flujo compartido. Si el criterio más específico no rinde, amplía al siguiente gastando el presupuesto de páginas que sobró. Al terminar le responde a la plataforma.',
  nodes: [
    { id:'wh', n:'Receive AI Search\nWebhook Trigger', t:'webhook', x:0, y:250, trigger:true,
      d:{ does:'Recibe la solicitud del backend cuando el reclutador confirma la búsqueda en el popup.',
          op:`POST /webhook/ai-search
{ "ai_search_id": "uuid", "search_profile_id": "uuid",
  "description": "Paralegal con 3+ años en immigration law...",
  "language": "English",
  "cities": ["Bogotá","Medellín","Lima","Buenos Aires"],
  "pages_per_city": 2 }`,
          api:'Autenticado con header compartido, mismo esquema que el webhook de re-validación.',
          note:'El backend ya validó el presupuesto y creó la fila en <code>ai_searches</code> antes de llamar. Acá no se vuelve a validar saldo.' } },

    { id:'set', n:'Set Execution\nTrace Variables', t:'set', x:190, y:250,
      d:{ does:'Fija las variables que acompañan cada línea de log de esta ejecución.',
          op:`project_name  = 'talent_sourcer_ai'
execution_id  = {{ $json.ai_search_id }}
execution_env = 'prod' | 'qa'` } },

    { id:'agent', n:'Build Search\nQueries Agent', t:'agent', x:380, y:250,
      d:{ does:'Lee la descripción y construye las tres búsquedas, de la más específica a la más genérica, eligiendo las palabras clave que mejor funcionen para encontrar a esa persona.',
          in:'<code>description</code> — desde dos palabras hasta una descripción de cargo completa.',
          op:`{ "keywords": ["Senior Paralegal","Paralegal","Legal Assistant",
                "Personal Injury","Medical records"],
  "discarded": ["data entry","detallista","bajo presión","inglés avanzado",
                "Demand Packages","análisis de responsabilidad"],
  "levels": [
    { "level":1, "query":"(\\"Senior Paralegal\\" OR \\"Paralegal\\" OR \\"Legal Assistant\\")
        AND (\\"Personal Injury\\" OR \\"Lesiones personales\\")
        AND (\\"Medical records\\" OR \\"Registros médicos\\")
        AND (\\"Open to work\\" OR \\"#OpenToWork\\" OR \\"Búsqueda activa\\")
        NOT (recruiter OR reclutador OR \\"talent acquisition\\")" },
    { "level":2, ... }, { "level":3, ... } ] }`,
          api:'OpenAI <code>gpt-5-mini</code> · $0.25 por 1M de entrada, $2.00 por 1M de salida.',
          note:'El grupo del cargo es <b>idéntico en las tres consultas</b>; lo único que cambia es cuántos discriminadores se exigen además (dos, uno, ninguno). Si la descripción no da para discriminar, las tres quedan iguales: no se agregan palabras que el texto no respalde ni se recorta el cargo para forzar una diferencia. La ubicación y el idioma no salen de acá: los elige el reclutador en el cuadro de diálogo.' } },

    { id:'model', n:'OpenAI Chat Model', t:'openai', x:380, y:400, small:true,
      d:{ does:'Sub-nodo del agente: el modelo que resuelve la interpretación.',
          note:'<code>gpt-5-mini</code>, el mismo que usan los cinco enriquecedores del pipeline.' } },

    { id:'build', n:'Validate Search\nQueries Code', t:'code', x:570, y:250,
      d:{ does:'Deja las consultas en condiciones de ejecutarse. El modelo las escribe; este nodo verifica lo mecánico y garantiza que la búsqueda arranque aunque la respuesta venga mal.',
          in:'La respuesta cruda del agente.',
          out:'<code>levels[]</code> validados, deduplicados y ordenados de específico a genérico.',
          op:`1. quitar bloque markdown y parsear JSON
2. operadores a mayúscula · "AND NOT" -> "NOT"
3. rechazar comodines fuera de comillas
4. paréntesis balanceados y comillas pares
5. forzar los bloques de disponibilidad y exclusión
6. niveles idénticos -> se ejecuta uno solo
7. nada válido -> fallback al cargo del perfil de búsqueda elegido`,
          note:'La limpieza del bloque markdown no es opcional: sobre 25 simulaciones el modelo envolvió el JSON en <code>\`\`\`json</code> en todas, y prohibírselo en el prompt solo empeoró la tasa. Se resuelve acá, igual que ya lo hace <code>ENRICH_ANALICE_AI_PROFILE</code>. El fallback usa los términos del perfil de búsqueda que el reclutador ya eligió, de modo que una respuesta inservible degrade a la búsqueda del pipeline en vez de dejar al reclutador sin nada.' } },

    { id:'logtok', n:'Log Interpretation\nTokens Subworkflow', t:'subwf', x:570, y:100,
      d:{ does:'Registra lo que costó la interpretación, para que el consumo del modelo entre en la misma contabilidad que el resto.',
          op:`provider = 'openai'      model_used = 'gpt-5-mini'
input_tokens = <n>       output_tokens = <n>
log_level = 'info'`,
          api:'<code>99_HLP_LOGGER_SYSTEM</code> · id <code>RVWYKqLh0m7DTaKK</code>.' } },

    { id:'crit', n:'Persist Search\nCriteria Database', t:'postgres', x:760, y:250,
      d:{ does:'Guarda en la ejecución qué entendió el modelo y con qué consultas va a buscar.',
          op:`UPDATE solvo_pipeline.ai_searches
SET criteria = $1::jsonb, queries = $2::jsonb,
    status = 'running', started_at = NOW()
WHERE id = $3;`,
          note:'Es lo que después permite auditar con qué criterios se gastó el presupuesto de esa búsqueda.' } },

    { id:'lvl', n:'Build Level\nPayload Code', t:'code', x:950, y:250,
      d:{ does:'Arma el JSON del nivel en curso: una combinación por ciudad, con la consulta de ese nivel y las páginas que le quedan a cada una.',
          op:`{ execution_id, source: 'ai_search', ai_search_id,
  options: { min_results },
  combinations: cities.map(city => ({
    search_profile_id, profile_title, city, country,
    query: levels[level].query,
    take_pages: pages_remaining[city],
    max_items: pages_remaining[city] * 25,
    level })) }`,
          note:'Mismo formato que arma el cron. La diferencia es de dónde sale: acá la consulta viene de la interpretación y el alcance lo eligió el reclutador.' } },

    { id:'call', n:'Execute Search\nCandidates Subworkflow', t:'subwf', x:1140, y:250,
      d:{ does:'Ejecuta el nivel llamando al flujo compartido y recibe el resumen con lo que trajo.',
          api:'<code>TS_SEARCH_CANDIDATES</code> con <code>source=\'ai_search\'</code>.',
          out:'<code>{ candidates_found, candidates_otw, pages_used, profiles_scraped }</code>' } },

    { id:'ifb', n:'Evaluate Broadening\nThreshold Conditional', t:'if', x:1330, y:250,
      d:{ does:'Decide si el resultado alcanza o si hay que ampliar a un criterio más amplio.',
          out:'<b>true</b> → amplía · <b>false</b> → cierra y responde.',
          note:'Condición: <code>candidates &lt; min_results</code> AND <code>pages_remaining &gt; 0</code> AND <code>level &lt; 3</code>. El mínimo sale de la configuración (HUSRP-1.1-BE).' } },

    { id:'adv', n:'Advance Query\nLevel Code', t:'code', x:1330, y:450,
      d:{ does:'Pasa al criterio siguiente y descuenta las páginas que ya se gastaron, antes de volver a armar el payload.',
          op:`level += 1
pages_remaining[city] -= pages_used[city]`,
          note:'<b>La ampliación gasta el presupuesto que sobró, nunca pide páginas adicionales.</b> Por eso el costo que la plataforma le mostró al reclutador es un techo real y no un piso. Si el nivel 1 consumió todo, no se amplía.' } },

    { id:'close', n:'Close Search\nExecution Database', t:'postgres', x:1520, y:250,
      d:{ does:'Sella la ejecución con lo que terminó gastando y hasta qué criterio llegó.',
          op:`UPDATE solvo_pipeline.ai_searches
SET status = 'done', level_reached = $1,
    cost_real = $2, candidates_found = $3, finished_at = NOW()
WHERE id = $4;`,
          note:'El <code>cost_real</code> se arma sumando lo que cada ejecución del flujo registró en el log. Es lo que descuenta del techo de presupuesto.' } },

    { id:'resp', n:'Respond To\nPlatform Webhook', t:'respond', x:1710, y:250,
      d:{ does:'Le contesta a la plataforma cómo terminó la búsqueda, para que el listado muestre el estado correcto.',
          op:`{ "status": "done" | "empty" | "partial" | "error",
  "level_reached": 2,
  "candidates_found": 34,
  "pages_used": 8,
  "cost_real": 1.55,
  "message": "Se amplió el criterio para encontrar más candidatos." }`,
          note:'Con cero resultados devuelve <code>status=\'empty\'</code> y el motivo, para que el listado muestre el estado vacío en vez de un error. Si la fuente limitó el uso a mitad de camino devuelve <code>partial</code> con lo que alcanzó a traer.' } },

    { id:'logend', n:'Log Search Completion\nSubworkflow', t:'subwf', x:1710, y:100,
      d:{ does:'Cierra la traza contrastando lo que se estimó contra lo que se gastó.',
          op:`usage_amount = <páginas abiertas totales>
metadata = { cost_estimated, cost_real, level_reached,
             cities, candidates, emails_captured }`,
          note:'Alimenta el descuento del techo de presupuesto y permite calibrar la estimación con la operación real.' } },
  ],
  links: [
    ['wh','set'],['set','agent'],['agent','build'],['build','crit'],['crit','lvl'],
    ['lvl','call'],['call','ifb'],
    ['ifb','adv',{label:'true'}],['ifb','close',{label:'false'}],
    ['adv','lvl',{back:true,label:'siguiente criterio'}],
    ['close','resp'],
    ['build','logtok',{dashed:true}],['close','logend',{dashed:true}],
    ['model','agent',{sub:true}],
  ],
};

const WFS = [SEARCH, CRON, AI];

/* ======================= Canvas ======================= */
const NW = 96, NWS = 64;
const box = n => n.small ? NWS : NW;
const cx = n => n.x + box(n) / 2;
const cy = n => n.y + box(n) / 2;

let activeWF = 'search', selected = null;
let view = { z: 1, x: 0, y: 0 };

const curWF = () => WFS.find(w => w.key === activeWF);
const nodeById = id => curWF().nodes.find(n => n.id === id);
const detailOf = n => n.sameAs ? nodeById(n.sameAs).d : n.d;

function icon(t, size) {
  const s = T[t] || T.code;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${s.c}"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${s.i}"/></svg>`;
}

function nodeEl(n) {
  const s = T[n.t] || T.code, w = box(n);
  return `<div class="n8n-node${n.trigger ? ' is-trigger' : ''}${n.small ? ' is-sub' : ''}"
      data-id="${n.id}" style="left:${n.x}px; top:${n.y}px; width:${w}px; height:${w}px; --nc:${s.c}">
      ${icon(n.t, n.small ? 22 : 30)}
      <span class="n8n-port in"></span><span class="n8n-port out"></span>
    </div>
    <div class="n8n-label" data-for="${n.id}" style="left:${n.x - 38}px; top:${n.y + w + 7}px; width:${w + 76}px;">
      <span class="lbl-n">${n.n.replace(/\n/g, '<br>')}</span>
    </div>`;
}

function path(a, b, o = {}) {
  if (o.sub) return `M${cx(a)},${a.y} C${cx(a)},${a.y - 40} ${cx(b)},${cy(b) + 60} ${cx(b)},${b.y + box(b)}`;
  if (o.back) {
    const low = Math.max(cy(a), cy(b)) + 165;
    return `M${cx(a)},${a.y + box(a)} C${cx(a)},${low} ${cx(b)},${low} ${cx(b)},${b.y + box(b)}`;
  }
  const x1 = a.x + box(a), y1 = cy(a), x2 = b.x, y2 = cy(b);
  const dx = Math.max(50, Math.abs(x2 - x1) / 2);
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
}
const midOf = (a, b, o) => o.back
  ? { x: (cx(a) + cx(b)) / 2, y: Math.max(cy(a), cy(b)) + 126 }
  : { x: (a.x + box(a) + b.x) / 2, y: (cy(a) + cy(b)) / 2 };

const extent = wf => ({
  w: Math.max(...wf.nodes.map(n => n.x + box(n))) + 150,
  h: Math.max(...wf.nodes.map(n => n.y + box(n))) + 250,
});

function renderCanvas() {
  const wf = curWF(), byId = Object.fromEntries(wf.nodes.map(n => [n.id, n])), e = extent(wf);
  const edges = wf.links.map(([f, t, o = {}]) => {
    const a = byId[f], b = byId[t], m = midOf(a, b, o);
    return `<path d="${path(a, b, o)}" class="edge${o.dashed ? ' dashed' : ''}${o.back ? ' back' : ''}${o.sub ? ' sub' : ''}" marker-end="url(#ar)"/>` +
      (o.label ? `<text class="edge-label" x="${m.x}" y="${m.y - 7}" text-anchor="middle">${o.label}</text>` : '');
  }).join('');
  document.getElementById('stage').innerHTML = `
    <div class="n8n-canvas" id="cv" style="width:${e.w}px; height:${e.h}px;">
      <svg class="n8n-edges" width="${e.w}" height="${e.h}">
        <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>${edges}
      </svg>${wf.nodes.map(nodeEl).join('')}
    </div>`;
  document.getElementById('wfSub').textContent = wf.sub;
  document.getElementById('wfSub').title = wf.intro;
  renderRelated();
  fit();
  closeDetail();
}

/* ---- Navegación ---- */
function applyView() {
  const cv = document.getElementById('cv'); if (!cv) return;
  cv.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.z})`;
  document.getElementById('zoomPct').textContent = Math.round(view.z * 100) + '%';
}
function fit() {
  const vp = document.getElementById('stage'), e = extent(curWF());
  const z = Math.min(1, (vp.clientWidth - 32) / e.w, (vp.clientHeight - 32) / e.h);
  view = { z: Math.max(0.22, z), x: 16, y: 16 };
  applyView();
}
function zoomBy(f, ox, oy) {
  const vp = document.getElementById('stage').getBoundingClientRect();
  const z = Math.min(2, Math.max(0.22, view.z * f));
  const px = (ox ?? vp.width / 2) - view.x, py = (oy ?? vp.height / 2) - view.y;
  view.x -= px * (z / view.z - 1); view.y -= py * (z / view.z - 1);
  view.z = z; applyView();
}
function initNav() {
  const vp = document.getElementById('stage');
  let drag = null;
  vp.addEventListener('mousedown', ev => {
    if (ev.target.closest('.n8n-node')) return;
    drag = { x: ev.clientX - view.x, y: ev.clientY - view.y }; vp.classList.add('grabbing');
  });
  window.addEventListener('mousemove', ev => {
    if (!drag) return; view.x = ev.clientX - drag.x; view.y = ev.clientY - drag.y; applyView();
  });
  window.addEventListener('mouseup', () => { drag = null; vp.classList.remove('grabbing'); });
  vp.addEventListener('wheel', ev => {
    ev.preventDefault();
    const r = vp.getBoundingClientRect();
    if (ev.ctrlKey || ev.metaKey) zoomBy(ev.deltaY < 0 ? 1.12 : 0.89, ev.clientX - r.left, ev.clientY - r.top);
    else { view.x -= ev.deltaX; view.y -= ev.deltaY; applyView(); }
  }, { passive: false });
  document.getElementById('zIn').onclick = () => zoomBy(1.2);
  document.getElementById('zOut').onclick = () => zoomBy(0.83);
  document.getElementById('zFit').onclick = fit;
}

function jumpTo(id) {
  const n = nodeById(id); if (!n) return;
  const vp = document.getElementById('stage');
  view.x = vp.clientWidth / 2 - cx(n) * view.z;
  view.y = vp.clientHeight / 2 - cy(n) * view.z;
  applyView(); openDetail(id);
}
function renderSearch(q) {
  const list = document.getElementById('nodeFind'), t = q.trim().toLowerCase();
  if (!t) { list.innerHTML = ''; list.classList.remove('open'); return; }
  const hits = curWF().nodes.filter(n => n.n.toLowerCase().includes(t) || n.t.includes(t));
  list.innerHTML = hits.length
    ? hits.map(n => `<button class="find-hit" data-go="${n.id}">${n.n.replace(/\n/g, ' ')}<span class="find-t">${n.t}</span></button>`).join('')
    : '<div class="find-empty">Sin coincidencias en este workflow</div>';
  list.classList.add('open');
}

function renderTabs() {
  document.getElementById('tabs').innerHTML = WFS.map(w =>
    `<button class="wf-tab${w.key === activeWF ? ' on' : ''}" data-wf="${w.key}">
       <span class="wf-num" style="background:${HU_C[w.hu]}">${w.hu.replace('HUSRP-', '')}</span>${w.name}</button>`).join('');
}

function markSelected() {
  document.querySelectorAll('.n8n-node').forEach(n => n.classList.toggle('sel', n.dataset.id === selected));
  document.querySelectorAll('.n8n-label').forEach(l => l.classList.toggle('sel', l.dataset.for === selected));
}

function closeDetail() {
  selected = null;
  document.getElementById('detail').classList.remove('open');
  markSelected();
}

/* Las decisiones transversales se leen en el mismo panel lateral. */
function openNotes() {
  selected = null; markSelected();
  document.getElementById('detail').innerHTML = `
    <div class="d-head">
      <div class="d-titles">
        <div class="d-name">Decisiones que atraviesan los tres workflows</div>
        <div class="d-meta">contexto del refactor</div>
      </div>
      <button class="d-close" data-close aria-label="Cerrar">&times;</button>
    </div>
    <div class="d-body"><ul class="d-notes">
      <li><b>Un solo flujo de búsqueda.</b> <code>TS_SEARCH_CANDIDATES</code> recibe <code>combinations[]</code> ya resuelto y no consulta <code>search_profiles</code> ni <code>parameters</code>. Quien lo llama decide qué buscar; él solo ejecuta. La única rama que distingue al llamador es la que ata candidatos a una búsqueda asistida.</li>
      <li><b>La cola deja de truncarse.</b> <code>solvo_pipeline.search_queue</code> pasa a particionarse por <code>execution_id</code>. Sin eso, un cron y una búsqueda asistida simultáneos se borran la cola mutuamente.</li>
      <li><b>Tablas que toca</b>: <code>solvo_pipeline.candidates</code> (upsert por <code>linkedin_url</code>), <code>solvo_pipeline.search_queue</code>, <code>solvo_pipeline.ai_searches</code> y <code>solvo_pipeline.ai_search_candidates</code> (nuevas, HUSRP-0.1), y <code>public.execution_logs</code> vía el logger.</li>
      <li><b>APIs</b>: actor Apify <code>M2FMdjRVeF1HPGFcc</code> para la búsqueda, <code>LpVuK3Zozwuipa5bp</code> vía <code>TS_EMAIL_FINDER</code> para el correo, OpenAI <code>gpt-5-mini</code> para la interpretación. Las tres cuentas ya existen.</li>
      <li><b>La cuota del actor es por hora y compartida</b> entre los dos disparadores. <code>startPage</code> permite retomar sin repagar páginas ya traídas.</li>
      <li><b>Prefijo <code>AS_</code></b> propuesto para el disparador de la búsqueda asistida, distinguiéndolo de <code>TS_</code>, <code>AU_</code> y <code>ENRICH_</code>. Decisión de nomenclatura a confirmar.</li>
    </ul></div>`;
  document.getElementById('detail').classList.add('open');
}

function openDetail(id) {
  const n = nodeById(id); if (!n) return;
  selected = id;
  const d = detailOf(n) || {};
  const row = (k, v) => v ? `<div class="d-row"><span class="d-key">${k}</span><div class="d-val">${v}</div></div>` : '';
  const same = n.sameAs ? `<div class="d-same">Idéntico a <b>${nodeById(n.sameAs).n.replace(/\n/g, ' ')}</b>; solo cambia la credencial de Apify.</div>` : '';
  document.getElementById('detail').innerHTML = `
    <div class="d-head">
      <span class="d-icon">${icon(n.t, 24)}</span>
      <div class="d-titles">
        <div class="d-name">${n.n.replace(/\n/g, ' ')}</div>
        <div class="d-meta"><code>${n.t}</code> · <span style="color:${HU_C[curWF().hu]}">${curWF().hu}</span> · ${curWF().name}</div>
      </div>
      <button class="d-close" data-close aria-label="Cerrar">&times;</button>
    </div>
    <div class="d-body">
      ${same}
      ${d.does ? `<p class="d-does">${d.does}</p>` : ''}
      ${row('Recibe', d.in)}
      ${row('Devuelve', d.out)}
      ${d.op ? `<div class="d-row"><span class="d-key">Operación</span><pre class="d-op">${d.op.replace(/</g, '&lt;')}</pre></div>` : ''}
      ${row('API / workflow', d.api)}
      ${row('A tener en cuenta', d.note)}
    </div>`;
  document.getElementById('detail').classList.add('open');
  markSelected();
}

document.addEventListener('click', e => {
  const tab = e.target.closest('.wf-tab');
  if (tab) { activeWF = tab.dataset.wf;
    document.getElementById('findInput').value = ''; renderSearch('');
    renderTabs(); renderCanvas(); return; }
  const go = e.target.closest('[data-go]');
  if (go) { jumpTo(go.dataset.go); document.getElementById('nodeFind').classList.remove('open'); return; }
  if (e.target.closest('[data-close]')) { closeDetail(); return; }
  if (e.target.closest('#notesBtn')) { openNotes(); return; }
  if (e.target.closest('#aboutBtn')) { openHU(curWF().hu); return; }
  const chip = e.target.closest('.rel-chip');
  if (chip) { openHU(chip.dataset.hu); return; }
  const node = e.target.closest('.n8n-node');
  if (node) { openDetail(node.dataset.id); return; }
  const lbl = e.target.closest('.n8n-label');
  if (lbl) { openDetail(lbl.dataset.for); return; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDetail();
  if (e.key === '0' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); fit(); }
});

/* Solo las HUs que este flujo realmente toca, agrupadas por cómo lo tocan. */
function renderRelated() {
  const wf = curWF();
  const byHow = {};
  (wf.rel || []).forEach(r => (byHow[r.how] = byHow[r.how] || []).push(r.id));
  document.getElementById('related').innerHTML = Object.entries(byHow).map(([how, ids]) => `
    <div class="rel-group">
      <span class="rel-how">${how}</span>
      ${ids.map(id => {
        const w = WFS.find(x => x.hu === id);
        const info = w ? { n: w.huName, c: HU_C[id] } : HU_INFO[id];
        return `<button class="rel-chip" data-hu="${id}" title="${info.n}">
          <span class="rel-dot" style="background:${info.c}"></span>
          <span class="rel-id">${id}</span><span class="rel-n">${info.n}</span></button>`;
      }).join('')}
    </div>`).join('');
}

/* La ficha de una HU relacionada se lee en el mismo panel lateral. */
function openHU(id) {
  const w = WFS.find(x => x.hu === id);
  const info = w
    ? { n: w.huName, c: HU_C[id], g: 'Flujo n8n', d: w.intro }
    : HU_INFO[id];
  selected = null; markSelected();
  document.getElementById('detail').innerHTML = `
    <div class="d-head">
      <div class="d-titles">
        <div class="d-name">${info.n}</div>
        <div class="d-meta"><span style="color:${info.c}">${id}</span> · ${info.g}</div>
      </div>
      <button class="d-close" data-close aria-label="Cerrar">&times;</button>
    </div>
    <div class="d-body">
      <p class="d-does">${info.d}</p>
      ${w ? `<div class="d-row"><span class="d-key">Workflow</span><div class="d-val"><code>${w.name}</code> — abrí su pestaña para ver los nodos.</div></div>` : ''}
    </div>`;
  document.getElementById('detail').classList.add('open');
}

renderTabs(); renderCanvas(); initNav();
document.getElementById('findInput').addEventListener('input', e => renderSearch(e.target.value));
window.addEventListener('resize', () => applyView());
