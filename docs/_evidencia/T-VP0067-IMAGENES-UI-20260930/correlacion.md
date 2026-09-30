# CORRELACIÓN 1:1 UI ↔ PDF · T-VP0067-IMAGENES-UI-20260930

> Ambos consumidores leen LAS MISMAS 16 filas de `TX_Adjuntos` (origen único §4): la vista vía
> `leerFotosCaptura` → `repartirFotos` (filtro `subido_por="Tasador"`, categoría =
> `descripcion`), el PDF vía bloque 7 canónico → `resolverImagenes` (mismas filas, mismo campo).
> La correlación es por construcción y se verificó por relectura real:

| # | Fila sembrada (record) | Categoría (id en `descripcion`) | UI: bucket sección 7 | PDF: posición grilla + caption |
|---|---|---|---|---|
| 0 | recM3pvhvf42qe3cb | mapa_ubicacion | Mapa de Ubicación (1) | i=0 · "Mapa de Ubicación" |
| 1 | recTlZIupiHCyf0Qy | Planificación (custom) | Planificación (1) | i=1 · "Planificación" |
| 2 | recTMcPu6X5GqMLdP | fachada_exterior | Fachada/Exterior | i=2 · "Fachada / Exterior" |
| 3 | reckuOQ2EQ8II75Kj | fachada_exterior | Fachada/Exterior | i=3 · "Fachada / Exterior" |
| 4 | recLz5v9v1QyMxrY0 | living_comedor | Living/Comedor | i=4 · "Living / Comedor" |
| 5 | recHjxePGcJ1gM0c1 | living_comedor | Living/Comedor | i=5 · "Living / Comedor" |
| 6 | recs57FpScfoe639m | cocina | Cocina (1) | i=6 · "Cocina" |
| 7 | recx3uCAlp6rBtnhT | banos | Baños | i=7 · "Baños" |
| 8 | recG6jAo8CK2EASDc | habitaciones | Habitaciones | i=8 · "Habitaciones" |
| 9 | recHwkvir7mj9uAIB | banos | Baños | i=9 · "Baños" |
| 10 | recQ2d3LLiZf0qmK1 | habitaciones | Habitaciones | i=10 · "Habitaciones" |
| 11 | rec5t74bqVac4LiSJ | habitaciones | Habitaciones | i=11 · "Habitaciones" |
| 12 | recoGxiYxeUs8kJlK | living_comedor | Living/Comedor | i=12 · "Living / Comedor" |
| 13 | recxOSsax7KWH8QVU | fachada_exterior | Fachada/Exterior | i=13 · "Fachada / Exterior" |
| 14 | rec5KpO655oCqDKYQ | fachada_exterior | Fachada/Exterior | i=14 · "Fachada / Exterior" |
| 15 | receKlrASmHqsxGLO | fachada_exterior | Fachada/Exterior | i=15 · "Fachada / Exterior" |

**16/16 correlacionadas.** La imagen es la MISMA en ambos lados: el `thumbnail_url` (data-URI)
de cada fila es la fuente de la miniatura de la UI (`FotoMiniatura`) y de la ranura de grilla
del PDF (`grillaDesdeFotosReales`). El caption del PDF y el nombre del bucket de la UI salen
del mismo catálogo `CATEGORIAS_FOTO` (labels; custom pasa tal cual) — cero strings duplicados.

**Conteos por categoría (idénticos en los tres consumidores):**
mapa_ubicacion 1 · Planificación 1 · fachada_exterior 5 · living_comedor 3 · cocina 1 ·
banos 2 · habitaciones 3 · estacionamientos 0 · ofertas_comparables 0 (honestos: el gold
master no tiene fotos ahí; las comparables ocupan sus ranuras propias de Hoja 2, fuera del
registro). Total UI esperado: **"16 fotografías"**.

Verificación fuente: relectura Airtable post-siembra (reparto exacto arriba) + contexto
ensamblado real (captions/orden, `/tmp/contexto_vp67.json` de la OLA 2) + PDF renderizado
([`pdf-imagenes-check.md`](pdf-imagenes-check.md)).
