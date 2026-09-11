# SPEC.md — IApro Leads Scraper (Make.com)

**Versión 4.0 — Make.com** · *Sustituye la v3 (script CLI en Node.js).*

Automatización en Make.com que extrae contactos de LinkedIn en batch: lee búsquedas desde una Google Sheet, consulta Google vía SerpAPI, raspa cada perfil con Apify, extrae correo por regex y escribe los resultados en Google Sheets con **una pestaña por búsqueda**.

**Uso inicial:** apoyo a la búsqueda de empleo de Carolina Chandía (HSEC / Ambiental, Gran Concepción). Extraer una base de contactos con correo para prospección directa, con tres frentes: reclutadores y headhunters de la zona, jefaturas de Recursos Humanos, y pares o jefes de áreas HSEC / Sustentabilidad de empresas grandes (incluye correos corporativos de `arauco.cl` y `cmpc.cl`). Las 12 búsquedas semilla vienen en el archivo `busquedas.txt` adjunto — su contenido se carga manualmente en la Google Sheet `Busquedas` (una fila por búsqueda, ignorando la línea `#COLUMNAS:` y los comentarios).

**Rol en la fábrica SaaS:** escenario reutilizable en Make.com. El blueprint JSON exportado queda versionado (por ejemplo, en `/make-blueprints/linkedin-scraper.json`) para replicar en otros SaaS futuros de IApro.

---

## Alcance funcional

El escenario debe:

0. Leer todas las filas activas de la Google Sheet de Búsquedas (hoja `Busquedas`). Cada fila es una búsqueda con 5 campos: `keyword`, `ciudad`, `pais`, `dominio`, `nombre_hoja`.
1. Para cada búsqueda, consultar Google vía SerpAPI con `site:linkedin.com/in "{dominio}" "{keyword}" "{ciudad}"`.
2. Paginar los resultados (N páginas configurables desde el trigger).
3. Por cada URL de perfil de LinkedIn encontrada, invocar Apify (actor `dev_fusion/linkedin-profile-scraper`) para raspar el perfil.
4. Extraer los campos definidos en el catálogo cerrado (correo por regex, resto por mapeo directo).
5. Deduplicar por URL contra las filas ya presentes en la hoja destino.
6. Escribir cada perfil como una fila nueva en la Google Sheet de Salida, en la pestaña indicada por `nombre_hoja`. Si la pestaña no existe, crearla con los encabezados.

---

## Stack

| Componente | Elección |
|---|---|
| Orquestador | Make.com |
| Input | Google Sheets — hoja `Busquedas` |
| Búsqueda Google | SerpAPI (módulo HTTP `Make a request`) |
| Scraping de perfiles | Apify (módulo oficial `Run an Actor`) |
| Output | Google Sheets — un archivo, una pestaña por `nombre_hoja` |
| Contadores y estado | Data Store de Make |
| Credenciales | Connections nativas de Make |

Sin código propio. Sin servidor. El escenario corre en la nube de Make.

---

## Google Sheet de Búsquedas (input)

Hoja `Busquedas` con encabezados en fila 1:

| A: keyword | B: ciudad | C: pais | D: dominio | E: nombre_hoja | F: activa |
|---|---|---|---|---|---|

Reglas:

- `pais`: código ISO de 2 letras (`CL`, `AR`, `PE`, …).
- `nombre_hoja`: único, máximo 31 caracteres, sin `/ \ ? * [ ]`.
- `activa`: `TRUE` para procesar la búsqueda, `FALSE` para saltarla (permite archivar sin borrar).
- Si una fila está malformada (falta ciudad o país), se salta con un warning en el Data Store; no aborta el escenario.

## Google Sheet de Salida (output)

Un solo archivo con **una pestaña por búsqueda activa**, nombrada según `nombre_hoja`. Encabezados en fila 1, en el orden del catálogo fijo abajo. Si la pestaña no existe, el escenario la crea antes de escribir la primera fila.

---

## Catálogo de columnas (cerrado)

En v1 el escenario escribe siempre las 9 columnas del catálogo, en este orden fijo:

| # | Columna | Origen |
|---|---|---|
| 1 | `nombre` | Apify `fullName` |
| 2 | `cargo_actual` | Apify `experience[0].title` |
| 3 | `empresa_actual` | Apify `experience[0].companyName` |
| 4 | `ubicacion` | Apify `location` |
| 5 | `correo` | regex sobre Apify `summary` / `about` |
| 6 | `url_linkedin` | URL del resultado SerpAPI |
| 7 | `headline` | Apify `headline` |
| 8 | `resumen_about` | Apify `summary` / `about` (texto completo) |
| 9 | `fecha_extraccion` | timestamp ISO 8601 al escribir la fila |

Si Apify no devuelve un campo, la celda queda vacía. La única columna que filtra el registro es `correo`: si no se encuentra correo, el perfil se descarta.

*v1 no permite subset de columnas: todas las hojas usan el catálogo completo. Ese cambio se evalúa en v2.*

---

## Parámetros del escenario

Se configuran en un módulo `Set multiple variables` al inicio del escenario:

| Variable | Default | Descripción |
|---|---|---|
| `max_pages` | `3` | Cuántas páginas de Google por búsqueda |
| `results_per_page` | `15` | Resultados por página de SerpAPI |
| `start_offset` | `0` | Offset inicial en Google |
| `sleep_paginacion_s` | `2` | Espera entre paginaciones (SerpAPI) |
| `sleep_perfil_s` | `10` | Espera entre perfiles (Apify) |
| `dedupe_activo` | `TRUE` | Si `TRUE`, consulta la hoja destino antes de escribir |

Estos parámetros aplican a **todas** las búsquedas del archivo por igual (v1 no soporta paginación distinta por búsqueda).

---

## Flujo del escenario — módulos en orden

**A. Preparación**

1. `Set multiple variables` — carga los defaults de la tabla anterior.
2. `Google Sheets: Search Rows` — lee filas de la hoja `Busquedas` donde `activa = TRUE`.
3. `Set variable` — calcula `total_busquedas` y `busquedas_serpapi_estimadas = total × max_pages`. Guarda el estimado en el Data Store.

**B. Loop por búsqueda**

4. `Iterator` — cada bundle = una búsqueda.
5. `Set variable` — arma la query: `site:linkedin.com/in "{dominio}" "{keyword}" "{ciudad}"` (comillas literales, no de escape).

**C. Loop de paginación**

6. `Repeater` — de `1` a `max_pages`.
7. `Set variable` — `start = start_offset + (repeater.i - 1) × results_per_page`.
8. `HTTP: Make a request` — GET a `https://serpapi.com/search.json` con parámetros:
   - `engine=google`
   - `q={query}`
   - `start={start}`
   - `num={results_per_page}`
   - `gl={pais}`
   - `hl=es`
   - `api_key={{SERPAPI_KEY}}`
9. `Iterator` — sobre `organic_results[]`.
10. `Filter` — solo pasa si `link` empieza con `https://www.linkedin.com/in/` o `https://{pais}.linkedin.com/in/`.

**D. Scraping por perfil**

11. `Sleep` — `sleep_perfil_s` segundos.
12. `Apify: Run an Actor` — actor `dev_fusion/linkedin-profile-scraper`, input:
    ```
    {
      "profileUrls": ["{link}"],
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"],
        "apifyProxyCountry": "{pais}"
      }
    }
    ```
    Modo síncrono (`Wait for finish`).
13. `Apify: Get Dataset Items` — trae el resultado del run.

**E. Extracción y filtro de correo**

14. `Set variable` — `correo = match(summary, "[\\w.+-]+@[\\w-]+\\.[\\w.-]+", "g")` (primer match; vacío si no hay).
15. `Filter` — solo pasa si `correo` no está vacío.

**F. Deduplicación**

16. `Google Sheets: Search Rows` — en la pestaña `{nombre_hoja}`, buscar filas donde `url_linkedin = {link}`.
17. `Filter` — solo pasa si el paso anterior devolvió cero filas.

**G. Escritura**

18. `Google Sheets: Add a Row` — en la pestaña `{nombre_hoja}`, con los 9 campos del catálogo. Si la pestaña no existe, un módulo previo (`Google Sheets: Add a Sheet`) la crea con los encabezados en fila 1.

**H. Sleep entre paginaciones**

19. `Sleep` — `sleep_paginacion_s` segundos al final del Repeater.

**I. Reporte final**

20. `Data Store: Set` — incrementa contadores por pestaña: `procesados`, `con_correo`, `duplicados`, `errores`.
21. `Notifications` (email o mensaje interno) — envía el reporte consolidado al terminar toda la corrida.

---

## Connections en Make.com

Antes de correr el escenario, crea estas conexiones en `Connections`:

1. **Google Sheets** — cuenta OAuth con acceso al archivo de Búsquedas y al de Salida.
2. **Apify** — token de API (Apify → Settings → Integrations → API tokens).
3. **SerpAPI** — no tiene connection nativa en Make. Guardar la API key como variable global del escenario y referenciarla en el módulo HTTP.

Las claves **no aparecen** en el blueprint JSON exportado — Make las reemplaza por referencias a las connections del entorno donde se importa.

---

## Manejo de errores

- **Módulos HTTP (SerpAPI) y Apify** — agregar `Error handler → Break` con `Retries = 3` y backoff exponencial (`1s → 3s → 9s`) para códigos `429` y `5xx`.
- **Perfil que falla los 3 reintentos** — usar `Resume` con bundle vacío para no cortar el loop; incrementar el contador `errores` en el Data Store.
- **Búsqueda que falla completa** (ejemplo: SerpAPI cae a mitad) — `Resume` con bundle vacío; log en Data Store y continuar con la siguiente búsqueda del Iterator.
- **SerpAPI devuelve cuota agotada** — `Break` con `Rollback = false`; guardar reporte parcial y abortar el resto del escenario.

---

## Criterios de aceptación

- El escenario corre de principio a fin con `Run once` sin intervención.
- El archivo de Salida tiene una pestaña por cada búsqueda con `activa = TRUE`, con los encabezados del catálogo en fila 1 y los datos abajo.
- Correr el escenario dos veces no duplica filas (dedupe por `url_linkedin`).
- Si una fila de `Busquedas` está malformada (falta ciudad o país), se salta con warning; no aborta el escenario completo.
- El escenario imprime el consumo estimado de SerpAPI al iniciar y el consumo real al terminar (en el Data Store y en la notificación final).
- El blueprint JSON exportado no contiene credenciales — solo referencias a `connections[N]`.
- La columna `activa` de la Sheet de Búsquedas funciona como filtro real.

---

## Fuera de alcance (v1)

- UI web para editar búsquedas (se usa directamente la Google Sheet).
- Almacenamiento en Supabase o base de datos.
- Envío automático de correos a los leads.
- Enriquecimiento con datos fuera del catálogo (teléfono, RUT, giro).
- Columnas distintas por pestaña en la misma corrida.
- Paginación distinta por búsqueda.
- Ejecución programada (v1 solo manual, con `Run once`).

---

## Cómo pedir el blueprint JSON

Cuando este SPEC esté aprobado, pídele a Claude:

> *"Con el SPEC v4 aprobado, entrégame el blueprint JSON del escenario listo para importar en Make (Import blueprint)."*

Después, en Make.com:

1. Entra a `Scenarios` → botón `Create a new scenario`.
2. En el canvas vacío, clic en el menú de tres puntos `⋯` → `Import blueprint`.
3. Sube el `.json` o pega su contenido.
4. Antes del primer `Run once`, configura:
   - Las tres connections (Google Sheets, Apify, SerpAPI).
   - Las URLs (o IDs) de las dos Google Sheets: la de Búsquedas y la de Salida.
5. Corre con `Run once` la primera prueba (con una sola búsqueda activa y `max_pages = 1`).

*Nota: el blueprint JSON de Make se importa **en Make.com** — no en Claude Code. Claude Code se usaría por separado si más adelante quisieras, por ejemplo, un script de post-procesamiento del Excel exportado desde la Sheet de Salida.*
