# PLANO DE CONSTRUCCIÓN — `docs/_artefactos/carbone/PLANTILLA_MET_v1.docx` (T-PDF-IMPRENTA-20260927 · Fase 1 · Agente 2)

## §0 · Fuentes verificadas y correcciones al enunciado

| Fuente | Verificación |
|---|---|
| PDF oráculo | `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` — **8 páginas A4 verticales (595,32 × 841,92 pt)**, renderizadas e inspeccionadas completas vía PyMuPDF (el tool Read falló por falta de poppler; se usó `fitz` 1.28.2 disponible en python3). Página 1 = Portada (sin folio); páginas 2-8 = Hoja N°1 … Hoja N°7 |
| XLSM generador | `docs/_referencias/1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm` — 21 hojas; el PDF se imprime desde la hoja **`Impresion`** (A1:BW554, escala 61%, márgenes L/R 0,197″ ≈ 0,5 cm, 7 bandas de ~84 filas: `Hoja N°1`=filas 1-85, `N°2`=86-143, `N°3`=144-218, `N°4`=219-302, `N°5`=303-386, `N°6`=387-470, `N°7`=471-554) + hoja `Portada` (A1:BV85, escala 65%, márgenes 0,39″ ≈ 1 cm) |
| Contrato Airtable | `C_Plantillas` **recK3ICXfmbEdWpFQ** (`TPL-MET-CASA-001` · `MUTUO_MET.docx` · version 1 · activa · cliente MetLife recIg8NtVhptXkEUJ): **`variables_requeridas` = 52 tags · `variables_opcionales` = 24 tags · TOTAL = 76 — el "77" del enunciado es incorrecto** |
| Contrato TS | `lib/informe/tipos.ts` (InformeContexto) · `lib/informe/matriz-tags.ts` (53 grupos, 228 E-ids) · `lib/tasador/lectura-informe.ts:128-164` (DatosSii, AntecedentesLegales) |
| Solicitud de prueba | VP-2026-0067 (recmMzeu3eWGxyXsf, estado `calculada`): 15 filas TX_Calculos, 6 ítems cuadro, 7 comparables, 8 adjuntos (todos documentos RF-09, **0 fotos de propiedad**), 0 ampliaciones/habitaciones/terminaciones, **sin visador asignado**, sin `ejecutivo_solicitante`, sin `n_operacion_cliente` |
| Endpoint para el harness Fase 2 | `app/api/tasaciones/[id]/informe-data/route.ts` — devuelve el `InformeContexto` de recmMzeu3eWGxyXsf |

**Tipografía real del PDF (fonts embebidas):** solo `Calibri`, `Calibri Bold` y `Arial Narrow Bold`. Tamaños efectivos medidos por spans: portada = Calibri 18 pt (títulos de banda) y Calibri Bold 10,8 pt (fichas); Hoja 1 y Hoja 3 = Calibri **4,8 / 5,4 / 6,0 / 6,6 pt** (¡el 61% de escala de impresión comprime Calibri 8-11 del xlsm!); encabezados repetidos Hojas 2-7 = Calibri Bold 7,2 pt con folio "Hoja N°X" en 6,0 pt; títulos de sección de hojas interiores 8,4-9,6 pt.

**Paleta medida:** barra de título y sidebars = azul corporativo (≈ `#075899`, el mismo token del repo); fondos de rótulo gris claro; bordes de tabla negros finos; caja "VALOR TASACIÓN" con banda gris.
*(Nota del consolidador: el Agente 4 midió el fill exacto del XLSM = `#095085`; ese es el valor que usa el generador.)*

---

## §1 · Estructura por sección (layout, fijo vs `{d.*}`)

### 1.1 PORTADA (página 1 · hoja xlsm `Portada`)

Estructura vertical, sin folio, sin encabezado:

1. **Barra azul** ancho completo, texto centrado blanco Calibri 18: `INFORME DE TASACION` — **FIJO**.
2. **Recuadro con borde azul** centrado (~70% del ancho, ~1/3 de la página) con el **logo VProperty + "Tasaciones Bienes Raíces"** — **FIJO** (imagen estática embebida en la plantilla; en el gold master la portada NO lleva logo del cliente — página 1 del PDF). Fuente del asset: no hay logo en el repo → **GAP-asset menor**: extraer el logo de la página 1 del PDF (es la única imagen de esa página, `page.get_images` = 1) durante Fase 2.
3. **Barra azul** `ANTECEDENTES` — **FIJO**.
4. **Recuadro** con tabla de 2 columnas (rótulo bold / valor bold, Calibri 10,8), 7 filas: Numero Solicitud, Institución, Nombre Cliente, Rut, Dirección Propiedad (2 líneas), Comuna, Región — **valores `{d.*}`** (ver §2-A).
5. **Recuadro pie corporativo** 2×2 — **FIJO**: `www.valueproperty.cl` / `Mail: info@valueproperty.cl` / `Dirección: Santa Magdalena 75 Of 310, Providencia - Santiago` / `Fono: 22 500 0366` (texto extraído literal de la página 1).

### 1.2 HOJA N°1 (página 2 · "Impresion" filas 1-85) — la hoja más densa

Marco exterior: barra azul superior `INFORME DE TASACION` (fija); banda encabezado con `Nº Interno : {valor}` y `Hoja N°1` a la derecha (folio **FIJO** por hoja). **Sidebars verticales azules** con texto rotado 90° a la izquierda de cada bloque: `Identificación`, `Síntesis de la Prop.`, `Referencias y Mercado`, `Valores y Firma` — **FIJOS**.

Bloques en orden:

- **B1 Identificación** — grilla de pares rótulo:valor en **3 columnas de pares** (col A rótulos personas, col B rótulos ubicación, col C rótulos técnicos) + **recuadro "Ubicación/Empresa"** arriba a la derecha con mini-mapa (imagen) y foto — 19 filas aprox. Columna izquierda: Cliente, RUT Cliente, Propietario, RUT Prop., Ejecutivo, Tasador, Objetivo, Tipo Prop., Fecha Tasación, Destino SII, Ejecutivo (2º, vacío), Formalizador (vacío), N° SOLICITUD. Centro: Dirección, Casa Nº, Comuna, Region, Rol, Condominio, Pisos Propiedad, (Sitio/Lote), Zona, Manzana, Estacionamientos Asociados/Asignados, Bodegas, Mansarda. Derecha: DFL-2, Año Construccion, Vida util, Permiso, Recepcion, Ampliación, Subterraneos, Estado conservacion, Sello SEC, Afecto a expropi., Fuente Información, **Descripcion Expropiación** (celda con fondo destacado y párrafo multilinea).
- **B2 Síntesis de la Prop.** — un párrafo corrido de ~4 líneas Calibri 4,8 — `{d.textosIA.sintesisPropiedad}` + segundo párrafo del sector `{d.textosIA.descripcionSector}`.
- **B3 REF. OFERTAS** — tabla de 12 columnas: `N°` (1-5) · fecha `abr-26` · `Dirección referencias` · `Teléfono` · `Año` · `Total UF` · `Sup. Terreno.` · `Sup. Constr.` · `OO.CC.` · `UF/m² T.` · `UF/m² C.` · `Comentarios Relevantes` (columna derecha, celda alta combinada, vacía en el oráculo). Debajo **3 filas de agregados**: `PROMEDIO DE LA MUESTRA`, `TASACION`, `TASACION V/S PROMEDIO DE LA MUESTRA` (esta última solo muestra un % en la columna UF/m²C: **-3%**).
- **B4 REF. C.B.R.** — misma tabla, filas 6-9 (7-8-9 con fila 8-9 vacías), columna 4 pasa de `Teléfono` a `Foja y Número`; a la derecha, en vez de comentarios, el recuadro **ANALISIS DE RENTABILIDAD** (8 pares rótulo:valor: Vida Util Remanente Años · Arriendo Bruto $/mes · UF/mes · Gasto Anual $ · Tasa Exigida Proyecto · Tiempo Renta (años) · Ingreso Líquido Anual · Renta Perpetua). Debajo los mismos 3 agregados (TASACION V/S = **36%**).
- **B5 ANÁLISIS DE LAS REFERENCIAS** — párrafo boilerplate **FIJO** (literal completo capturado: «Las muestras fueron seleccionadas por ser propiedades que comparten características similares en cuanto a dimensiones, programa, tipología de edificación, sector y se homologa en función a sus características propias como; diseño constructivo, calidad de sus materiales, calidad de sus revestimientos interiores y estado de mantención.»).
- **B6 CUADRO DE VALORACION** — tabla de 16 columnas: `Item` · `Nº` · `Detalle Item valorado` · `Rol SII` · `Año` · `Situación Municipal` · `Estado` · `Grntía.` · `Origen Super` · `Superficie m²` · `UF/m² Nuevo` · `D. F.` · `UF/m²` · `Valor Comercial UF` · `Valor Seguros UF` · `Valor Liquidación UF`. 6 filas de datos en el oráculo (Terreno/Terreno, Terreno/Servidumbre, Edificación/Piso 1, Piscina, OO.CC ×2) + 3 subtotales (`TOTAL EDIFICACION`, `TOTAL OBRAS COMPLEMENTARIAS`, `TOTAL TERRENO`) + fila `VALOR COMERCIAL NORMAL` (UF 20.125,86 · 8.907,06 · 16.603,84).
- **B7 fila BIENES NO CONSIDERADOS GARANTIA :** — rótulo fijo, valor (vacío en oráculo).
- **B8 FOTO FACHADA** (mitad izquierda) — foto grande de la fachada con rótulo fijo `FOTO FACHADA`.
- **B9 VALOR TASACIÓN** (mitad derecha) — caja: fila título fija; fila `UF 20.125,86 · $ 802.913.431 · al 13-04-2026`; fila `Velocidad de venta normal : 8 A 10 MESES`; fila `1UF = $ 39.894,61 · 1US$ = $ 890,33`; tabla de 5 valores × 4 columnas (`rótulo : | US$ <v> | UF <v> | $ <v>`): Valor de Reposición, Seguro Incendio y otros, Avalúo fiscal propiedad, **Valor a Remate 65%** (fila destacada azul), Liquid. Normal **82,5%**. Los % 65/82,5 son **FIJOS** de plantilla.
- **B10 Firma** — bloque izquierdo: Tasador, Visador, Fecha visita (formato largo `13 de abril de 2026`), Fecha Visado, `REVISOR`, Fecha revisión; centro: `Firma :` + imagen firma manuscrita.
- **B11 Declaración legal** — párrafo fijo de 6 líneas (literal completo extraído en la página 2: «El profesional que firma declara que no tiene hoy, ni espera tener en el futuro, interés en la propiedad tasada…exigencias de la Institución, que desde ya declara conocer y aceptar.»).

### 1.3 HOJA N°2 (página 3) — Plano de emplazamiento y referencias

Encabezado repetido (patrón Hojas 2-7): tabla de 2 filas × 4 celdas: `Nombre Cliente | {v} | Dirección | {v}` / `RUT | {v} | Nº Interno | {v}` + folio `Hoja N°2`. Sidebar vertical `Plano de Emplazamiento y referencias`.

- Título barra: `Mapa de ubicación de referencias` — FIJO.
- **Mapa** (~55% de la página): imagen satelital/plano con pines numerados 1-3, pin rojo `Propiedad` y globo `CBR` — una sola imagen compuesta en el oráculo (pegada a mano en el xlsm).
- **3 fotos "Fachada"** en fila (fachadas de las referencias 1-3), rótulo `Fachada` bold sobre cada una.
- **3 fichas** `Referencia Nº 1|2|3` en columnas, cada una con 7 pares: Tipo, Dirección, Valor UF, Año (formato `2.015` con punto de miles — así viene el oráculo, E-124: la plantilla nueva lo normaliza a `2015`), Sup const (`239,00 m²`), Terreno (`5.051,00 m²`), Telefono.

### 1.4 HOJA N°3 (página 4) — Ficha técnica (la mitad cualitativa)

Encabezado repetido + folio. Sidebars verticales: `Exigencias`, `Sector`, `Arteria`, `Terreno`, `Emplazamiento`, `Características Constructivas`, `Habitaciones`, `Ampliaciones` (y banda `Servicios` implícita). Bloques:

- **Exigencias** — 3 sub-tablas: normativa (Superf. Predial Mínimo/Frente Predial Mínimo/% Ocupación Suelo/Sistema Agrupamiento + Coef Máx Constructib/Altura Edificación/Distancia medianero/Antejardin, con fuentes PRMS/OGUC); `PROPIEDAD ACOGIDA A:` (D.F.L. 2 / LEY 6071 / LEY 9135 / LEY 19537 — SI/NO); `CUMPLE PLAN REGULADOR VIGENTE` (Según uso actual SI · Según tipo construcción SI · **Uso mas probable del bien: HABITACIONAL** en rojo · Cambios en Plan Regulador: NO CONTEMPLA).
- **Sector** — fila Demanda/Tendencia/Densidad/Mercado/ABC1; tabla Destino barrio/Tipo zona/Calzada/Acera/Solera/Solerilla + Antejardín/Agua Potable/Gas/Proy. Uso Terrenos + `Uso de terrenos` (Casas 10% · Deptos. — · Comercial 1% · Industrial — · Sitios Eriazos 35% · Equip. Com 1% · Otros 8% — pares con `%`).
- **Arteria** — 1 fila: `Arteria Principal : Caletera Oriente Gral San Martín`.
- **Terreno** — Superficie/Forma/Pendiente/Orientación + Frente/Contrafrente/NORTE/SUR + ratio (0,599).
- **Emplazamiento** — 10 pares (Tipo agrupamiento CONDOMINIO, Diseño TIPICO, Utilidad Funcional ADECUADA, Tipo Adosamiento AISLADA, Calidad constructiva BUENA / Estado de conservación BUENO, Predio y/o vista BUENO, Orientación construcción NORTE, Relación Terr/Constr ADECUADO, Iluminación natural ADECUADA).
- **Características Constructivas** — 2 tablas gemelas de 4 columnas (`Elementos Fundamentales | Materialidad/Tipo | Calidad | Estado` y `Otros | Materialidad/Tipo | Calidad | Estado`): 8 filas izquierda (Estructura Soportante…Construcción anexo) y 8 derecha (Aire Acondicionado…Ventanas).
- **Terminaciones** — tabla 7 columnas: `Terminaciones | Tipo de Pavimento | Material/Marca/Origen | Revestimiento de Muros | Terminación de Cielo | Iluminación | Estado` × 5 recintos (Estar, Dormitorios, Espacios de circu, Cocina, Baños).
- **Servicios** — Alcantarillado/Agua Potable/Electricidad + Gas/Otros.
- **HABITACIONES** — matriz de 13+ columnas (`Comedor · Living · Estar · Hall · Suite · D. Simple · D. Serv · Cocina · Escritorio · Baños · 1/2 Baño · Bñ Serv · Loggia · Otros · Superficie (m2)`) × filas `Subterráneo / Recintos 1 Nivel / Recintos 2 Nivel / Recintos 3 Nivel / Totales`, con fila resumen `Total Recintos: 16 · Dormitorios 4 · Baños: 4 · Dorm Serv.: 1 · Baño Serv.: 1 · Total: 249,91 m²`.
- **COMODIDADES** — 16 pares SI/NO en 4 columnas (Muebles de Cocina, Comedor de Diario, Patio de servicio, Estacionamiento, Piscina, Gimnasio, Sauna, Bodega, Jardin conformado, Calefacción, Alarma, Protecciones/Rejas, Aspiración central, Climatización, Purificador de aire, Corrientes. Débiles).
- **Ampliaciones** — 3 filas: `Ampliacion N : Regulado | Permiso de edificacion: | Recepcion final: | Regulación | Metros Cuadrados`.

### 1.5 HOJAS N°4 y N°5 (páginas 5-6) — Fotos de la Propiedad

Encabezado repetido + folio + título `Fotos de la Propiedad` + sidebar vertical `Fotos de la propiedad`. **Grilla 2×4 = 8 fotos por hoja**, cada celda con la foto arriba y **rótulo centrado bold debajo** (página 5: Ubicación, Planificación, Fachada, Sector, Living, Comedor, Cocina, Baño de visitas; página 6: Dormitorio Principal, Baño Principal, Dormitorio, Dormitorio, Sala de estar, Piscina, Terraza + Quincho, Fachada posterior - Patio trasero). En el oráculo la celda 1 de la Hoja 4 es un plano de ubicación y la 2 la planta — son fotos categorizadas, no bloques distintos.

### 1.6 HOJAS N°6 y N°7 (páginas 7-8) — Anexos

Encabezado repetido + folio + barra `ANEXO N°1` / `ANEXO N°2` + fila `Anexo N° 1: Comentarios` (valor vacío). Contenido = **imágenes de documentos** pegadas: Hoja 6: `PLANO`, `ESQUEMA DE SUPERFICIES`, `INFORMACION DE SII`, más cuadro de superficie y planta de emplazamiento; Hoja 7: `ROL - AVALUO`, `PERMISO DE EDIFICACIÓN`, `NO EXPROPIACIÓN SERVIU`, `RECEPCION FINAL` (rótulos fijos con la imagen del documento debajo).

---

## §2 · TABLA EXHAUSTIVA DE ETIQUETAS (sección → posición → tag → contrato → valor esperado VP-2026-0067 → GAP)

Convenciones: sintaxis Carbone con loops `{d.lista[i].campo}` / fila siguiente `{d.lista[i+1].campo}`; formatters con **`lang: es-cl`** en las opciones de render de SC09 para que `:formatN()` produzca `.` de miles y `,` decimal. `Ø` = null/vacío hoy. Los valores esperados provienen de los GET del 2026-09-27 sobre recmMzeu3eWGxyXsf y sus tablas hijas.

### A · PORTADA

| # | Posición | Etiqueta Carbone | Contrato | Valor esperado 0067 | GAP |
|---|---|---|---|---|---|
| A1 | Barra título | texto fijo `INFORME DE TASACION` | — (PLANTILLA, E-01) | — | — |
| A2 | Recuadro logo | imagen estática VProperty | — (matriz E-02 reserva `{d.clienteInforme.logoUrl}` para marca cliente; el gold master NO la muestra en portada) | — | asset a extraer del PDF p.1 |
| A3 | Numero Solicitud | `{d.meta.numeroSolicitudCliente}` | `meta.numeroSolicitudCliente` | `METLIFE-6283-REAL` | — |
| A4 | Institución | `{d.clienteInforme.nombre}` | `clienteInforme.nombre` | `MetLife` (M_Clientes recIg8NtVhptXkEUJ) | — |
| A5 | Nombre Cliente | `{d.partes.propietario}` | `partes.propietario` | `FRANCISCO JOSE VERGARA UNDURRAGA` | — |
| A6 | Rut | `{d.partes.rut}` | `partes.rut` | `16.610.203-0` | — |
| A7 | Dirección Propiedad | `{d.propiedad.direccion}` | `propiedad.direccion` | `LOS EUCALIPTUS 2100` (el oráculo decía "LOS EUCALIPTUS, Casa: N°2100, Condominio…" — diferencia de dato, no de plantilla) | — |
| A8 | Comuna | `{d.propiedad.comuna}` | `propiedad.comuna` | `Colina` | — |
| A9 | Región | `{d.propiedad.region}` | `propiedad.region` | `Metropolitana de Santiago` | — |
| A10 | Pie corporativo | 4 textos fijos (§1.1.5) | — (PLANTILLA, E-11..14) | — | — |

### B · HOJA N°1 — Identificación

| # | Posición | Etiqueta | Contrato | Valor 0067 | GAP |
|---|---|---|---|---|---|
| B1 | Encabezado `Nº Interno` | `{d.meta.numeroSolicitudCliente}` | `meta.numeroSolicitudCliente` | `METLIFE-6283-REAL` (el oráculo muestra `METLIFE -6283` acá; decisión: un solo tag, el del cliente) | — |
| B2 | Cliente | `{d.partes.propietario}` | `partes.propietario` | FRANCISCO JOSE VERGARA UNDURRAGA | — |
| B3 | RUT Cliente / RUT Prop. | `{d.partes.rut}` (×2) | `partes.rut` | 16.610.203-0 | — |
| B4 | Propietario | `{d.partes.propietario}` | ídem B2 | ídem | — |
| B5 | Ejecutivo | `{d.partes.ejecutivo}` | `partes.ejecutivo` | **Ø** (0067 sin `ejecutivo_solicitante`) | GAP-dato (cargable en Airtable) |
| B6 | Tasador | `{d.partes.tasador.nombre}` | `partes.tasador.nombre` | `Nelcy Jaimes` (recJPSCLckxLuf9nV; oráculo: Maria Eugenia Soto) | — |
| B7 | Objetivo | `{d.propiedad.objetivo}` | `propiedad.objetivo` | `Refinanciamiento` | — |
| B8 | Tipo Prop. | `{d.propiedad.tipoPropiedad}` | `propiedad.tipoPropiedad` | `Casa` | — |
| B9 | Fecha Tasación | `{d.partes.fechaVisita:formatD(DD-MM-YYYY)}` | `partes.fechaVisita` | `13-04-2026` | — |
| B10 | Destino SII | `{d.sii.destinoSii}` | `sii.destinoSii` | `HABITACIONAL` | — |
| B11 | Ejecutivo (2º) / Formalizador | celdas fijas vacías | — (E-29/30, HUECO P2) | — | por diseño |
| B12 | N° SOLICITUD | `{d.meta.nOperacionCliente}` | `meta.nOperacionCliente` | **Ø** (oráculo: 900159638) | GAP-dato |
| B13 | Dirección | `{d.propiedad.direccion}` | `propiedad.direccion` | LOS EUCALIPTUS 2100 | — |
| B14 | Casa Nº | — sin ruta separada (el oráculo divide dirección/número) | — | Ø | GAP-contrato menor: dirección completa en B13, ésta vacía |
| B15 | Comuna / Region | `{d.propiedad.comuna}` / `{d.propiedad.region}` | ídem A8/A9 | Colina / Metropolitana de Santiago | — |
| B16 | Rol | `{d.sii.rolSii}` | `sii.rolSii` | `00882-00040` (oráculo: `N°882-40` — formato distinto; normalización cosmética, no bloquea) | — |
| B17 | Condominio | `{d.propiedad.proyectoCondominio}` | `propiedad.proyectoCondominio` | Ø (0067 sin dato) | GAP-dato |
| B18 | Pisos Propiedad | `{d.propiedad.pisos}` | `propiedad.pisos` | Ø | GAP-dato |
| B19 | Sitio/Lote · Zona · Mansarda · Subterraneos · Sello SEC · Afecto a expropi. · Fuente Información | — celdas vacías fijas (grupo `cualitativa.detallePropiedad` = null P1-1; NO poner el tag de grupo) | `cualitativa.detallePropiedad` | Ø | **GAP estructural P1-1** |
| B20 | Manzana | `{d.sii.codManzana}` | `sii.codManzana` | `882` | — |
| B21 | Estacionamientos Asociados/Asignados | `{d.propiedad.estacionamientos}` (asociados) · celda vacía (asignados, sin ruta) | `propiedad.estacionamientos` | Ø (0067) | GAP-dato + GAP-contrato (asignados) |
| B22 | Bodegas | `{d.propiedad.bodegas}` | `propiedad.bodegas` | Ø | GAP-dato |
| B23 | DFL-2 | `{d.propiedad.dfl2}` | `propiedad.dfl2` | `NO` | — |
| B24 | Año Construccion | `{d.propiedad.anioConstruccion}` | `propiedad.anioConstruccion` | `2020` (oráculo: 2024) | — |
| B25 | Vida util | `{d.propiedad.vidaUtil}` | `propiedad.vidaUtil` | **Ø** (P1-9, F_VidaUtil fuera de regla) | GAP P1-9 |
| B26 | Permiso | `{d.legales.permisoEdificacion}` | `legales.permisoEdificacion` | `319-2020` + fecha (rec7t4cD2zjuJKpXq; oráculo `N°319  09/09/2020`) | — (verificar composición del string en Fase 2) |
| B27 | Recepcion | `{d.legales.recepcionFinal}` | `legales.recepcionFinal` | `210-2024` / `18-07-2024` (oráculo `N°210  18/07/2024`) | — |
| B28 | Ampliación | celda `No` fija con nota (presencia de ampliaciones) | `recintos.ampliaciones` | 0 filas → `No` | aproximación |
| B29 | Estado conservacion | `{d.propiedad.estadoConservacion:upperCase}` | `propiedad.estadoConservacion` | `Bueno` → `BUENO` | — |
| B30 | Descripcion Expropiación | `{d.textosIA.textoExpropiacion}` | `textosIA.textoExpropiacion` | **Ø** (P1-1) | GAP P1-1 |
| B31 | Recuadro Ubicación/Empresa (mini-mapa + foto) | `{d.mapa.staticMapUrl}` como imagen | `mapa.staticMapUrl` | **Ø** (P1-4) | GAP P1-4 — placeholder |

### C · HOJA N°1 — Síntesis / Referencias / Rentabilidad

| # | Posición | Etiqueta | Contrato | Valor 0067 | GAP |
|---|---|---|---|---|---|
| C1 | Síntesis de la Prop. | `{d.textosIA.sintesisPropiedad}` | `textosIA.sintesisPropiedad` | **Ø** (P0-2, sin productor) | GAP P0-2 |
| C2 | Párrafo sector | `{d.textosIA.descripcionSector}` | `textosIA.descripcionSector` | **Ø** | GAP P0-2 |
| C3 | REF. OFERTAS / REF. C.B.R. — loop filas | `{d.comparablesInforme.filas[i].direccion}` · `[i].precioUf:formatN(0)` · `[i].supTerreno:formatN(2)` · `[i].supConstruida:formatN(2)` · `[i].anio` · `[i].ufM2Construccion:formatN(2)` · `[i].tipoReferencia` — **filtro Carbone por tipoReferencia** para calcar el layout (fallback: tabla única con columna Tipo) | `comparablesInforme.filas[]` | 7 filas: 5 Oferta + 2 CBR | ⚠ el contrato NO separa ofertas de CBR |
| C4 | Columna fecha (`abr-26`) | sin ruta (`fecha_publicacion` no viaja) | — | mar-25/abr-26 | **GAP-contrato** — columna vacía v1 |
| C5 | Columna Teléfono | sin ruta (`telefono_contacto` no viaja) | — | 979998714… | **GAP-contrato** |
| C6 | Columna Foja y Número (CBR) | sin ruta (`foja`/`numero` no viajan) | — | 40132-55521 · 47523-66056 | **GAP-contrato** |
| C7 | Columna OO.CC. | sin ruta (`oo_cc_uf` no viaja) | — | 750/750/500/750/500/700/700 | **GAP-contrato** |
| C8 | Columna UF/m² T. | sin ruta (`uf_m2_terreno_f` no viaja) | — | 2,20 … 2,70 | **GAP-contrato** |
| C9 | Columna UF/m² C. | `{d.comparablesInforme.filas[i].ufM2Construccion:formatN(2)}` | `filas[].ufM2Construccion` | 83,68 · 104,18 · 77,38 · 92,64 · 71,59 · 82,00 · 50,00 — **⚠ el oráculo muestra los homologados `_f` (34,05 · 31,45 · 25,18…), que no viajan** | **GAP-semántica** |
| C10 | Comentarios Relevantes | sin ruta (E-69) | — | Ø | GAP P2-3 — celda vacía |
| C11 | Fila PROMEDIO DE LA MUESTRA | `{d.comparablesInforme.promedioUfM2:formatN(2)}` (solo UF/m²C) | `comparablesInforme.promedioUfM2` | motor: `30,91` — **⚠ oráculo: DOS promedios por bloque (33,64 ofertas · 24,08 CBR) + columnas promedio** | **GAP-diseño**: v1 imprime el global; demás celdas vacías |
| C12 | Fila TASACION | `Total UF`=`{d.terminales.valorComercialUf:formatN(0)}` · `Sup.Terreno`=`{d.propiedad.supTerrenoM2:formatN(0)}` · `Sup.Constr`=`{d.propiedad.supConstruccionM2:formatN(0)}` · `UF/m²C`=`{d.comparablesInforme.tasacionUfM2:formatN(2)}` | terminales/propiedad/comparablesInforme | 20.126 · 5.025 · 250 · **80,53** — ⚠ oráculo 32,64 (otra base) | GAP-semántica (F-2/P1-8) |
| C13 | Fila TASACION V/S PROMEDIO | `{d.comparablesInforme.tasacionVsPct:formatN(0)}%` | `comparablesInforme.tasacionVsPct` | motor **160,52%** — ⚠ oráculo −3% / 36% | GAP-semántica |
| C14 | Vida Util Remanente Años | `{d.propiedad.vidaUtil}` | `propiedad.vidaUtil` | Ø (oráculo: 70 años) | GAP P1-9 |
| C15 | Arriendo Bruto $/mes | `{d.rentabilidad.arriendoBrutoMensualClp:formatN(0)}` | ídem | `3.300.000` | — |
| C16 | UF/mes | `{d.rentabilidad.arriendoUfMes:formatN(1)}` | ídem | Ø (oráculo: 82,7) | GAP P2-3 |
| C17 | Gasto Anual $ | `{d.rentabilidad.gastoAnualClp:formatN(0)}` | ídem | `3.300.000` | — |
| C18 | Tasa Exigida Proyecto | `{d.rentabilidad.tasaCapRate:mul(100):formatN(1)}%` | ídem | `4,5%` | — |
| C19 | Tiempo Renta (años) | sin ruta | — | Ø (oráculo: 65 años) | GAP-contrato (P1-9) |
| C20 | Ingreso Líquido Anual | `{d.rentabilidad.ingresoLiquidoAnualClp:formatN(0)}` | ídem | `36.300.000` | — |
| C21 | Renta Perpetua | `{d.rentabilidad.rentaPerpetuaClp:formatN(0)}` | ídem | `806.666.667` | — |
| C22 | Párrafo ANÁLISIS DE LAS REFERENCIAS | texto fijo (E-85) | — | — | — |

### D · HOJA N°1 — Cuadro de valoración y valores finales

| # | Posición | Etiqueta | Contrato | Valor 0067 | GAP |
|---|---|---|---|---|---|
| D1 | Loop filas cuadro | `{d.cuadro.items[i].tipoItem}` · `[i].descripcion` · `[i].situacionMunicipal` · `[i].supM2:formatN(2)` · `[i].ufM2Aplicado:formatN(2)` · `[i].factorAplicado:formatN(2)` · `[i].ufTotalItem:formatN(2)` · `[i].aportaAGarantia` | `cuadro.items[]` | 6 filas | — |
| D2 | Columna Rol SII por ítem | `{d.sii.rolSii}` repetido | `sii.rolSii` | 00882-00040 | aproximación |
| D3 | Columna Año por ítem | sin ruta (no viaja; 0067 trae basura: 51) | — | oráculo: 2024/AL | **GAP-contrato** — vacía |
| D4 | Columnas Estado / Origen Super | sin ruta | — | Ø | GAP-contrato — vacías |
| D5 | Columna Grntía. | `{d.cuadro.items[i].aportaAGarantia:ifEQ(true):show(SI):elseShow()}` | `items[].aportaAGarantia` | true ×6; oráculo N/D×2+B | aproximación |
| D6 | Columna UF/m² (col 13) | sin ruta (cálculo por fila) | — | oráculo 8,00 · 32,64 | GAP-contrato — vacía |
| D7 | Valor Seguros / Liquidación por fila | sin ruta | — | — | **GAP-contrato** — vacías |
| D8 | Subtotales TOTAL EDIFICACION / OO.CC / TERRENO | sin ruta | — | 8.157,06 / 750,00 / 11.218,80 | **GAP-contrato conocido** — rótulos fijos + celdas vacías |
| D9 | VALOR COMERCIAL NORMAL (UF) | `{d.cuadro.totalUf:formatN(2)}` (+seguro/liquid de terminales) | `cuadro.totalUf` | `20.125,86` | — |
| D10 | BIENES NO CONSIDERADOS GARANTIA | celda vacía | — | Ø | GAP menor |
| D11 | FOTO FACHADA | imagen alt `{d.fotos.fotos[i, categoria='Fachada'].url}` | `fotos.fotos[]` | **0 fotos en 0067** | GAP-dato + mecanismo |
| D12 | VALOR TASACIÓN: UF | `{d.terminales.valorComercialUf:formatN(2)}` | ídem | `20.125,86` | — |
| D13 | VALOR TASACIÓN: $ | `{d.terminales.valorComercialClp:formatN(0)}` | ídem | `802.913.431` | — |
| D14 | `al` fecha | `{d.partes.fechaVisita:formatD(DD-MM-YYYY)}` | ídem | 13-04-2026 | — |
| D15 | Velocidad de venta | `{d.propiedad.velocidadVentaEstimada:upperCase}` | ídem | `8 A 10 MESES` | — |
| D16 | 1UF = | `$ {d.terminales.ufDia:formatN(2)}` | ídem | `39.894,61` | — |
| D17 | 1US$ = | `$ {d.terminales.usdDia:formatN(2)}` | ídem | **Ø** (P1-3) | GAP P1-3 |
| D18-D22 | 5 valores UF/$ | `{d.terminales.valorReposicionUf/Clp}` · `seguroIncendioUf/Clp` · `avaluoFiscalUf` + `{d.sii.avaluoTotal:formatN(0)}` · `valorRemateUf/Clp` (65% FIJO) · `valorLiquidacionUf/Clp` (82,5% FIJO) | terminales/sii | ver oráculo | — |
| D23 | Columna US$ (5 valores) | sin ruta | — | — | **GAP-contrato** — vacía |
| D24 | Tasador (firma) | `{d.partes.tasador.nombre}` | ídem | Nelcy Jaimes | — |
| D25 | Visador | `{d.partes.visador.nombre}` | ídem | **Ø — asignar visador a 0067 antes del render** | GAP-dato |
| D26 | Firma (imagen) | alt `{d.partes.tasador.firmaUrl}` | ídem | Ø (P1-9) | placeholder |
| D27 | Fecha visita (larga) | `{d.partes.fechaVisita:formatD(LL)}` | ídem | `13 de abril de 2026` | — |
| D28 | Fecha Visado | `{d.partes.fechaVisado:formatD(LL)}` | ídem | Ø (P1-9) | GAP |
| D29 | REVISOR | `{d.clienteInforme.nombre}` | ídem | MetLife | nombreRevisor Ø (P1-5) |
| D30 | Fecha revisión | celda fija vacía (E-115) | — | — | por diseño |
| D31 | Declaración legal | texto fijo (E-116) | — | — | — |

### E · HOJA N°2

| # | Posición | Etiqueta | Contrato | Valor 0067 | GAP |
|---|---|---|---|---|---|
| E1 | Encabezado 4 campos (Hojas 2-7) | `{d.partes.propietario}` · `{d.partes.rut}` · `{d.propiedad.direccion}` · `{d.meta.numeroSolicitudCliente}` | — | — | — |
| E2 | Mapa con pines | alt `{d.mapa.staticMapUrl}` | `mapa.staticMapUrl` | Ø (P1-4) | placeholder |
| E3 | 3 fotos Fachada de referencias | sin ruta (E-121..123) | — | Ø | placeholders |
| E4-E8 | Fichas Referencia Nº1-3 | `{d.comparablesInforme.filas[i=0/1/2].tipoReferencia/.direccion/.precioUf:formatN(0)/.anio/.supConstruida:formatN(2)/.supTerreno:formatN(2)}` | filas[] | ver oráculo | Año sin formatN (E-124) |
| E9 | Telefono | sin ruta | — | — | GAP-contrato — vacía |

### F · HOJA N°3 (ficha técnica)

| # | Bloque | Etiqueta | Contrato | Valor 0067 | GAP |
|---|---|---|---|---|---|
| F1 | Encabezado | = E1 | — | — | — |
| F2/F3/F6/F10/F13/F16 | Exigencias/Sector/geometría/emplazamiento-resto/servicios/comodidades | **layout fijo con celdas vacías** (grupos `cualitativa.*` = null; NO insertar el tag de grupo) | `cualitativa.*` | null | GAP P1-1/P1-2 estructural |
| F4 | Terreno: Superficie | `{d.propiedad.supTerrenoM2:formatN(2)} m²` | ídem | `5.024,86 m²` | — |
| F5 | Terreno: Orientación | `{d.propiedad.orientacion}` | ídem | Ø | GAP-dato |
| F7 | Emplazamiento: Tipo agrupamiento | `{d.propiedad.agrupacion}` | ídem | Ø | GAP-dato |
| F8 | Estado de conservación | `{d.propiedad.estadoConservacion:upperCase}` | ídem | BUENO | — |
| F9 | Calidad constructiva | `{d.propiedad.calidadConstruccion}` | ídem | Ø | GAP-dato |
| F11 | Constructivas: Estructura Soportante → Materialidad | `{d.propiedad.materialPredominante}` (única con fuente) | ídem | `ALBAÑILERÍA LADRILLO` | resto GAP P1-1 |
| F12 | Terminaciones ×5 | loop `{d.recintos.terminacionesPorRecinto[i].nombre/.categoria/.descripcion/.calidad}` | ídem | 0 filas | GAP-dato |
| F14 | HABITACIONES | loop `{d.recintos.habitacionesPorNivel[i].nivel/.tipoRecinto/.cantidad}` — tabla-lista (matriz no reproducible) | ídem | 0 filas | GAP-dato + diseño |
| F15 | Totales | `{d.propiedad.dormitorios}` · `{d.propiedad.banos}` · `{d.propiedad.supConstruccionM2:formatN(2)}` | ídem | Ø·Ø·249,91 | GAP-dato parcial |
| F17 | Ampliaciones | loop `{d.recintos.ampliaciones[i].descripcion/.supM2:formatN(2)/.annoRegularizacion}` | ídem | 0 filas | GAP-dato |

### G · HOJAS N°4-5 (fotos) · N°6-7 (anexos)

| # | Posición | Etiqueta | Contrato | Valor 0067 | GAP |
|---|---|---|---|---|---|
| G1 | Encabezado ×4 hojas | = E1 | — | — | — |
| G2 | Grilla fotos | loop imagen alt `{d.fotos.fotos[i].url}` + rótulo `{d.fotos.fotos[i].categoria}` | `fotos.fotos[]` | **0 fotos** | GAP-dato + mecanismo URL pública |
| G3 | Anexo Comentarios | celda fija vacía | — | — | — |
| G4 | Documentos anexos | loop texto `{d.anexos.documentos[i].nombre}` / `[i].tipo` (rótulos fijos PLANO/INFO SII/…) — inserción como imagen NO (merge post-render pendiente) | `anexos.documentos[]` | 8 documentos (paths Dropbox internos) | **GAP-mecanismo** + posible bug `tipo_adjunto` vs `clave_adjunto` en `ensamblador.ts:357-358` |

**Recuento de cobertura:** las 52 `variables_requeridas` tienen posición asignada; de las 24 opcionales, 16 tienen celda/imagen placeholder y las 8 `cualitativa.*` NO se insertan como tag (imprimirían `[object Object]`).

---

## §3 · Lo que NO se puede replicar hoy — decisión recomendada por pieza

| Pieza | Estado de la fuente | Recomendación v1 |
|---|---|---|
| Logo VProperty (portada) | sin asset en repo; C_VariablesCliente solo fixtures | extraer imagen embebida de la página 1 del PDF con fitz y embeberla estática. No bloqueante |
| Mapa con pines | staticMapUrl null (P1-4) | placeholder gris + alt-text con el tag. No bloqueante |
| Fachadas de comparables | sin campo (P1-4) | 3 cajas grises fijas. No bloqueante |
| Fotos de la propiedad | 0 fotos en 0067; URLs Dropbox no públicas | loop con placeholder alt `{d.fotos.fotos[i].url}`; con 0 fotos el loop repite 0 veces. GAP bloqueante para paridad visual (subir fotos + URL pública en SC09) |
| Anexos como imagen | paths internos, 6/8 no imagen | lista textual + rótulos fijos; merge de PDFs post-render pendiente. GAP para paridad total Hojas 6-7 |
| Firma manuscrita | firmaUrl null (P1-9) | recuadro Firma: + placeholder alt. No bloqueante |
| Textos IA | null (P0-2/P1-1) | tags presentes (imprimen vacío). Bloqueante solo para paridad de contenido |
| 1US$ y columna US$ | usdDia null histórico; *Usd no existen | tag usdDia presente; columna US$ vacía. Pendiente P1-3 + extensión ensamblador |
| Cualitativa completa | 8 grupos null hasta T4 | layout completo fijo con celdas vacías |
| Visador de 0067 | sin Link | acción de datos: asignar visador antes del render |
| Matriz habitaciones 14×5 | contrato = lista plana | tabla-lista 3 columnas (APROXIMADO) |

---

## §4 · Estrategia de construcción con python-docx (1.2.0)

1. Página A4; portada sección con márgenes 1,0 cm; hojas 1-7 en sección de márgenes 0,5 cm, saltos de página explícitos, encabezado repetido como primera tabla de cada hoja (nunca headers de sección).
2. Estilo Normal Calibri; tamaños por bloque (portada 18/11 bold; hoja 1/3: 5,5-6,5 pt; encabezados hojas 2-7: 7 pt bold; títulos barra 9,5-10 bold blanco).
3. Barras de título: tabla 1×1 shading `#095085` + texto blanco. Fila Valor a Remate y destacados: `#8DB4E2`. Rótulos: `#D4D4D4`.
4. Sidebars verticales: columna de 0,45 cm con `<w:textDirection w:val="btLr"/>` (fallback: banda sin texto).
5. Tablas con autofit off y anchos explícitos; merges donde el plano lo pide; bordes hairline vía `w:tblBorders`.
6. Loops: fila `[i]` + fila fantasma `[i+1]`; filtros `[i, tipoReferencia='Oferta']`/`[i, tipoReferencia='CBR']` (fallback tabla única); fichas `[i=0]/[i=1]/[i=2]`.
7. Imágenes placeholder PNG gris con alt-text = tag Carbone de imagen.
8. Formatters `:formatN` (lang es-cl en el render), `:formatD`, `:upperCase`, `:mul(100)`. Nada de aritmética entre campos.
9. Workarounds: sin texto rotado nativo → XML; tags SIEMPRE en run único; tamaños ≥5 pt; folios como texto fijo; marca de agua NO se replica.
10. Autoverificación: 52 requeridas presentes (lista blanca de 8 cualitativa.* excluidas), zip íntegro, XML parseable.

---

## §5 · Criterio de «diseño idéntico» — checks para diseno-checklist.md

**IDÉNTICO ALCANZABLE:** (1) 8 páginas Portada→Hoja N°7 con folios; (2) portada completa con literales exactos; (3) Hoja 1: 4 bloques con sidebars, tablas REF. con columnas exactas, CUADRO 16-17 col, caja VALOR TASACIÓN con 65%/82,5%, declaración y boilerplate literales; (4) encabezado repetido idéntico Hojas 2-7; (5) Hoja 3 con TODOS los rótulos; (6) formato chileno + años sin miles; (7) 52 tags y render de prueba sin error; (8) paleta.

**APROXIMADO:** tipografías 4,8-6,6→5,5-6,5 pt; sidebars btLr o banda; matriz habitaciones→lista; Grntía. SI/vacío; fila TASACIÓN y % con base de cálculo del ensamblador; promedio único; rol por ítem repetido.

**NO REPRODUCIBLE HOY:** mapa pines; fotos 0067; documentos incrustados Hojas 6-7; firma/fecha visado/revisor variable; textos IA y cualitativa (celdas vacías); columna US$ y 1US$; marca de agua.

**Hallazgos accionables fuera de la plantilla:** (1) asignar visador a VP-2026-0067; (2) posible bug `tipo_adjunto` vs `clave_adjunto` en `ensamblador.ts:357-358`; (3) recomendar extensión del contrato con campos de comparables que el oráculo imprime (`fecha_publicacion`, `telefono_contacto`, `foja`+`numero`, `oo_cc_uf`, `uf_m2_terreno_f`, `uf_m2_construccion_f`) y agregados por ítem del cuadro.
