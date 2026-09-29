# PLAN — T-PDF-IDENTICO-20260927

> Fase 1 consolidada el 28-sep-2026 a partir de 7 agentes en paralelo (Arquitecto, Extractor,
> Auditor XLSM, Diseño, QA, Seguridad, Frontend). Rama del plan: `plan/T-PDF-IDENTICO-20260927`.
> Ejecución: `feat/T-PDF-IDENTICO-20260927`. Sin commits (los hace Sergio).

## §1 Resumen

Llevar el PDF de VP-2026-0067 (`recmMzeu3eWGxyXsf`) al 100% idéntico al informe de referencia
MET-6283 (`docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf`) en datos,
imágenes y diseño, y dejar la imprenta (E2/E3) encendida. Cuatro brechas confirmadas:
(1) imágenes ausentes, (2) Hoja 3 vacía, (3) CI-057 + dólar (161% → −3%/36%; 30,91 → 33,64/24,08;
US$ vacío con 890,33), (4) datos de prueba ≠ reales.

## §2 Alcance

**SÍ**: plantilla Carbone v2 (`PLANTILLA_MET_v2.docx`) con todas las ranuras de imagen y la Hoja 3
cableada · carga de las 35 imágenes extraídas en la cadena de render · datos exactos del XLSM en
VP-0067 · fix CI-057 (dos promedios por bloque + columna US$) validado con harness antes de tocar
C_Formulas · corrida REAL punta a punta (E2→Carbone→E3→Dropbox→Airtable) · batería QA T0–T6 ·
auditor ciego · GO-LIVE E2/E3.

**NO**: reautorizar Dropbox (OAuth de Sergio — paso manual) · reactivar AT03 (queda OFF; decisión
de Sergio) · tocar VP-2026-0062 (real, `visitada`), VP-2026-0066 (oráculo), las 47 canceladas,
otras filas de C_Formulas, escenarios activos SC01/SC-Asignar/SC-Edicion/SC-RF09, SC05 ·
commits/push · crear tablas nuevas en Airtable.

## §3 Diseño

### 3.1 Cadena (medida por Agente 1)

Botón "Enviar informe" (`components/tasador/informe-preview.tsx:807-815`) → `POST
/api/tasaciones/[id]/generar-pdf` (`route.ts:29-66`, guard 409 estados ≠ `calculada|pdf_listo`) →
ensambla `InformeContexto` (`lib/informe/ensamblador.ts` sobre `lib/tasador/lectura-informe.ts`) →
POST `MAKE_WEBHOOK_E2` → **E2** 5750023 (webhook → `POST api.carbone.io/render/{templateId}`,
`carbone-version: 4`, templateId hardcodeado en la URL del módulo 2) → **E3** 5791413 (GET render
`parseResponse:false` → Dropbox `/VProperty/Tasaciones/` → `pdf_final_url` + `estado=pdf_listo` +
fila TX_DocumentosGenerados). Ambos hoy **INACTIVOS** (verificado por API). `CARBONE_TEMPLATE_ID`
vive en DOS lugares: URL del módulo 2 de E2 y `.env.local` — re-apuntar ambos.
**Cero cambios de UI** (Agente 7): la app lee `MAKE_WEBHOOK_E2` en runtime; Regla D y §6 ya OK.

### 3.2 Mecanismo de imágenes Carbone v4

Placeholder de imagen real en el .docx + tag `{d.xxx}` en el alt-text; el valor debe ser URL
pública o data-URI base64. Hoy el payload trae `fotos=[]`, `mapa/firma/logo=null` y `url_dropbox`
es path interno no descargable → **contrato v2: data-URI base64 en el payload** (fotos comprimidas
a ~150-300 KB; payload total pocos MB, límite Carbone ~60 MB). Logo: embebido estático en el .docx.

### 3.3 Contrato de contexto v2 (nuevo nodo `imagenes` + grilla `fotos`)

| Tag en plantilla v2 | Contenido (data-URI) | Asset |
|---|---|---|
| `{d.imagenes.mapaUbicacion}` | Hoja 1 recuadro Ubicación (arriba-derecha) | `h1_mapa_ubicacion.jpg` |
| `{d.imagenes.fachada}` | Hoja 1 FOTO FACHADA | `h1_fachada.jpg` |
| `{d.imagenes.firma}` | firma tasadora | `firma.jpg` |
| `{d.imagenes.refMapa}` | Hoja 2 mapa referencias (full-width) | `h2_mapa_referencias.png` |
| `{d.imagenes.ref1..ref3}` | Hoja 2 fotos referencias (= ofertas 1-3) | `h2_ref1..3.jpg` |
| `{d.fotos.fotos[i].url}` + `.categoria` | grillas 2×4 Hojas 4-5 (16 celdas con caption) | `h4_*` (incl. plano como "Planificación") + `h5_*` |
| `{d.imagenes.anexo1Plano/Esquema/CuadroSup/Emplazamiento/Aerea/MapaSii/InfoSii}` | Anexo 1 (7 ranuras) | `anexo1_*.jpg` |
| `{d.imagenes.anexo2RolAvaluo/Permiso/Escritura/NoExpropiacion/Recepcion/Tgr}` | Anexo 2 (**6** escaneados — incluye escritura Fojas 3312) | `anexo2_*.jpg` |

Productor: módulo nuevo `lib/informe/imagenes.ts` invocado por el ensamblador — intenta resolver
cada ranura desde TX_Adjuntos/Airtable (flujo vivo); fallback de esta tanda: assets del repo
(`docs/_artefactos/carbone/assets_met6283/`) para lo que no tenga columna, dejando marcado en el
cierre qué requeriría columna nueva.

### 3.4 Plantilla v2

Base: `docs/_artefactos/carbone/generar_plantilla_met_v1.py` → `generar_plantilla_met_v2.py`.
Aplica el top-10 del Agente 4: 8 páginas (Hoja 1 compacta, tipografía 4,8–6pt), mapa Hoja 1
arriba-derecha, mapa Hoja 2 nuevo, grillas de fotos con caption, ranuras Anexos 1-2, cajas de
borde fino sin grillas negras, layouts lado a lado (Rentabilidad↔CBR, firma↔legal), matriz de
habitaciones 15 col + totales, cajas PROPIEDAD ACOGIDA A / CUMPLE PLAN REGULADOR, rojos #FF0000
("HABITACIONAL", "Comentarios Relevantes"), énfasis cian #00B0F0, fila TASACION celeste #8DB4E1,
columnas N°+Fecha en REF.OFERTAS, matriz % uso de terrenos, banda azul Arteria Principal, sin
sufijo "(VP-2026-0067)". Paleta ya coincidente: #095085 · #8DB4E1 · #D3D3D3.

### 3.5 CI-057 + dólar (Agentes 3 y 6)

Aritmética exacta del XLSM (verificada numéricamente, sin ambigüedad):
- `UF/m²C = (TotalUF − UF/m²T×SupT − OOCC) / SupC` por comparable; UF/m²T es **input manual**
  (2,2 · 3,1 · 2,0 · 3,0 · 2,0 · 2,7 · 1,8) — dos columnas independientes.
- Promedio **por bloque** excluyendo ceros: ofertas → 33,64 · CBR → 24,08.
- `V/S = tasacionUFm2C / promedio − 1` con `tasacionUFm2C = 34,00 × 0,96 = 32,64` →
  −2,98% (imprime **-3%**) y +35,52% (imprime **36%**).
- Dólar: constante 1US$=$890,33; `US$ = $ / 890,33` (Reposición 414.344 · Incendio 399.115 ·
  Avalúo 381.667 · Remate 586.180 · Liquidación 743.998). UF=39.894,61.

Dónde se imprime hoy el 161%/30,91: determinar en Bloque 0 si sale de `lib/informe/fila-tasacion.ts`
(app) o de TX_Calculos (motor); corregir el productor real. Si toca `C_Formulas`
(`recFcpOeKjXNunBlj` promedio · `recliyqVJAGatkDw0` desviación — AT03 las lee al vuelo): sólo con
AT03 OFF (declarado por Sergio 27-sep; queda OFF al cierre) y validando antes con
`at03-harness.mjs` (⚠ escribe TX_Calculos/A_Eventos/estado — sólo sobre VP-0067). El split
ofertas/CBR puede exigir variables nuevas en el SCOPE de `AT03_Calculos_DAG.js` y/o filas nuevas
en C_Formulas (rollback: DELETE/`activa=false`). Dólar: sembrar en `H_PreciosUF.tipo_cambio_usd`
o input del render (CRON_UF_Diaria nunca activada).

## §4 Tabla oráculo

Fuente completa: informe del Agente 3 (integrado abajo en lo operativo) + `oraculo-met6283.md`.

**Datos que difieren en VP-0067** (valor exacto → celda XLSM): Nº interno `METLIFE -6283`
(FICHA SOLIC!F8+H8) · N° solicitud banco `900159638` (K13) · Tasador `Maria Eugenia Soto` (F10) ·
Visador `Héctor Martínez C.` · Ejecutivo `MONICA REYES PINTO` (F16) · Año Construcción `2024`
(derivado de Recepción) · Vida útil `70` / remanente `70 años` / renta `65 años` · Dirección
`LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO` (Tapa!E43) · Rol `N°882-40`
(E41) · Permiso `N°319  09/09/2020` (Antecedentes!J7, doble espacio) · Recepción `N°210  18/07/2024`
(J8) · Cliente `FRANCISCO JOSÉ VERGARA UNDURRAGA` RUT `16.610.203-0` · Institución `MetLife` ·
Objetivo `Refinanciamiento` · Fecha visita `13-04-2026` / visado `15-04-2026` · Comuna `Colina` /
`Metropolitana de Santiago` · Destino `HABITACIONAL` · Avalúo fiscal `$339.809.429` · Estado
`BUENO` · Fuente `DOM, Plano Catastro` · expropiación `NO`.

**Hoja 3 completa**: ver tablas (a)(b) del Agente 3 — Exigencias (PRMS/OGUC), Leyes
(DFL2/6071/9135 NO · 19537 SI), Plan Regulador (SI/SI/HABITACIONAL/NO CONTEMPLA), Sector
(Medio/Estable/Baja/Estrato Medio Alto/ABC1 SI-No Homogéneo, Rural, Asfalto, Tierra, Solerilla,
redes), Uso terrenos (10/0/45/1/0/1/35/8 %), Arteria `Caletera Oriente Gral San Martín`, Terreno
(5.024,86 · REGULAR · PLANO · NORTE · 29,95), Emplazamiento (CONDOMINIO/TIPICO/ADECUADA/AISLADA…),
Constructivas (ALBAÑILERÍA LADRILLO, ACERO VOLCANITA, PLANCHA METALICA, ESTUCO Y PINTURA, REJA
METALICA, OO.CC. TERRAZA DESCUBIERTA+QUINCHO+PISCINA+BODEGA, RADIADOR MURAL, MELAMINA, MELAMINA Y
CUARZO, LOSA NACIONAL CORRIENTE, NACIONAL CORRIENTE, MADERA, PVC TERMOPANEL), Terminaciones
(ENMADERADO/TIPO PISO DE INGENIERÍA/ESMALTE/ENLUCIDO · CERAMICO/TIPO PORCELANATO), Habitaciones
Nivel 1 (16 recintos · 4 dorm · 4 baños · 249,91 m²), Comodidades (16 ítems SI/NO).

**Mapa de imágenes**: 35 assets en `docs/_artefactos/carbone/assets_met6283/MANIFEST.md`
(ninguna ranura sin imagen; Anexo 2 = 6 escaneados; plano reutilizado en Hoja 4 "Planificación").

**Aritmética CI-057**: §3.5.

## §5 Pasos (Fase 2)

**B0 (secuencial)**: snapshots a `rollback.md` (VP-0067 dump completo, C_Formulas 2 filas
textuales, CARBONE_TEMPLATE_ID actual, blueprints E2/E3, hijos de VP-0067) + localizar el
productor del 161%/30,91.

**B1 (paralelo)**:
- B1a Plantilla v2 (`generar_plantilla_met_v2.py` → `.docx` → POST /template → nuevo templateId →
  `.env.local` + módulo 2 de E2 vía PATCH blueprint).
- B1b Imágenes (`lib/informe/imagenes.ts` + wiring ensamblador; carga a Airtable donde el
  contrato lo permita; fallback assets repo).
- B1c Datos VP-0067 + Hoja 3 (escrituras Airtable sólo sobre `recmMzeu3eWGxyXsf` y sus hijos).
- B1d CI-057 + dólar (harness local primero; C_Formulas sólo con AT03 OFF).
Escrituras Airtable sobre la misma tabla: secuencial (B1c antes que B1b si colisionan en
TX_Adjuntos).

**B2**: corrida REAL (start E2/E3 o run-once → POST generar-pdf → PDF v2 →
`PDF_generado_VP0067_v2.pdf`) + `verificar.py` (batería §6) + `regresion.md` /
`imagenes-check.md` / `diseno-checklist.md` + comparaciones lado a lado.

**B3**: auditor ciego (agente independiente, dictamina % de igualdad).
**B4**: rollback condicional por FAIL.
**GO-LIVE**: `POST /scenarios/{5750023,5791413}/start` + instrucción Dropbox Reauthorize para
Sergio. **Cierre**: CIERRE_*.md, aprendizajes.md, claude-out.txt (vía `/mnt/c/...`).

## §6 Tests (batería del Agente 5 — `verificar.py`)

T0-PAG (8 páginas exactas) · T1-DATOS (60+ literales del oráculo, incl. homologados 34,05…22,99 y
formas corregidas `11.218,80`) · T2-IMG (mínimos por página p1≥1 p2≥3 p3≥4 p4=0 **p5=8 p6=8**
p7≥4 p8≥5+1escritura; sin `{d.` residuales) · T3-HOJA3 (~40 literales pág. 4) · T4-CI057 (`-3%` y
`36%` presentes, `161%` y `30,91` ausentes, `33,64`/`24,08`/`890,33` + 5 valores US$) · T5-VISUAL
(PNGs ref vs v2 por página, guardarraíl diff ≤35%, veredicto ocular) · T6-CADENA (PDF ≥300 KB de
corrida real, `pdf_final_url` dropbox.com, 1 fila vigente TX_DocumentosGenerados con
`render_id_carbone` nuevo vs rollback). Referencia: 8 páginas, 67 imágenes embebidas.

## §7 Riesgos y pasos manuales

- **AT03**: editar C_Formulas sólo con AT03 OFF (estado declarado 27-sep; API no puede
  confirmarlo — MCP 403 esta sesión). Exposición residual casi nula (3 solicitudes vivas; no
  tocar VP-0062). Si el fix modifica `AT03_Calculos_DAG.js`, Sergio debe pegar el script en la
  automation ANTES de reactivarla (manual).
- **Dropbox `.env.local` inválido** (400) — no bloquea: E3 usa la conexión OAuth de Make
  (7553318), que ayer subió bien. El share-link público exige Reauthorize de Sergio (scope
  `sharing.write`); hasta entonces `pdf_final_url` abre logueado.
- **Harness escribe** (TX_Calculos, A_Eventos, estado) — sólo sobre VP-0067, con limpieza.
- **Reimport de blueprints** exige reinyectar Authorization Carbone y URL hook E3 (redactados en
  repo) — preferir PATCH de módulos por API.
- Payload base64: comprimir imágenes; si excede, plan B URLs de attachment Airtable (expiran,
  render inmediato).

## §8 Rollback

`rollback.md` ANTES de cada pieza: VP-0067 (dump + lista campo→valor viejo), hijos creados
(record_id → DELETE), C_Formulas (expresiones textuales de §3.5; filas nuevas → DELETE),
`CARBONE_TEMPLATE_ID` viejo (`070757d8…` — el template v1 sigue en Carbone; rollback =
re-apuntar), blueprints E2/E3 (GET pre-cambio, guardados redactados), código (git — lo revierte
Sergio). AT03 script original en git.

## §9 GATES

| Gate | Criterio | Resultado |
|---|---|---|
| G1 | Credenciales OK | **PASA** — Airtable 200 · Carbone 200 (PROD + template) · Make 200 (users/me, blueprint E2) · Anthropic 200. Dropbox `.env.local` 400: no bloqueante (E3 usa conexión Make; reauth = paso manual GO-LIVE) |
| G2 | Todas las imágenes extraídas y con ranura | **PASA** — 35/35 extraídas, MANIFEST completo, contrato de ranuras §3.3 (las ranuras nuevas las crea la plantilla v2) |
| G3 | XLSM entrega datos exactos + aritmética sin ambigüedad | **PASA** — 6 números objetivo reproducidos numéricamente; cero ambigüedades |
| G4 | E2/E3 accesibles por API | **PASA** — blueprint GET 200; PATCH/start/stop verificados en tanda anterior |

**GATE INTERNO: PASÓ (G1-G4) → continúa Fase 2** (autorización previa de Sergio para la tanda completa).

## §10 Conflictos detectados

1. CLAUDE.md dice E1/E2/E3 "sin blueprint, es reconstrucción T5" — desactualizado: T-PDF-IMPRENTA
   (27-sep) los reconstruyó (E2 v2.0 / E3 v2.1) con blueprints en `docs/_artefactos/make/`.
2. El "CI-057" de esta tanda NO es la ficha CI-057 de `CODE_INCONSISTENCIES.md:1916` (divergencia
   comparables grilla-vs-informe, condicionada a A-44): son las fórmulas del promedio/desviación.
   Mantener el nombre de tanda pero anotarlo en el cierre.
3. C_AutomationsAirtable dice AT03 "Activo" (03-jul) vs declaración de Sergio 27-sep (OFF) —
   registro desactualizado; corregirlo al cierre.
4. Z_EscenariosMake sigue con 11 filas seed desactualizadas (ya conocido).
5. MCP Airtable sin permisos sobre la base esta sesión (403) — fallback REST declarado (RO-30).
