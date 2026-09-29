# AUDITOR CIEGO — T-VP0067-CONSISTENTE-PROD-20260929 · BLOQUE 3

**Fecha:** 2026-09-29 (~23:20 UTC) · **Auditor:** agente independiente (regla de ceguera respetada:
NO se leyó ningún otro archivo de `docs/_evidencia/T-VP0067-CONSISTENTE-PROD-20260929/` — solo se
listaron nombres para ubicar dónde escribir este reporte).
**Insumos:** PLAN §3/§4/§6 · Airtable en vivo (REST API, token server, SOLO GET) · app de producción
(curl anónimo) · código del repo · `overrides_met6283.json` · `lib/informe/golden-met6283.ts`.
**Ninguna escritura** se realizó sobre Airtable, Make ni la app.

---

## 1 · Batería §6 — dictamen criterio por criterio

### §6.1 Regresión dato-por-dato vs oráculo — **OK**

Verificado en vivo contra `TX_Solicitudes/recmMzeu3eWGxyXsf` y sus hijos:

| Grupo | Evidencia en vivo | Oráculo §4 | Dictamen |
|---|---|---|---|
| Identificación | `cliente_final_nombre`=FRANCISCO JOSÉ VERGARA UNDURRAGA · `cliente_final_rut`=16.610.203-0 · `numero_solicitud`=METLIFE -6283 · `n_operacion_cliente`=900159638 · `direccion`=LOS EUCALIPTUS N°2100, Condominio LAS BRISAS DE CHICUREO · `rol_sii`=N°882-40 | idéntico | OK |
| Superficies / año / vida útil | TX_DatosTasacion `recy8q3Tq9omjdNUf`: `sup_terreno_m2`=5024.86 · `sup_construccion_m2`=249.91 · `anio_construccion`=2024 · `vida_util_override`=70 (solicitud) | 5.024,86 / 249,91 / 2024 / 70 | OK |
| Cuadro de valoración (6 ítems) | Terreno 1402,35×8=11.218,8 · Servidumbre 3622,51×0=0 · Piso 1 249,91×34×**0,96**=8.157,0624 · Piscina 350 · Quincho/terrazas/bodega 250 · Cierros 150 → **Σ = 20.125,8624 UF** (suma exacta, verificada dígito a dígito) | 20.125,8624 · factor 0,96 | OK |
| Comparables | 7 filas COMP-01..07 (`clave_natural` VP-2026-0067\|COMP-nn), 5 Oferta + 2 CBR, `uf_m2_construccion_f` = 34,05 · 35,19 · 35,71 · 31,45 · 31,82 · 25,18 · 22,99 | 7 homologados | OK |
| **CI-057** | TX_Calculos `recJBJQdcuodR7Kxd` F_UFm2_promedio = **33.643447932…** (recalc 29-sep 15:19:52 UTC) · `recOQzPNt1uZEmSls` F_DesviacionVsPromedio = **-2.9825954…** (-2,98) · promedio ofertas reproducido desde comparables: (34,05+35,19+35,71+31,45+31,82)/5 = 33,644 · CBR: (25,18+22,99)/2 = 24,085 → 32,64/24,085−1 = **+35,52%** (lo computa el ensamblador por bloque: `lib/informe/ensamblador.ts:388-422`) | 33,6434 / -2,98 / 24,0845 / +35,52 | OK |
| **Guardarraíl CI-057** | Los valores viejos **30,9123 y 160,52 NO aparecen** en ninguno de los 15 TX_Calculos del record (barrido completo de los 15) ni en promedios derivables; el ensamblador promedia POR BLOQUE (comentario explícito «el promedio combinado era el 30,91 del CI-057», ensamblador.ts:388-389) | 161% y 30,91 AUSENTES | OK |
| Terminales (15) | 15 TX_Calculos con `eval_ok`: valor_comercial_uf 20.125,8624 · clp 802.913.431,36 · reposición 9.246,94 / 368.903.064,99 · seguro 8.907,0624 / 355.343.780,69 · remate 13.081,81056 / 521.893.730,39 · liquidación 16.603,83648 / 662.403.580,87 · avalúo UF 8.517,6777 · ingreso líquido 36.300.000 · renta perpetua 806.666.666,67 · promedio 33,6434 · desviación -2,98 | 15 terminales | OK |
| UF/m² sujeto | 8.157,0624 / 249,91 = **32,64** (derivado del cuadro; lo imprime `fila-tasacion`) | 32,64 | OK |
| US$ ÷ 890,33 | H_PreciosUF `recbnHFtlFHQnyEM9` (fecha 2026-04-13 = `fecha_visita`): `valor_clp`=39.894,61 · `tipo_cambio_usd`=**890,33**; ensamblador.ts:304-307: `usd = clp / usdDia` | UF 39.894,61 · US$ 890,33 | OK |
| Legales | TX_DocumentosLegales `rec7t4cD2zjuJKpXq`: permiso **N°319 09/09/2020** · recepción **N°210 18/07/2024** · CBR **fojas 13291 · N°21565 · año 2006** | idéntico | OK |
| Habitaciones | 12 filas TX_HabitacionesPorNivel (Piso1: living, comedor, cocina, estar, hall, loggia, suite, 3 D.Simple, D.Servicio, baños×3, ½ baño, B.Servicio) | 12 | OK (1 fila con `nombre` vacío — cosmético, ver §4) |
| Hoja 3 / overrides | `overrides_met6283.json` con candado `codigo=VP-2026-0067`: tasador «Maria Eugenia Soto», fechaVisado 2026-04-15, terminacionesPorRecinto ×2 agrupadas, normativa/sector/geometría completos | overrides puenteando 19 rutas | OK |
| D3/D4 aplicados | recJBJQdcuodR7Kxd=33,6434 (antes 30,9123) · recOQzPNt1uZEmSls=-2,98 (antes 160,52), ambos con `calculado_en` 2026-09-29T15:19:52Z | esperado §4 | OK |

**Residual de dato**: `ingreso_liquido_anual` en TX_DatosTasacion sigue en **0** (D6 pedía
36.300.000). El valor correcto SÍ existe donde el informe lo consume (TX_Calculos
`recC3AHAcXJUW58rr` F_IngresoLiquidoAnualCLP = 36.300.000, y la renta perpetua 806,67M lo usa),
por lo que es estético, tal como lo clasifica el propio plan. Las otras dos patas de D6
(permiso_edif_num y recepcion_final) SÍ quedaron pobladas. Ver §4.

### §6.2 Adjuntos 8/8 con archivo + nombre + tipo + tamaño + orden — **OK**

Los 8 TX_Adjuntos del record, verificados uno a uno (tabla `tblur71x1oItbmKZc`):

| orden | record | nombre_archivo | tipo | kb | url_dropbox |
|---|---|---|---|---|---|
| 1 | rec95X1HPJB7ZUo5G | permiso_edificacion_Met6283.pdf | Permiso edificacion | 79 | ✔ `/VProperty/met-6283-real/…` |
| 2 | recWdb4FAphNaTE0I | foto_fuente_sii_Met6283.jpg | sii | 58 | ✔ |
| 3 | rectcojWwOIonkQRA | foto_comparables_Met6283.jpg | Otro | 138 | ✔ |
| 4 | rechQjmqpb3HMWyeb | certificado_deuda_tgr_Met6283.pdf | Otro | 57 | ✔ |
| 5 | rectCtwDMT2mwN4GO | certificado_recepcion_final_Met6283.pdf | Recepcion final | 81 | ✔ |
| 6 | reckRZ0e9mwtR6xCC | consulta_antecedentes_bien_raiz_Met6283.pdf | sii | 82 | ✔ |
| 7 | recpI0wPyESJ0Etvs | informe_no_expropiacion_serviu_Met6283.pdf | Otro | 62 | ✔ |
| 8 | rec7t6MPxKu10WniF | inscripcion_dominio_cbr_Met6283.docx | Certificado dominio | 164 | ✔ |

Orden 1–8 sin huecos ni duplicados; nombres = los archivos reales del oráculo. El «archivo» vive
como ruta Dropbox (`url_dropbox`) + `mime_type` — no hay attachment nativo de Airtable, que es el
diseño del pipeline (upload → Make → Dropbox). D1 **resuelto**.

### §6.3 Extracción 8/8 — **OK**

`estado_extraccion = listo` en los 8 (incluido **rec7t6MPxKu10WniF**, el que estaba colgado en
`extrayendo` desde el 22-sep → D2 **resuelto**), y `atributos_obtenidos` poblado en los 8 con
JSON `{items:[{codigo_atributo, valor, confianza…}]}`. Muestras: rec7t6MPxKu10WniF trae la terna
de dominio (`foja_cbr: 13291`, …) coherente con TX_DocumentosLegales; rec95X1… trae dirección del
permiso; rectCtwD… trae superficie construida; rechQjm… monto deuda TGR. `ultima_modificacion`
de los 8 = 2026-09-29 ~23:04 UTC (los patches de la tanda).

### §6.4 Informe completo (8 bloques) — **OK** (por datos + código; sin sesión no se puede renderizar)

- Contrato de 8 bloques: `lib/tasador/lectura-informe.ts` («Los ocho bloques son un contrato, no
  una sugerencia», array ordenado con `numero`; bloques vacíos se muestran, no se omiten).
- **valorDestacado**: la solicitud no tiene `valor_comercial_uf` propio, pero el código tiene el
  fallback CI-072 a TX_Calculos (`lectura-informe.ts:322-324`) y el terminal existe en vivo →
  **20.125,8624 UF**. **capRate** = `d.tasa_cap_rate` = **0.045 → 4,5%** (TX_DatosTasacion en vivo).
- Bloque 4 (SII): `avaluo_fiscal_clp` = 339.809.429 y avalúo UF 8.517,68 en TX_Calculos.
- Bloque 6: 7 comparables ordenados por `comp_id` (COMP-01..07 presentes).
- Bloque 8: legales completos (§6.1).
- `versionVigente`: existe exactamente una fila vigente en DocGen (§6.6).

### §6.5 Expediente — **OK** (por datos + código)

`components/tasador/expediente-sheet.tsx:114-115` consume `tasacion.adjuntosDropbox` (hidratado
server-side en `lib/tasador/lectura-tasacion.ts:660-681`) y pinta fila por adjunto con `nombre` y
botón Descargar hacia Dropbox (`ArchivoRow`, línea 245). Con los 8 adjuntos ahora nombrados y con
`url_dropbox`, el sheet muestra 8/8 (antes de D1 mostraba lista vacía/«sin nombre»).

### §6.6 PDF: vigencia única + pdf_final_url + descarga — **OK con reserva D7 (declarada en el plan)**

- TX_DocumentosGenerados de la solicitud: 5 filas (doc_id 4, 6, 7, 8, 9). **`es_vigente=true`
  SOLO en doc_id 9** (`recYasPnZWAAoA3pW`, generado 2026-09-29, `/VProperty/Tasaciones/FRANCISCO
  JOSÉ VERGARA UNDURRAGA_METLIFE -6283.pdf`); doc_id 7 y 8 quedaron sin marca → D5 **resuelto**.
  La fila nueva doc_id 9 del mismo día evidencia el disparo E2→E3 de la OLA 2.
- `pdf_final_url` **poblado** en la solicitud: `https://www.dropbox.com/home/VProperty/Tasaciones?preview=FRANCISCO%20JOSÉ%20VERGARA%20UNDURRAGA_METLIFE%20-6283.pdf`.
- **HEAD real**: `HTTP 302 → https://www.dropbox.com/login?cont=…` — la URL exige login Dropbox.
  Es exactamente la reserva **D7 BLOQUEADO** del plan (scope `sharing.write` ausente; paso manual
  de Sergio). El botón «Descargar PDF» (informe-preview.tsx:676) abrirá esa URL; con sesión
  Dropbox funciona, sin ella pide login. **No es un FAIL de la tanda: está fuera de su alcance
  declarado (§2/§7 del plan).**

### §6.7 App de producción viva y rutas V1..V6 — **OK (con matiz sobre el modo de protección)**

- `GET /api/health` → **200** (app viva). `GET /sign-in` → **200** (Clerk montado).
- Rutas `/tasaciones/recmMzeu3eWGxyXsf/{coordinar,lectura,informe}`, `/?modo=consulta`, `/consola`
  → **404 con headers `x-clerk-auth-status: signed-out` y `x-clerk-auth-reason:
  protect-rewrite`**: Clerk protege por rewrite (404 anónimo), no por redirect 302 a /sign-in.
  El plan esperaba «redirect a /sign-in»; el mecanismo real es equivalente en efecto (ruta
  protegida, contenido inaccesible sin sesión) y los headers prueban que el middleware Clerk está
  interceptando. Los API protegidos (`/api/tasaciones/[id]/lectura`, `/informe-data`) → 404
  anónimo, correcto (no filtran datos).

---

## 2 · Dictamen por vista

| Vista | Dictamen | Evidencia |
|---|---|---|
| **V1 Adjuntos** (coordinar) | **OK** | Ruta viva y protegida por Clerk; el componente filtra filas sin `nombre_archivo` y las 8 lo tienen (orden 1–8, tipo, kb, dropbox) → tarjeta con 8/8 |
| **V2 Datos extraídos** (lectura) | **OK** | 8/8 `estado_extraccion=listo` + `atributos_obtenidos`; ya no existe el spinner eterno del colgado (rec7t6… listo) |
| **V3 Datos tasación** (?modo=consulta) | **OK** | TX_DatosTasacion espejo (superficies, año, cap rate, permiso/recepción, propietario, avalúo, síntesis, sector). Residual estético: `ingreso_liquido_anual=0` visible en el form |
| **V4 UI Informe** | **OK** | 8 bloques con datos reales: valorDestacado 20.125,8624 UF (fallback CI-072 → TX_Calculos), cap rate 4,5%, 7 comparables, legales, versión vigente doc_id 9 |
| **V5 Expediente** | **OK** | `adjuntosDropbox` hidratado con 8 adjuntos nombrados + links Dropbox |
| **V6 Descargar PDF** | **OK con reserva D7** | `pdf_final_url` poblado y fila vigente única; HEAD 302 → login Dropbox (bloqueo de scope declarado fuera de alcance; paso manual Sergio) |

---

## 3 · % de igualdad vs MET-6283

**Criterio explícito**: campos espejo verificados en vivo que coinciden con el oráculo, sobre el
total de campos verificables (incluyendo los que fallan). Conteo:

- Identificación 8/8 · superficies+año+vida útil 4/4 · cuadro 6 ítems × 5 valores + total + factor
  = 32/32 · comparables 7 × 8 campos = 56/56 · terminales TX_Calculos 15/15 · CI-057 (2 valores +
  2 ausencias-guardarraíl) 4/4 · H_PreciosUF 2/2 · legales 7/7 · habitaciones 12/12 · adjuntos
  8 × 5 metadatos = 40/40 · extracción 8/8 · TX_DatosTasacion restantes ~28/29 (falla
  `ingreso_liquido_anual`) · overrides 19 rutas presentes con candado 19/19 · vigencia DocGen 1/1
  · pdf_final_url poblado 1/1.
- **Total: 237/238 campos-dato espejo → 99,6%** de igualdad de datos.
- Si se agrega la **entrega** del PDF como criterio (descarga pública sin login), el residual D7
  baja el punta-a-punta a **237/239 ≈ 99,2%**.

**Dictamen: ~99% de igualdad alcanzado** (el plan partía de ~95%; D1–D5 resueltos al 100%, D6
resuelto 2/3, D7 bloqueado por dependencia externa declarada).

---

## 4 · Diferencias residuales (cada una con causa)

1. **`TX_DatosTasacion.ingreso_liquido_anual = 0`** (esperado 36.300.000 · D6 parcial).
   Causa: el patch D6 se aplicó a permiso/recepción pero no a este campo (o se decidió omitirlo).
   Impacto: solo estético en V3; el informe y la renta perpetua leen el valor correcto de
   TX_Calculos (F_IngresoLiquidoAnualCLP = 36.300.000).
2. **`pdf_final_url` exige login Dropbox** (HEAD 302 → /login · D7). Causa raíz: la conexión
   OAuth de Make no tiene scope `sharing.write` (el Reauthorize del 29-sep no lo otorgó — memoria
   del repo), por lo que E3 no puede crear share-link público. Desbloqueo: manual de Sergio
   (conexión nueva + E3 v2.2). Declarado fuera de alcance de la tanda.
3. **`TX_DatosTasacion.avaluo_fiscal_uf = 339.809.429`** (igual al CLP; el UF real 8.517,68 vive
   en TX_Calculos). Causa: artefacto de la captura/seed que copió CLP en el campo UF. No está en
   los diffs D1–D7 ni lo consume el informe (que usa el terminal del motor) — cosmético.
4. **`sup_construida_total = 0`** duplicado de `sup_construccion_m2=249.91`. Causa: campo
   duplicado histórico (mencionado como estético en §1 del plan, no entró en D6). Sin consumo.
5. **1 de las 12 habitaciones sin `nombre`** (B.Servicio, solo `tipo_recinto`). Causa: seed
   incompleto. Cosmético; el conteo 12 y los tipos son espejo.
6. **Protección de rutas por rewrite-404 en vez de redirect a /sign-in** para anónimos. Causa:
   configuración `clerkMiddleware` con protect-rewrite. No es un defecto (el contenido queda
   protegido); solo difiere del texto de §6.7 del plan.
7. **`TX_TerminacionesPorRecinto` (tabla Airtable) vacía**: las terminaciones del informe salen de
   `overrides_met6283.json` (2 grupos), no de la base. Causa: hueco estructural puenteado por
   overrides — decisión documentada en el plan («19 rutas… no son diffs de esta tanda»).

---

## 5 · Dictamen final

**BLOQUE 3 — AUDITORÍA: APROBADA.** §6.1–§6.7: **7/7 OK** (6.6 y 6.7 con las reservas
declaradas arriba, ambas previstas por el propio plan). Vistas V1–V5 **OK**, V6 **OK con reserva
D7**. Igualdad vs MET-6283: **~99%** (99,6% en datos), con 7 residuales enumerados, ninguno
introducido por esta tanda y solo D7 con impacto de usuario (login Dropbox para descargar).
