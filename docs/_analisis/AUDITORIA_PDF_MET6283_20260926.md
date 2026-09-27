# AUDITORÍA UNIVERSAL — ¿Puede el sistema producir HOY un PDF idéntico en contenido a MET-6283?

> Tanda **T-AUDIT-PDF-MET6283-20260926** · 26-sep-2026 · SOLO LECTURA (cero writes en Airtable/Make/código).
> Cadena auditada: RF-09 → UI Tasador (IF-03) → Motor AT03_Calculos_DAG v11.2.0_v32b1 → Carbone.io.
> Referencia: `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` (8 páginas) · solicitud espejo **VP-2026-0066** (`recNiwM4s1ibr3sbO`).
> Equipo: 5 agentes en paralelo (PDF · Motor · Fuentes · UI · PO/Integración), consolidado por el hilo principal.
>
> **Método de acceso a Airtable (declaración RO-30):** el MCP de Airtable quedó autorizado sin acceso a la base
> en esta sesión (`list_bases` vacío → 403 en todo). Se usó el respaldo permitido: `curl` GET read-only con el
> `AIRTABLE_TOKEN` server-side. Limitación: la REST API no expone el estado deployed/undeployed de las
> Airtable Automations; ese punto se cubrió con `C_AutomationsAirtable` + artefactos del repo.

---

## §1 · Resumen ejecutivo

**NO — hoy, tal cual, el sistema no puede generar un PDF idéntico en contenido a MET-6283.**
El núcleo económico está resuelto y verificado: el motor corrió para VP-2026-0066 y sus **13 valores
terminales reproducen el gold master al céntimo** (valor comercial 20.125,86 UF; remate 13.081,81;
liquidación 16.603,84 — idénticos al PDF). Pero falta la **imprenta** (el pipeline Carbone SC09/SC10 no
existe: hay que reconstruirlo, no reactivarlo), falta el **contrato de plantilla** (la fila `MUTUO_MET.docx`
que la regla ganadora apunta está vacía: sin archivo, sin `variables_requeridas`), faltan los **textos
descriptivos** (síntesis, sector, análisis de referencias — SC-Textos sigue en draft) y **~30% del contenido
cualitativo** (Hoja 3: constructivas, comodidades, sector, plan regulador) hoy se captura en la UI pero se
descarta sin columna destino, o solo existe en el xlsm histórico. Además, en VP-2026-0066 toda la cadena
RF-09 está en cero (0 adjuntos) y su fila de `TX_DatosTasacion` está marcada `origen_dato='tipeado'`, lo
que la hace inmune a RF-09 por diseño (guard T-MC-P0).

## §2 · Tabla completa dato → sistema

Fuente real: (a) RF-09 · (b) Tasador UI · (c) Sistema · (d) solo xlsm MetLife · (e) desconocido/sin escritor.
"VP-0066" = estado real verificado hoy vía REST. Los archivo:línea son evidencia del repo.

### 2.1 Portada e identificación (PDF p.1-2)

| Dato | Sección PDF | ¿Motor? | Tabla.campo | Fuente | UI | VP-0066 | HUECO |
|---|---|---|---|---|---|---|---|
| N° solicitud externo (METLIFE-6283 / 900159638) | Portada + Hoja 1 | no | TX_Solicitudes.numero_solicitud, n_operacion_cliente | c (intake) | IF-02 alta | sí ("METLIFE-6283-TEST") | — |
| Logo / marca institución (Austral Leasing en gold master) | Portada | no | C_VariablesCliente (`Vars_METLIFE_default`) | c (config) | — | **fila vacía** (solo fixtures SANDBOX) | **B2 · P1** |
| Cliente final nombre/RUT | Portada + Hoja 1 | no | TX_Solicitudes.cliente_final_nombre/_rut | c | IF-02 | sí | — |
| Propietario nombre/RUT | Hoja 1 | no | TX_DatosTasacion.propietario_* | b | `tasacion-form` | sí (tipeado) | — |
| Dirección / comuna / región | Portada + Hoja 1 | no | TX_Solicitudes.direccion, comuna→M_Comunas | c | IF-02 | sí | — |
| Nombre condominio | Portada + Hoja 1 | no | **sin columna** (`CAMPOS_SIN_DESTINO`) | e | `seccion-propiedad.tsx:124-133` (se descarta) | — | **P1** |
| Rol SII | Hoja 1 + anexos | no | TX_Solicitudes.rol_sii · TX_DatosTasacion.rol_sii | c / a | IF-02 · RF-09 | sí en solicitud | — |
| Ejecutivo / Tasador | Hoja 1 | no | TX_Solicitudes (links) | c | IF-02 asignación | sí | — |
| Objetivo / Tipo propiedad | Hoja 1 | Filtro 1 | TX_Solicitudes.tipo_informe/tipo_propiedad | c | IF-02 | sí (Refinanciamiento/Casa) | — |
| Fecha tasación (visita) | Hoja 1 + valores | **sí (H3)** | TX_Solicitudes.fecha_visita | b | `tasacion-form.tsx:431` | sí (2026-04-13) | — |
| Sitio/Lote · Zona (IPB) · Manzana | Hoja 1 | no | TX_DatosTasacion.tipo_zona_descripcion (texto libre); Link M_Zonificacion **no cableado** | b / e | `seccion-propiedad.tsx:222-234` | zonificacion vacío | **P1** |
| Piso / Subterráneos / Mansarda | Hoja 1 | no | **sin columna** | e | UI captura y descarta | — | **P1** |
| DFL-2 | Hoja 1 | no | TX_DatosTasacion.dfl2 (fórmula; PATCH la rechaza — CI-023 §2) | c | UI la muestra editable ⚠ | sí | menor |
| Vida útil | Hoja 1 | sí (F_VidaUtil) | TX_Calculos (no persiste hoy) / C_VidaUtil | c | — | lookup=70 en inputs_json, **sin fila TX_Calculos** | **P1 relink** |

### 2.2 Textos descriptivos (Hoja 1)

| Dato | Sección PDF | ¿Motor? | Tabla.campo | Fuente | UI | VP-0066 | HUECO |
|---|---|---|---|---|---|---|---|
| Síntesis de la propiedad | Hoja 1 | no | TX_DatosTasacion.sintesis_descriptiva (**columna existe**) | e — SC-Textos v0.1 DRAFT sin importar | sin campo UI | vacío | **P0** |
| Descripción del sector | Hoja 1 | no | TX_DatosTasacion.descripcion_sector (**existe**) | e — ídem | sin campo UI | vacío | **P0** |
| Análisis de las referencias | Hoja 1 | no | **sin columna ni clave en el schema de SC-Textos** | e | sin campo UI | — | **P0** |
| Declaración del profesional | Hoja 1 | no | — (texto fijo) | plantilla | — | — | PLANTILLA |
| Descripción expropiación | Hoja 1 | no | sin columna (solo n_cert) | e | — | — | P2 |

### 2.3 Referencias / comparables (Hoja 1 tabla + Hoja 2 fichas)

| Dato | Sección PDF | ¿Motor? | Tabla.campo | Fuente | UI | VP-0066 | HUECO |
|---|---|---|---|---|---|---|---|
| Filas REF. OFERTAS (5) y REF. C.B.R. (2) — 13 columnas | Hoja 1 | **sí (b1)** | TX_Comparables (13 campos, `usado_motor_calculo=TRUE`) | **a** (`foto_ofertas_comparables`, 13/13 ruteado, upsert por clave natural) | Sección D **solo lectura** (A-13) · `seccion-comparables.tsx` | **0 filas** (nunca se subió la foto) | mecanismo OK; sin corrección celda a celda (P2) |
| Promedio de la muestra (UF/m²) | Hoja 1 | sí | SCOPE `promedio_uf_m2_muestra` (aritmética A-44, sin homogeneización — CI-057) | c | — | 0 (sin muestra) | — |
| TASACIÓN vs PROMEDIO (-3% / 36%) | Hoja 1 | sí (F_DesviacionVsPromedio v1.0) | TX_Calculos | c | — | **nunca ejecutada** | **P0-quirúrgico: fórmulas linkeadas SOLO a reglas legado, no a las 3 reglas v32 → si gana la regla v32 el Filtro 2 las excluye** |
| Comentarios relevantes por comparable | Hoja 1 (columna vacía en gold master) | no | sin columna | e | — | — | P2 |
| Mapa de referencias con pines | Hoja 2 | no | sin productor (lat/long existen) | e | — | — | **P0 contenido** (Static Maps + decisión de costo) |
| Foto de fachada por comparable | Hoja 2 | no | sin campo | e | — | — | **P0 contenido** |

### 2.4 Análisis de rentabilidad (Hoja 1)

| Dato | ¿Motor? | Tabla.campo | Fuente | UI | VP-0066 | HUECO |
|---|---|---|---|---|---|---|
| Arriendo bruto $/mes · Gasto anual $ | sí | TX_DatosTasacion.arriendo_mensual / gasto_anual (⚠ no los `_clp` — CI-023 §4) | b | Sección H (gateada por `requiere_rentabilidad`) | sí (tipeados) | — |
| Ingreso líquido anual · Renta perpetua | sí | TX_Calculos (F_IngresoLiquidoAnualCLP, F_RentaPerpetuaCLP) | c | — | sí (36.300.000 / 806.666.667 ✓ gold master) | — |
| Tasa exigida (4,5%) | sí | precedencia override > TX_DatosTasacion.tasa_cap_rate > M_Clientes (H5) | b/c | solo override (Secc. G); base no editable | 0.045 en datos | P2 |
| Vida útil remanente · UF/mes arriendo | no (derivados) | no persisten; puente runtime del ensamblador | c | — | solo en `informe-data` | P1 relink |

### 2.5 Cuadro de valoración (Hoja 1) y valores finales

| Dato | ¿Motor? | Tabla.campo | Fuente | UI | VP-0066 | HUECO |
|---|---|---|---|---|---|---|
| Ítems del cuadro (17 columnas: detalle, rol, año, tipo, situación municipal, estado, garantía, origen sup., sup., UF/m² nuevo, D.F., valores) | **sí (b0 SUMIF)** | TX_ItemsCuadroValoracion | b (en VP-0066 transcrito del xlsm: d→b) | Sección C completa `seccion-valoracion.tsx:86-195` (`origenSuperficie` sin columna) | **6 filas** ✓ (⚠ `anno_construccion` guarda índices de fila xlsm 51-56) | dato sucio menor |
| Totales edificación/OO.CC./terreno · VALOR COMERCIAL | sí | TX_Calculos | c | preview no los lee (ver §5) | 13 filas ✓ **20.125,86 UF exacto** | — |
| Valor reposición / seguro incendio / avalúo fiscal UF / remate 65% / liquidación 82,5% (UF+CLP+US$) | sí | TX_Calculos (13 terminales) | c | ensamblador ✓ | ✓ al céntimo | factores 0,65/0,825 hardcodeados en expresión (deuda menor) |
| 1UF= / 1US$= del día | sí (H3) | H_PreciosUF.valor_clp / tipo_cambio_usd | c (robot CRON_UF, serie al día 26-sep) | — | fila 2026-04-13 ✓ (39.894,61 / 890,33) | — |
| Avalúo fiscal CLP (base) | sí | TX_DatosTasacion.avaluo_fiscal_clp | a (`foto_fuente_sii`) | **sin campo UI de captura/corrección** | sí (tipeado) ⚠ `avaluo_fiscal_uf`=339.809.429 (CLP copiado, dato sucio) | **P1** |
| Bienes no considerados garantía | no | flag `aporta_a_garantia` existe por ítem; lector b0 no lo consulta (RB-38/39/54) | b | Sección C ✓ | fila vacía también en gold master | P2 |
| Obras complementarias (tabla propia) | sí (`sum_obras_complementarias_uf`) | TX_ObrasComplementarias | e — **ninguna pantalla la escribe** | — | 0 filas (VP-0066 usa ítems OO.CC del cuadro → ruta b0, no b1) | **P1** |

### 2.6 Hoja 3 — ficha técnica cualitativa

| Dato | Tabla.campo | Fuente | UI | VP-0066 | HUECO |
|---|---|---|---|---|---|
| Exigencias plan regulador (7 filas PRMS/OGUC) | — (M_Zonificacion existe: 1.636 filas sucias, sin cableado) | d/e | — | — | **P1 (L)** |
| Propiedad acogida a (DFL2/6071/9135/19537) · Cumple plan regulador (4) | sin columna | d/e | — | — | **P1** |
| Mercado (demanda/tendencia/densidad/estrato) · Sector (10 atributos) · Uso de terrenos % · Arteria | sin columna | d/e | — | — | **P1** |
| Terreno (forma/pendiente/orientación/frente/deslindes) · Emplazamiento (10 atributos) | sin columna | d/e | — | — | **P1** |
| Características constructivas E.4 (estructura, divisiones, entrepisos, cubierta, rev. exterior, cierros) | **sin columna** — UI captura y descarta (declarado en `noPersistidos[]`, la UI no lo muestra) | b→∅ | `seccion-edificacion.tsx:279-284` | — | **P1** |
| Terminaciones por recinto | TX_TerminacionesPorRecinto (solo pisos/muros/cielos; `material`, `iluminacion`, `estado` sin columna) | b parcial | `seccion-edificacion.tsx:248-253` | 0 filas | **P1 parcial** |
| Otros E.6 (ventanas, sanitarios, grifería, muebles cocina, puerta, closet, protecciones) | sin columna y **ni siquiera declarado en `CAMPOS_SIN_DESTINO` → se pierde en silencio** | b→∅ | `seccion-edificacion.tsx:305-316` · `validators/index.ts:335-362` lo omite | — | **P1 + bug de transparencia** |
| Instalaciones (alcantarillado, agua, electricidad, gas) | sin columna | d/e | — | — | P1 |
| Habitaciones por nivel (matriz recintos × nivel) | TX_HabitacionesPorNivel ✓ | b | E.2 ✓ | 0 filas | — (mecanismo OK) |
| Comodidades (14-16 switches) | **sin tabla** (`TX_Amenities` no existe) | b→∅ | E.5 `seccion-edificacion.tsx:291-297` | — | **P1** |
| Ampliaciones | TX_Ampliaciones (sup, año, descripción; `nPe` sin columna) | b | E.1 ✓ | 0 filas (gold master: "No") | menor |
| Medios baños / baño de servicio | sin columna | b→∅ | `seccion-propiedad.tsx:163-174` | — | P1 |
| Orientación (multivalor) | singleSelect — solo persiste el primer chip | b parcial | `datos/route.ts:247-250` | — | P2 |

### 2.7 Fotos y anexos (Hojas 4-7)

| Dato | Tabla.campo | Fuente | UI | VP-0066 | HUECO |
|---|---|---|---|---|---|
| 18 fotos de la propiedad con leyendas (8 categorías) | TX_Adjuntos (categoría en `descripcion`) | b | `fotos-screen.tsx` ✓ | **0 adjuntos** | mecanismo OK; inserción al PDF depende de plantilla/SC09 (**P0**) |
| Anexo 1: plano, esquema/cuadro de superficies (polígonos A-J), emplazamiento, aérea, ficha SII | TX_Adjuntos (`foto_plano_cuadro_superficies`: **0/19 atributos ruteados**) | d (inserción manual en xlsm) | — | 0 | **P0 (resolver como imágenes en plantilla/SC09)** |
| Anexo 2: rol-avalúo, permiso, CBR, SERVIU, recepción, deuda TGR (imágenes) | TX_Adjuntos por tipo doc | a (docs existen en `_referencias/Met_6283/`) | upload ✓ | 0 | **P0 (ídem)** |
| Datos SII detalle (avalúo total/exento/**afecto**, contribuciones, sobretasa, códigos) | avaluo_total/exento/contribucion ruteados (a); **avaluo_afecto sin columna**; deuda TGR 0/10 ruteado (deliberado) | a/e | — | vacíos | P1/P2 |
| Legales CBR (fojas/número/año) · permiso · recepción (n°+fecha) | TX_DocumentosLegales | a (H4) / b (Secc. F) | `seccion-documentos.tsx` ✓ | **0 filas** | mecanismo OK, datos en cero |
| Notaría / repertorio / vendedor / comprador | sin columna | e | UI captura y descarta | — | P2 |
| Sello SEC (estado/ID/vencimiento) | **sin columna** (Origen v1.7 §2.1 promete `sello_sec`; no existe; `sello_verde_sec` 0/8 ruteado) | e | UI captura y descarta | — | **P1 + discrepancia doc↔schema** |
| Afecto a expropiación SÍ/NO | sin columna (solo n_cert_no_expropiacion ✓) | e | ídem | n_cert vacío | P1 |
| Firma manuscrita del tasador | sin mecanismo (imagen en M_Tasadores propuesta) | e | — | — | **P1** |
| Fecha visado / REVISOR | IF-04 no existe / C_VariablesCliente vacío | e | — | — | P1/P2 |
| Coordenadas lat/long | TX_DatosTasacion.lat/long | a (H3 SERVIU) / b | Secc. F ✓ | vacíos | — |

## §3 · Gaps por escenario: MetLife vs Cliente Nuevo

**MetLife (xlsm histórico como fuente válida).** El xlsm cubre como *fuente de datos* lo que falta de captura
(Hoja 3 cualitativa, unitarios del cuadro, textos) — pero **solo vía transcripción manual** como se hizo en
VP-2026-0066. Aun con esa transcripción, hoy MetLife **no llega al PDF**: no hay render (SC09/SC10), no hay
plantilla con contrato, no hay textos automáticos, no hay mapa/fotos de comparables ensamblados, no hay
firma/revisor/logo configurados. Es decir: los gaps P0 bloquean **también a MetLife**.

**Cliente nuevo (sin xlsm).** Todo lo anterior MÁS: la Hoja 3 cualitativa no tiene ninguna vía (la UI la
captura y la descarta), los unitarios dependen de C_PreciosUnitarios/C_Factores poblados, y el onboarding
comercial (factor_seguro, factor_garantia, tasa_cap_rate en M_Clientes; C_SLA; plantilla por cliente) es
obligatorio o los guards H5/H6/H7 abortan ruidoso. Además el motor solo está verificado al céntimo para la
cadena MetLife+Refinanciamiento+Casa (P0-3 del roadmap): otros tipos caen en reglas legado sin gold master.

## §4 · HUECOS priorizados

| P | Hueco | Solución propuesta | Esfuerzo |
|---|---|---|---|
| **P0** | Pipeline PDF inexistente (SC09/SC10 sin blueprint, inactivos) | Reconstruir como orquestador delgado: `GET /api/tasaciones/[id]/informe-data` (ensamblador ya existe) → Carbone → Dropbox. Requiere API key Carbone + credencial Dropbox válida (la actual es un access token `sl.` expirado) | L |
| **P0** | Plantilla MetLife sin contrato: `MUTUO_MET.docx` vacía (sin archivo, sin `variables_requeridas`); doble fila con `Plantilla_Base_METLIFE` | Poblar `variables_requeridas` desde `lib/informe/matriz-tags.ts` (228 E-ids); ratificar la provisional `docs/_artefactos/plantillas/Informe_VProperty_provisional_v0.docx` o subir la oficial; consolidar en una fila | S/M |
| **P0** | Textos IA sin productor (síntesis, sector, análisis de referencias) | Terminar e importar SC-Textos (los campos destino `sintesis_descriptiva`/`descripcion_sector` **ya existen**, contradiciendo el draft); agregar `analisis_referencias` al schema | M |
| **P0** | Anexos 1-2 y fotos no se ensamblan al PDF | Inserción de imágenes por tipo de documento (`url_dropbox`) en la plantilla, dentro de SC09 | M |
| **P0** | Mapa de referencias + foto por comparable | Google Static Maps desde lat/long (API key + decisión de costo) + campo foto en TX_Comparables | M |
| **P0-quirúrgico** | `F_UFm2_promedio` v3.2 y `F_DesviacionVsPromedio` v1.0 linkeadas SOLO a las 6 reglas legado → si la regla ganadora es v32, el Filtro 2 las excluye y el "-3%" del informe nunca se calcula | Linkear ambas a las 3 reglas v32 (`formulas_resultado`) — cambio manual en Airtable, 10 minutos | S |
| P1 | Hoja 3 "captura y descarta" (CI-023): E.4/E.5/E.6, sector, mercado, emplazamiento, instalaciones, sello SEC, afecto expropiación, condominio, medios baños (~35-40 columnas) | T4 del roadmap: crear columnas en tablas existentes + `TX_Amenities`; la UI ya existe. Bug adjunto: E.6 ni siquiera figura en `CAMPOS_SIN_DESTINO` | L |
| P1 | Avalúo fiscal sin campo de captura/corrección en UI (solo RF-09) | Campo en sección B o F con fallback visible | S |
| P1 | `valor_comercial_uf` sin escritor → preview del tasador muestra "—" sin override | Que el preview lea TX_Calculos (como ya hace el ensamblador) o AT03 persista el terminal en TX_Solicitudes | S |
| P1 | Fórmulas no-terminales no persisten (vida útil, UF-mes, promedios) — hoy las puentea el ensamblador en runtime | Relink en C_Formulas (mismo movimiento que el P0-quirúrgico) | S |
| P1 | Config por cliente vacía: logo, revisor (C_VariablesCliente), firma tasador (M_Tasadores) | Poblar config real MetLife/Austral + imagen de firma | S |
| P1 | Onboarding comercial cliente nuevo (H5/H6/H7) · motor sin verificar fuera de Refi+Casa | Checklist RF-34 + clonar reglas v32 por tipo con gold masters de los otros 5 PDFs | M |
| P1 | TX_ObrasComplementarias sin pantalla (el motor la suma; la ruta b0 del cuadro la sustituye) | Decidir: o UI propia o declarar la ruta cuadro como canónica y documentarlo | S |
| P2 | Notaría/repertorio/avaluo_afecto/deuda TGR/comentarios por comparable sin columna · orientación multivalor · tasa base no editable · zonificación estructurada | Columnas nuevas + decisiones de negocio (regla contribución ×2, M_Zonificacion) | S-M |

## §5 · Botones "Leer documentos" y "Calcular"

**"Leer documentos" — el botón no existe como tal (regla T-C: no nombrar el medio técnico), y no hace falta que exista.**
La extracción se dispara sola: upload (`POST /api/adjuntos/upload` → Make SC-Adjuntos-Upload → Dropbox +
fila TX_Adjuntos) → automations `AT-RF09-Trigger`/`-Update` → Make SC-RF09 v2.2 (Claude API) escribe
`atributos_obtenidos` → automation **AT03-Ext** rutea a TX_DatosTasacion/TX_Unidades/TX_DocumentosLegales/
TX_Comparables según `D_TipoDocumentoAtributo` (solo-si-vacío + guard `origen_dato='tipeado'`). La pantalla
`/tasaciones/[id]/lectura` **solo observa** el avance (`estado-procesando.tsx` sondea
`GET /api/tasaciones/[id]/lectura`). Qué anda: la cadena completa está activa y el ruteo cubre 60 de 151
atributos catalogados (comparables 13/13, foto SII 21/21). Qué falta: AT03-Ext declara en su docblock
"escrito pero no probado contra Airtable real"; 3 tipos de documento no rutean nada (`sello_verde_sec`,
`certificado_deuda_tgr`, `foto_plano_cuadro_superficies`); y **para VP-2026-0066 nunca corrió** (0 adjuntos)
— además su fila `tipeado` bloquearía la escritura en TX_DatosTasacion (las tablas hijas vacías sí recibirían).

**"Calcular" — funciona y está bien protegido.** `handleCalcular` guarda primero
(`PATCH /api/tasaciones/[id]/datos`; si falla no calcula), luego `POST /api/tasaciones/[id]/calcular`, que
valida estado (409 anti doble disparo) y hace **un único update `estado='visitada'`** — eso gatilla la
automation AT03 (trigger por estado, sin webhook). El motor borra TX_Calculos previos, evalúa y escribe una
fila por fórmula, y transiciona a `calculada`; la UI sondea `/estado` hasta habilitar el preview. Qué falta:
si AT03 aborta por guard (H3/H5/H6/H7) la solicitud queda en `visitada` y la pantalla **gira sin mensaje de
error** (la causa queda solo en A_Eventos); y el preview no lee TX_Calculos (ver §4-P1 `valor_comercial_uf`).

## §6 · Plantilla Carbone MetLife

La decisión de AT01 para VP-2026-0066 apunta `plantilla_resultado` → **`MUTUO_MET.docx`**
(`recK3ICXfmbEdWpFQ`, activa): `variables_requeridas`, `variables_opcionales`, `url_dropbox`,
`archivo_docx_url` y `template_id_carbone` — **todos vacíos**. Existe una segunda fila MetLife
(`Plantilla_Base_METLIFE`, TPL-MET-CASA-001) con un `url_dropbox` genérico no verificable y también sin
variables. Ninguna de las 16 plantillas de C_Plantillas tiene contrato poblado. La fuente de verdad
ejecutable del contrato es **`lib/informe/matriz-tags.ts`** (228 E-ids del gold master, clasificados:
23 grupos OK · 20 HUECO · 5 METLIFE_ONLY · 5 PLANTILLA) sobre `InformeContexto`, servido por
`GET /api/tasaciones/[id]/informe-data`. **Bonus layout (no auditado a fondo):** la plantilla provisional
`Informe_VProperty_provisional_v0.docx` se generó desde esa matriz, así que está alineada al contenido por
construcción; el layout visual oficial (marca en portada, bloques de Hoja 4) no está replicado — la `.docx`
oficial sigue pendiente de Sergio.

## §7 · Deuda de artefactos

| Artefacto | Estado registro/producción | Estado repo | Deuda |
|---|---|---|---|
| SC01 alta interna (6483077) ACTIVO | **sin fila propia en Z_EscenariosMake** (la fila "SC01" es el alias E1/Tally 5748459) | blueprint ✓ | registrar |
| SC-Adjuntos-Delete | sin fila en registro | blueprint ✓ | registrar |
| SC-SLA-Envio (7597712) | inactivo ✓ | blueprint solo en `_evidencia/T-MAKE-SLA-ENVIO-20260924/` | copiar a `_artefactos/make/` |
| SC05 (6780103) | registro dice "En_construccion" — real: construido e inactivo | blueprint ✓ | actualizar registro |
| SC-Adjuntos-Upload | **anomalía: dos versiones activas** (6839979/6527528) | blueprint ✓ (¿de cuál?) | saneo pendiente (PARIDAD 24-sep §5) |
| E2/SC09 · E3/SC10 (pipeline PDF) | "Pendiente", inactivos | **sin blueprint** | **P0: reconstrucción total** |
| AT-RF09-Trigger-Update | ACTIVA en producción | **sin script versionado** (se asume igual a la gemela, sin evidencia) | versionar |
| CRON_UF_Diaria | registro dice "Pendiente" pero H_PreciosUF tiene fila de hoy | script ✓ | sanear registro (y fila zombie SC15) |
| AT04_Validar_Rangos | undeployed | script ✓ | los flags de rango del informe no corren |
| AT03_Calculos_DAG | activa | script ✓ v32-b1 | verificar byte-paridad paste↔repo (certificada para AT03-Ext, no para AT03) |
| SC-Textos | no registrado | blueprint v0.1 DRAFT ✓ | actualizar módulo 11 (los campos destino ya existen) e importar |

Desalineación de datos adicional: AT03-Ext rutea 4 atributos a **TX_Unidades** con `usado_motor_calculo=TRUE`,
pero el motor **nunca abre TX_Unidades** — flag aspiracional, redeclaración pendiente (decisión A4).

## §8 · Recomendación consolidada del equipo

Sergio: los números ya están — el motor reproduce MET-6283 al céntimo y no hay que tocarlo. Lo que falta es
la imprenta y el relleno. Nuestra recomendación es una secuencia de dos tandas cortas y una grande:
**(1) tanda quirúrgica de 3 pasos S** — linkear las 2 fórmulas nuevas a las reglas v32 (10 min en Airtable,
sin esto el "-3%" del informe no existe), poblar el contrato de `MUTUO_MET.docx` desde `matriz-tags.ts` +
ratificar la .docx provisional, y poblar config MetLife (logo/revisor/firma); **(2) tanda M** — terminar e
importar SC-Textos (los campos destino ya existen) y probarlo con VP-2026-0066; **(3) tanda L (la única
trabada por ti)** — reconstruir SC09/SC10 consumiendo `informe-data`, que ya entrega los 13 terminales:
necesita API key de Carbone y renovar la credencial Dropbox. Con (1)+(2)+(3) sale un PDF MetLife completo en
contenido numérico y textual; la Hoja 3 cualitativa (T4, ~35-40 columnas) puede ir después porque hoy ni
siquiera MetLife la persiste. Primero de todo: la tanda (1) — es un día de trabajo y desbloquea las otras dos.

---

*Entregables de esta tanda: este documento + `AUDITORIA_PDF_MET6283_20260926.xlsx` (2 hojas) + cierre en
`claude-out.txt`. Reportes fuente: 5 agentes (PDF, Motor, Fuentes, UI, PO) — 26-sep-2026.*
