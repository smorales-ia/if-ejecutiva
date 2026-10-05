# PLAN · T-TASADOR-E2E-5CASOS-PROD-20261003

> Flujo del tasador UI-driven (V1..V6) desde la asignación hasta el PDF espejo, validado sobre
> 5 tasaciones reales de `docs/_referencias/5tasaciones/`. Fase 1 (plan) + Fase 2 (ejecución)
> con GATE interno. Rama plan: `plan/T-TASADOR-E2E-5CASOS-PROD-20261003`;
> rama ejecución: `feat/T-TASADOR-E2E-5CASOS-PROD-20261003`.

## §1 · Resumen

Las 5 tasaciones son **el mismo formato Value Property 8 págs** que MET-6283 → plantilla Carbone
**v5 reutilizable**; render chain viva (E2 v5 activo, E3 on-demand). Abarcan 5 instituciones
distintas (MetLife, Agencia Habitacional, Austral Leasing, Hip. Security, Hip. Evoluciona), buen
test del objetivo A. **Oráculo extraído completo** (valores exactos por caso, §5).

**Fase 1 COMPLETA (5 agentes en paralelo, solo lectura). GATE: DETENIDO antes de Fase 2.** El
objetivo es viable pero el alcance real es **construir 5 tasaciones completas desde cero** (4 no
existen; el 5º está cancelado), muy por encima del touch-up de VP-0067, y hay **blockers que
requieren decisión de Sergio**: (a) Clerk cuenta 2 sin user_id; (b) onboarding de tablas
compartidas (M_Clientes/M_Comunas/H_PreciosUF) para que AT03 no aborte — con riesgo sobre otras
solicitudes, salvo que se use la vía "sandbox replica" sembrando valores del oráculo sin recálculo;
(c) UF del día pendiente de Sergio. Ver §13bis para el veredicto y las decisiones pedidas.

## §2 · Alcance SÍ / NO

**SÍ:** datos+asignación por caso (TX_Solicitudes), adjuntos/extracción visibles (V1/V2),
datos del tasador poblados (V3), informe completo (V4), expediente (V5), PDF espejo descargable
(V6); código genérico en rama feat sólo si un hueco de UI lo exige; validación en producción.

**NO:** tocar los archivos del oráculo; re-apuntar o forzar E2/E3 (ya en v5); tocar VP-0067;
editar `AT03-Ext_script.js` ni blueprints E1/E2/E3 (R7); editar C_Formulas en caliente (sólo
fix con rollback); commit/push (lo hace Sergio); strings de UI con jerga AI/OCR/extracción.

## §3 · Inventario de los 5 casos (PDF ↔ XLSM · emparejamiento CONFIRMADO)

Emparejamiento verificado por dirección + código de institución en el texto del PDF:

| Caso | Propietario (PDF) | Institución | Dirección | Comuna | Código | XLSM |
|---|---|---|---|---|---|---|
| 1 | Alejandro Ávila Durán | MetLife | La Marina 1176, dp 102, Ed. Guillermo II | San Miguel | METLIFE-6280 | Formato Value Property Octubre2025 - La Marina 1176 dp 102 bd 13.xlsm |
| 2 | Janeth Patricia Cando Arias | Agencia Habitacional | Coronel Souper 4060, dp 2502 B, Ed. Mirador Souper | Estación Central | 1548 (AG) | AG 1548.xlsm |
| 3 | Miguenson Rameau | Austral Leasing | Caspana 310, dp 14, Block A, Pob. Valle de la Luna | Quilicura | — | caspana 310 dp 14, quilicura.xlsm |
| 4 | Patricio Adrián Toro Nievas | Hipotecaria Security | Av. María Rozas Velásquez / Las Rejas Norte 65, dp 211 P | Estación Central | — | Formato Value Property Octubre2025 - Las Rejas Norte 65 dp 211 P.xlsm |
| 5 | Carlos Andrés Cortés Pérez | Hipotecaria Evoluciona | Exequiel Fernández 6150, dp 411, Torre 3 | La Florida | HEV-3183 | HEV3183.xlsm |

**Familia de formato:** las 5 = MET-6283 (Value Property 8 págs). Región Metropolitana en las 5.
Todas son departamentos. HEV = **H**ipotecaria **EV**oluciona; AG = **A**gencia Habitacional.

Referencia ya lograda: **VP-2026-0067** (recmMzeu3eWGxyXsf), espejo de MET-6283, estado
`pdf_listo`, asignado a `recTJcV3BIvdcG4em` (nutricionsaludketo@gmail.com).

## §4 · Mapa VISTA → ESTADO → URL (sirve a los 5 casos)

URL base producción: **`https://if-ejecutiva-production.up.railway.app`** (`docs/construccion.md:69`).
`[id]` = record ID de TX_Solicitudes. Enum `estado` exacto (`lib/tasador/tasaciones.ts:66-77`):
`creada · asignada · visitada · calculada · pdf_listo · aprobada · pendiente_final · entregada ·
cerrada · cancelada · requiere_atencion`. Las páginas no hacen gating duro por estado (guard por
ownership); el estado controla `bloqueadoParaEdicion` (∈ visitada,calculada) e `informeDisponible`
(∈ calculada,pdf_listo).

| Vista | Ruta → URL | Estado(s) | Punto exacto |
|---|---|---|---|
| **V1 adjuntos** | `/tasaciones/[id]/fotos` | `asignada`+ | botón abre sheet "Documentos y adjuntos" (`fotos-screen.tsx:479`) |
| **V2 extracción** | `/tasaciones/[id]/lectura` | `asignada` | progreso RF-09; los valores se ven hidratados en V3 |
| **V3 datos tasador** | `/tasaciones/[id]` | editable sólo en `asignada` (lectura en visitada/calculada) | `TasacionForm`, secciones A–H |
| **V4 informe** | `/tasaciones/[id]/informe` | `calculada · pdf_listo` | `InformePreview` |
| **V5 expediente** | `/tasaciones/[id]/informe` (sheet) | `calculada · pdf_listo` | botón **"Ver expediente"** |
| **V6 descargar PDF** | `/tasaciones/[id]/informe` (acción) | `calculada · pdf_listo` (usa `pdfUrl`) | botón **"Descargar PDF"** → abre `pdfUrl`; fallback `window.print()` |

**Secuencia de estados a sembrar por caso:** `asignada` (cubre V1–V3) → `visitada` → `calculada`
(cubre V4–V6) [→ `pdf_listo` opcional]. Precondición de llegada a `asignada`: coordinación
`confirmada`. ⚠ V6 requiere que el pipeline Carbone haya escrito `pdf_final_url`/`pdfUrl`
(CLAUDE.md lista E2/E3 como inactivos pero el go-live confirmó E2 **activo en v5** — OK).

**Huecos de UI detectados:** (1) Comparables (Sección D) son **solo lectura** — dependen 100% de
RF-09; si RF-09 lee &lt;3, el tasador no puede ingresarlos a mano (sólo re-fotografiar). (2)
`valorReferenciaClp` sin input. (3) `documentosCargados` del expediente rinde vacío (deuda
RF-TAS-10, bloque muerto). (4) V6 cae a `window.print()` si no hay `pdfUrl`.

## §5 · Oráculo por caso (valores exactos + huecos)

Fuente: openpyxl `data_only=True` sobre cada XLSM (hojas FICHA SOLIC, Antecedentes, Hoja Resumen,
Portada), validado contra el PDF. La cabecera "Numero Solicitud" del PDF imprime el **Nº INTERNO**
(prefijo cliente + correlativo), no el folio del mandante (K13, vacío en varios). Los "dos % de
ajuste" (en MET-6283 eran -3%/36%) son por caso: fila "TASACION V/S PROMEDIO" de REF.OFERTAS
(Portada!AX36) y REF.C.B.R. (Portada!AX44). El dólar vive en Portada!BO71, distinto por caso.

| # | Nº interno | Cliente | Propietario · RUT | Dirección · comuna | Rol | Avalúo fiscal | Año · vida útil | Tasador | Fecha visita | Sup. constr. | Valor comercial | UF día · Dólar | % ajuste Oferta / CBR | Comp. Of/CBR |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | METLIFE-6280 | MetLife | Alejandro M. Ávila Leiva · 5.523.876-6 | La Marina 1176 dp102, San Miguel | 4852-250 | 115.461.656 | 1998 · 55a | Sergio Gajardo | 2026-04-06 | 102 m² | **3.323,20 UF** = $132.402.004 | 39.841,72 · **922,17** | **-30% / -17%** | 5 / 1 |
| 2 | AGH-1548 | Agencia Habitacional | Andrés P. Israel Avram · 7.774.862-8 | Coronel Souper 4060 dp2502B, Est. Central | 694-416 | 50.615.903 | 2017 · 40a | Marcela Gómez | 2026-05-12 | 41 m² | **1.394 UF** = $56.164.915 | 40.290,47 · **894,25** | **-5% / +2%** | 5 / 2 |
| 3 | ALH-335 | Austral Leasing Habitacional | Víctor L. González Moreno · 9.588.043-6 ⚠ | Caspana 310 dp14, Quilicura | 658-128 | 16.551.115 | 1994 · 40a | M. Eugenia Soto | 2026-05-07 | 40 m² | **1.024 UF** = $41.178.573 | 40.213,45 · **892,83** | **-7% / 0** ⚠ | 5 / 0 ⚠ |
| 4 | HIP. SECURITY-6073 | Hipotecaria Security S.A. | Irma E. Alzamora Riveros · 7.922.771-4 | Av. María Rozas Velásquez 65 dp211P, Est. Central ⚠ | 7038-11 | 27.029.695 | 2015 · 65a | Sergio Gajardo | 2026-03-13 | 32,4 m² | **1.072,17 UF** = $42.717.097 | 39.841,72 · **909,94** | **-15% / +12%** | 5 / 1 |
| 5 | HEV-3183 | Hipotecaria Evoluciona | Inmob. Exequiel Fernández Torre Tres SpA · 77.294.373-3 | Exequiel Fernández 6150 dp411 T3, La Florida | 31-516 | **NO REGISTRA** ⚠ | 2026 nuevo · 70a | Sergio Gajardo | 2026-05-12 | 47,61 m² | **3.858,91 UF** = $155.477.298 | 40.290,47 · **894,25** | **-4% / +10%** | 5 / 1 |

La Hoja 3 completa (tabla de 5 ofertas + N CBR con dirección/año/UF/m²/teléfono y promedios) está
extraída celda-a-celda por caso en el informe del agente oráculo (base para sembrar comparables).

**Huecos de oráculo:** email solicitante vacío en los 5; año construcción no es campo único
(se infiere de recepción/refs); **Caso 3**: RUT propietario == RUT solicitante (inconsistencia),
permiso "S/I", **REF.CBR vacía**; **Caso 4**: dirección diverge (María Rozas Velásquez en
cabecera/FICHA vs "Las Rejas Norte 65" en descripción) — canónica = María Rozas; **Caso 5**: RUT
solicitante vacío (PDF imprime 0), avalúo fiscal "NO REGISTRA" (propiedad nueva).

## §6 · Cobertura motor-input ↔ UI + HUECOS DE PRODUCTO (objetivo A)

**Buena noticia:** los P0 de la auditoría del 22-sep (uf_m2_unitario y factor por ítem,
uf_dia_visita) están **cerrados en código** (tandas T-MC-P0 / T-AUDIT-CLOSE). La UI del tasador
ya captura el cuadro de valoración para cualquier cliente — la "fuente fantasma" xlsm se eliminó
de la ruta de cálculo. El motor es cliente-agnóstico salvo en datos maestros, y ya **falla
ruidoso** (no usa defaults silenciosos) si falta cliente/comuna/UF.

**HUECOS que bloquean "100% UI-driven para cliente nuevo":**

| ID | Hueco | Prioridad | Qué implica para los 5 casos | Opción mínima |
|---|---|---|---|---|
| HP-A | Branding por-cliente en portada (`C_VariablesCliente.logo_url`) = null para todos; MET-6283 salió con marca Austral Leasing hardcodeada | **P0 entregable** | El PDF saldrá con branding incorrecto/ausente para los 5 | Poblar maestro `logo_url` por cliente + leerlo en pipeline |
| HP-B | `avaluo_fiscal_clp` sin fallback de UI (sólo RF-09; DAG hace `\|\| 0` silencioso) | P1 | Si RF-09 no extrae el avalúo, el cálculo usa 0 sin avisar | Input UI de avalúo en sección SII/F + guard |
| HP-C | Cron UF diaria **no desplegado** (`CRON_UF_Diaria.js` escrito) | P1 bloqueante operativo | Sin `uf_dia_visita`/`tipo_cambio_usd` del día, **toda tasación aborta ruidoso en Hoja 3** | Desplegar cron o sembrar H_PreciosUF del día (dato) |
| HP-D | Onboarding `M_Clientes` (tasa_cap_rate, factor_seguro, factor_garantia) + `M_Comunas` (uf_m2_*) | P1 bloqueante por caso | Agencia Habitacional / Austral Leasing / H. Security / H. Evoluciona **abortan** si su fila M_Clientes no tiene factores; comunas San Miguel/Est.Central/Quilicura/La Florida deben estar pobladas | Dar de alta cliente/comuna (dato) antes de calcular |
| HP-E | `numero_solicitud`/`id_externo_cliente` (N° del cliente en portada) | P1 | Portada sin el N° de cada caso | Confirmar/poblar campo |
| HP-F | Cualitativa Hoja 3 (UI captura y descarta · CI-023) | P1 calidad | Afecta a los 5 por igual | Crear columnas destino |

**Consecuencia para el GATE G5:** el camino UI-driven existe para V1–V5. Para V6 (PDF espejo) hay
**dependencias de dato maestro (HP-C, HP-D)** que son prerequisito de que AT03 calcule sin
abortar. Son datos/config (TIER-1, se pueden sembrar), no código. HP-A (branding) y HP-B (avalúo
UI) son los candidatos a CÓDIGO/CONFIG genérico (TIER-2) si se quiere cerrar el hueco de verdad.
El detalle por caso (qué falta sembrar) lo fija el agente de datos/oráculo.

## §7 · Render chain y plantilla por formato

Cadena viva (verificada en go-live): E2 scenario `5750023` activo → Carbone render URL con
template **v5** (`f6d1f2b0…786f`) → E3 → Dropbox → `pdf_final_url` en TX_Solicitudes. Formato
único (= MET-6283) → **se reutiliza la plantilla v5 para los 5 casos**, sin plantilla nueva.
NO re-apuntar ni tocar módulos de E2/E3.

**Detalle verificado (agente datos):** E2 `5750023` activo (template v5 confirmado en blueprint,
último run OK 2026-10-01 21:07). E3 `5791413` idle on-demand (se encadena desde E2; sube a
Dropbox vía conexión Make `sharing.write`, genera share-link público). E3 escribe
`TX_DocumentosGenerados` (ruta/url/version) y `pdf_final_url` (fldASzRV9aQNFExpY) de la
solicitud. **Estado de partida de los 5: 0 PDF.**

**Lo que hace funcionar a VP-0067 (a replicar por caso):** estado `pdf_listo`; `pdf_final_url`;
6 links TX_DocumentosGenerados; **24 filas TX_Adjuntos** (8 `subido_por=Sistema` = docs fuente
RF-09 → V1/V2; **16 `subido_por=Tasador`** = registro fotográfico como `thumbnail_url` data-URI
base64 ≤95 KB + `descripcion`=categoría + `orden` 0..15 + `estado_extraccion=listo`); links
`comparables` (7), `ofertas/occ` (6), `recintos` (12 → tblBITpPb8WuqsatM), superficies (15 →
tblFz37KSvn5pLKDR); escalares (propietario, RUT, dirección, comuna, región, cliente, tipo
propiedad, rol, nº op, superficies, fecha visita); `tasador`+`visador`; `motor`.

**8 buckets del registro fotográfico** (origen único UI+PDF, de T-VP0067-IMAGENES-UI): Mapa de
Ubicación · Planificación(custom) · Fachada/Exterior · Living/Comedor · Cocina · Baños ·
Habitaciones · Estacionamientos (+ Ofertas/Comparables ocupan ranuras de Hoja 2). Por caso hay
que extraer las fotos de su PDF oráculo, categorizarlas y sembrarlas como filas Tasador.

## §8 · Ejecución en OLAS y CARRILES  *(se completa tras Fase 1)*

## §9 · Batería de tests por caso

Por cada caso (URL de producción, cuenta Clerk del §12): V1 adjuntos visibles en `/fotos`; V2
extracción visible en `/lectura`/form; V3 datos del tasador poblados (secciones A–H); V4 informe
completo en `/informe`; V5 expediente ("Ver expediente"); V6 PDF descargable ("Descargar PDF") y
espejo de su PDF oráculo. Dato-por-dato vs §5: Nº interno, cliente, propietario/RUT, dirección,
comuna, rol, avalúo, año, vida útil, sup., valor comercial UF+CLP, UF del día, **dólar del caso**,
**los dos % de ajuste del caso** (no -3%/36%), nº comparables. 0 marcadores `{d.}`, 8 páginas,
fotos presentes. Marcar TIER-1 (ya testeable) vs TIER-2 (tras deploy de código de huecos).

## §13bis · VEREDICTO DEL GATE (Fase 1 → Fase 2)

| Gate | Criterio | Veredicto |
|---|---|---|
| G1 | Credenciales OK | ⚠ **PARCIAL** — Airtable/Make/Carbone OK; **Clerk cuenta `ganardineroporinternet29` sin resolver** (user_id desconocido) → reparto 5→2 bloqueado |
| G2 | 5 pares emparejados + oráculo sin ambigüedad | ✅ emparejados + valores exactos; ⚠ huecos de oráculo menores documentados (caso 3 RUT, caso 4 dirección, caso 5 avalúo/RUT) |
| G3 | Mapa VISTA→ESTADO→URL completo | ✅ |
| G4 | Cadena PDF + Clerk accesibles + plantilla por caso | ✅ render v5 reutilizable (formato único); ⚠ Clerk parcial |
| G5 | Camino UI-driven por caso o huecos documentados | ✅ huecos documentados (HP-A..F). **Pero V6 depende de prerequisitos de dato maestro (HP-C UF, HP-D onboarding) que tocan tablas compartidas** |

### Decisiones de Sergio (2026-10-03) — GATE ahora VERDE para ejecutar

- **D1 = Sandbox replica:** sembrar valores finales del oráculo directamente por solicitud, SIN
  tocar M_Clientes/M_Comunas ni correr AT03 (TIER-1, menor riesgo). Confirmado viable: el
  ensamblador (`lib/informe/ensamblador.ts`) arma el contexto desde datos ALMACENADOS
  (TX_Solicitudes + TX_DatosTasacion + TX_ItemsCuadroValoracion + **TX_Calculos** terminales +
  H_PreciosUF + comparables + TX_Adjuntos) — no recalcula. Se siembran los 13 terminales de
  TX_Calculos con los valores del oráculo.
- **D2 = las 5 a nutricionsaludketo** (`recTJcV3BIvdcG4em`).
- **D3 = sembrar UF/dólar del Excel** por fecha de visita en H_PreciosUF (4 fechas distintas;
  casos 2 y 5 comparten 2026-05-12).

**De-risking confirmado:** M_Clientes tiene los 5 clientes y M_Comunas las 4 comunas (los links
resuelven nombre sin onboarding); E2 webhook vivo (`wh_E2_Carbone_Render`, id 3045780) +
`MAKE_WEBHOOK_E2` en `.env.local` → el render se dispara con el harness probado
(`construirInformeContexto` + post a E2, patrón de `smoke-e2-live.test.mts`); `generar-pdf` exige
estado ∈ {calculada,pdf_listo}. Recipe por caso y mapa de FIELD_IDs listos (§3/§5/§7).

**Fase 2 = construir 5 tasaciones completas (sandbox) + render + validación 6 vistas.** Ejecución
incremental: probar CASO 1 (MetLife, el más cercano a VP-0067) como plantilla validada, luego
paralelizar casos 2–5 (carriles independientes; H_PreciosUF sembrado una vez por fecha en OLA 0).

---
*(Veredicto original de Fase 1, previo a las decisiones:)*
**Conclusión: DETENER antes de escrituras en producción (Fase 2) y pedir decisiones a Sergio.**
Razones (no re-litigables sin su input):
1. **Alcance real ≫ VP-0067.** 4 casos no existen y el 5º está cancelado → hay que **construir 5
   tasaciones completas desde cero** (crear solicitud, sembrar ~8 docs, comparables/ofertas/
   recintos/superficies, ~16 fotos por caso extraídas del PDF, render). No es un touch-up.
2. **Escrituras a TABLAS COMPARTIDAS.** Para que AT03 calcule sin abortar hace falta onboarding de
   `M_Clientes` (factores de 4 clientes) + `M_Comunas` (4 comunas) + `H_PreciosUF` (UF del día).
   Esto afecta a OTRAS solicitudes de esos clientes/comunas → choca con el invariante "no romper
   otras solicitudes". **Alternativa de menor riesgo:** sembrar los valores finales del oráculo
   directamente en cada solicitud (sandbox replica, como VP-0067) **sin** correr AT03 ni tocar
   masters — hay que confirmar que el pipeline E2 rinde desde datos almacenados sin recálculo.
3. **Clerk cuenta 2** sin user_id → el reparto a 2 cuentas no es ejecutable (fallback: las 5 a
   nutricionsaludketo).
4. **UF del día (HP-C)** es prerequisito operativo que el motor marca "pendiente de Sergio".

## §10 · Riesgos y pasos manuales (de auditoría de seguridad)

- **AT03 invisible:** la transición de estado dispara AT03 sin vuelta atrás. Capturar estado
  origen y rollback por-record ANTES de cada cambio.
- **Aislamiento:** cada PATCH filtrado al record exacto por `solicitud_codigo`; nunca batch
  ciego (riesgo de pegar a ~39 filas). Usar `returnFieldsByFieldId=true`.
- **No tocar VP-0067** ni la cadena E2/E3 ya en v5. No re-apuntar el templateId.
- **AT03-Ext descarta fotos de comparables** (cardinalidad muchas_por_solicitud): detectar por
  caso leyendo TX_Adjuntos (REF.OFERTAS / ofertas_comparables); si un caso las trae, anotar
  brecha conocida — NO parchear el script (R7).
- **Secretos:** nunca imprimir; leer de `.env.local`; placeholders en reportes; verificar
  validez, no sólo presencia.
- **Strings UI (T-C/R8):** sin jerga AI/OCR/modelo/extracción; literales §6 canónicos.
- Pasos manuales candidatos: Dropbox "Reauthorize" (OAuth, es login de Sergio); toggle AT03
  off→on sólo si hiciera falta un fix de C_Formulas.

## §11 · Rollback por paso

Antes de cada escritura, registrar en `docs/_evidencia/T-TASADOR-E2E-5CASOS-PROD-20261003/rollback.md`
el estado original del record (estado, tasador, `pdf_final_url`, campos tocados). Reversión
definida por-record (patrón `golive-e2-repoint.mjs` invertido para pipeline; PATCH de reposición
para datos). VP-0067 excluido del lote.

## §12 · Reparto casos → cuentas Clerk

Sólo **3 tasadores** tienen `clerk_user_id` en M_Tasadores: `recTJcV3BIvdcG4em` "Sergio
(nutricionsaludketo)" (user_3GBF4Jp…), `recaKT2ND8dIZpEIj` Hector Martinez (user_3HsNnsLu…),
`recJPSCLckxLuf9nV` Nelcy Jaimes (user_3I3t9D…).

- **nutricionsaludketo@gmail.com → `recTJcV3BIvdcG4em`** (confirmado; VP-0067 ya está asignado ahí).
- **ganardineroporinternet29@gmail.com → ⚠ NO RESUELTO.** Su `clerk_user_id` no está en el repo ni
  es distinguible por email (placeholders repetidos). Candidatos por descarte: Hector o Nelcy.
  **Falta el user_id de Clerk de esa cuenta (dashboard Clerk o una sesión).** → BLOQUEANTE para
  el reparto 5→2.

Reparto propuesto (si se resuelve la cuenta 2): nutricionsaludketo = casos 1,3,5 ·
ganardineroporinternet29 = casos 2,4. Fallback sin cuenta 2: asignar los 5 a nutricionsaludketo
y marcar el reparto como pendiente.

## §8 · Ejecución en OLAS y CARRILES

**Realidad de alcance (crítica):** esto NO es un touch-up como el cierre de VP-0067. Es **construir
5 tasaciones completas desde cero** (4 no existen; el caso 5 sólo existe cancelado). Por caso:
crear TX_Solicitudes → onboarding de datos maestros → sembrar adjuntos (8 docs) + extracción
(V2) + comparables/ofertas/recintos/superficies (Hojas 2/3) + 16 fotos (extraídas de su PDF) →
calcular (AT03) → render E2/E3 → PDF. Más prerequisitos compartidos que tocan **tablas maestras**
(M_Clientes, M_Comunas, H_PreciosUF), de mayor radio que "5 records".

- **OLA 0 (compartida, prerequisito, 1 vez):** UF del día en H_PreciosUF (HP-C) o desplegar cron;
  onboarding M_Clientes (factores de Agencia Habitacional, Austral Leasing, Hip. Security, Hip.
  Evoluciona) + M_Comunas (San Miguel, Est. Central, Quilicura, La Florida). **Sin esto AT03
  aborta** → ningún PDF. Afecta tablas compartidas → decisión de alcance con Sergio.
- **OLA 1 (carriles por caso, paralelo):** crear/poblar solicitud + asignación + adjuntos +
  datos Hojas 2/3 + fotos. Un PATCH consolidado por record; aislado por `solicitud_codigo`.
- **GATE S1 por caso:** datos+adjuntos OK antes del render.
- **OLA 2 (por caso):** disparar E2→E3 → PDF → link en Airtable (habilita V4/V5/V6).
- **Código genérico (TIER-2, si se decide cerrar huecos):** HP-A branding por-cliente, HP-B input
  UI de avalúo fiscal. No requerido para TIER-1 pero sí para "100% UI-driven cliente nuevo".

## §13 · GATES

- **G1** credenciales OK · **G2** 5 pares PDF↔XLSM emparejados + oráculo sin ambigüedad ·
  **G3** mapa VISTA→ESTADO→URL completo · **G4** cadena PDF+Clerk accesibles + plantilla
  decidida por caso (aquí: formato único → reutilizar v5) · **G5** camino UI-driven viable por
  caso o huecos documentados.
- Estado G2 (emparejamiento): ✅ hecho. G4 (plantilla): ✅ formato único, reutilizar v5.
  Resto pendiente de los agentes.
