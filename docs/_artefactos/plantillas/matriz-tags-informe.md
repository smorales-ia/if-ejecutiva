# Matriz de tags del informe — artefacto vivo §7.3

> **Tanda:** T-INFORME-ENSAMBLADOR-20260925 · ROADMAP §3 bloque 1
> **Fuente de verdad ejecutable:** `lib/informe/matriz-tags.ts` — este archivo es su
> proyección legible y se regenera desde allí. **Ante divergencia, gana el `.ts`.**
> Derivada del Excel gemelo `docs/_analisis/PARIDAD_informe_UI_20260924.xlsx`
> (228 E-ids, 53 grupos del §2 de la auditoría).

Semántica: `tag` usa sintaxis Carbone (`{d.ruta}` sobre `InformeContexto`,
`lib/informe/tipos.ts`; loops `{d.x[i].y}`). Los elementos **PLANTILLA** son texto
estático del `.docx` (rótulos, pie corporativo, declaración legal, boilerplate,
formato es-CL): llevan tag `—` y no viajan en el JSON. El estado viene del Excel
(`OK` · `HUECO` · `MetLife-only` → `METLIFE_ONLY`), con los hardcode de plantilla
reclasificados a `PLANTILLA`. El P-id traza al pendiente del ROADMAP.

**Cobertura:** 228 E-ids · OK 96 · HUECO 79 · METLIFE_ONLY 30 · PLANTILLA 23.
La integridad (suma = 228, sin duplicados) la asierta `lib/informe/ensamblador.test.ts`;
el score de paridad contra VP-2026-0066 lo mide `lib/informe/medidor.ts`
(baseline fijado: **34,1%** de datos con valor · 40,8% del total contando plantilla).

| E-ids | Tag Carbone | Elemento | Fuente | Estado | P-id |
|---|---|---|---|---|---|
| E-01, E-03, E-15..E-16, E-18, E-84, E-86, E-118..E-119, E-209, E-212..E-213, E-218..E-219, E-224..E-225 | `—` | Rótulos, títulos y foliación fijos («INFORME DE TASACION», «Hoja N°X») | hardcode plantilla Carbone (.docx) | PLANTILLA | P0-1 |
| E-02 | `{d.clienteInforme.logoUrl}` | Logo/marca de portada (VProperty + marca cliente — brecha B2/H9) | C_VariablesCliente.logo_url (EAV, sin clientes reales) | HUECO | P1-5 |
| E-04..E-05, E-17, E-31 | `{d.meta.codigo}` | Identificadores de la solicitud (N° interno, institución, N° cliente) | TX_Solicitudes.codigo_solicitud · n_operacion_cliente · cliente | OK | — |
| E-06..E-10, E-19..E-22, E-32..E-35 | `{d.partes.propietario}` | Propietario, RUT, dirección, comuna, región (portada + identificación) | TX_Solicitudes.cliente_final_nombre/_rut · direccion · comuna · region | OK | — |
| E-11..E-14 | `—` | Pie corporativo de portada (web, mail, dirección, fono) | hardcode plantilla Carbone (.docx) | PLANTILLA | P0-1 |
| E-23..E-28 | `{d.partes.fechaVisita}` | Ejecutivo, tasador, objetivo, tipo propiedad, fecha tasación, destino SII | TX_Solicitudes (asignación IF-02) · M_Tasadores · RF-09 destino_sii | OK | — |
| E-29..E-30, E-115 | `—` | Campos de plantilla vacíos (Ejecutivo 2º, Formalizador, Fecha revisión) | sin origen — tags condicionales por cliente en plantilla | HUECO | P2 |
| E-36, E-40 | `{d.sii.rolSii}` | Rol SII y manzana | TX_Solicitudes.rol_sii · TX_DatosTasacion.cod_sii_manzana (RF-09/UI F) | OK | P1-6 |
| E-37, E-39, E-41, E-45, E-52, E-56 | `{d.cualitativa.detallePropiedad}` | Condominio, sitio/lote, zona normativa, mansarda, subterráneos, fuente info | UI captura y descarta (CI-023) — sin columnas destino | HUECO | P1-1 |
| E-38, E-42..E-44, E-46..E-47, E-53 | `{d.propiedad.anioConstruccion}` | Pisos, estacionamientos, bodegas, DFL-2, año construcción, estado conservación | TX_DatosTasacion (UI sección B) | OK | — |
| E-48, E-76, E-81 | `{d.propiedad.vidaUtil}` | Vida útil, vida útil remanente, tiempo renta | F_VidaUtil existe pero fuera de la regla v32 | HUECO | P1-9 |
| E-49..E-50 | `{d.legales.permisoEdificacion}` | Permiso de edificación y recepción final (N° y fecha) | TX_DocumentosLegales (UI sección F / RF-09) | OK | — |
| E-51, E-208 | `{d.recintos.ampliaciones[i].descripcion}` | Ampliaciones (flag + detalle 1-3) | TX_Ampliaciones (UI sección E) | OK | P2-3 |
| E-54..E-55 | `{d.cualitativa.detallePropiedad}` | Sello SEC y afecto a expropiación | UI captura y descarta (CI-023) — sin columnas destino | HUECO | P1-1 |
| E-57 | `{d.textosIA.textoExpropiacion}` | Texto de expropiación (párrafo con comuna + N° cert) | plantilla con variables — n_cert persiste; falta afecto_expropiacion | HUECO | P1-1 |
| E-58, E-99 | `{d.fotos.fotos[i].url}` | Foto fachada (miniatura identificación + cuadro valoración) | TX_Adjuntos (UI Fotos, categoría Fachada/Exterior) | OK | — |
| E-59..E-60 | `{d.textosIA.sintesisPropiedad}` | Síntesis de la propiedad y descripción del sector (párrafos redactados) | Claude RN-25/RF-32 en SC09 — sin productor implementado | METLIFE_ONLY | P0-2 |
| E-61..E-65, E-70..E-72 | `{d.comparablesInforme.filas[i].direccion}` | Comparables: 5 ofertas + 2 CBR (14 atributos por fila) | TX_Comparables (RF-09 foto del cuadro · A-13) | OK | — |
| E-66..E-68, E-73..E-75 | `{d.comparablesInforme.promedioUfM2}` | Promedios de la muestra, fila TASACIÓN y % tasación vs promedio | calculado por el ensamblador (puente F-2/P1-8) — no persiste | HUECO | P1-8 |
| E-69 | `—` | Comentarios relevantes por comparable (campo inexistente) | sin columna en TX_Comparables | HUECO | P2-3 |
| E-77, E-79, E-82..E-83 | `{d.rentabilidad.ingresoLiquidoAnualClp}` | Rentabilidad: arriendo bruto, gasto anual, ingreso líquido, renta perpetua | TX_DatosTasacion (sección H) + TX_Calculos (F_IngresoLiquidoAnualCLP · F_RentaPerpetuaCLP) | OK | — |
| E-78 | `{d.rentabilidad.arriendoUfMes}` | Arriendo UF/mes | F_IngresoLiquido (UF) fuera de la regla v32 | HUECO | P2-3 |
| E-80 | `{d.rentabilidad.tasaCapRate}` | Tasa exigida / cap rate base (hoy tipeado; sin cascada M_Clientes poblada) | cascada override > TX_DatosTasacion.tasa_cap_rate > M_Clientes (guard H5) | HUECO | P1-9 |
| E-85 | `—` | Párrafo «Análisis de las referencias» (boilerplate metodológico) | hardcode plantilla Carbone (.docx) | PLANTILLA | P0-1 |
| E-87..E-98 | `{d.cuadro.totalUf}` | Cuadro de valoración completo (terreno/edificación/OO.CC, UF/m², D.F., totales) | TX_ItemsCuadroValoracion (UI sección C · H1/H2) + motor AT03 v32 · 0,00% vs oráculo | OK | — |
| E-100, E-102 | `{d.terminales.valorComercialUf}` | Valor tasación UF/$ y paridad «1UF=» | TX_Calculos (F_ValorComercialUF/CLP) + H_PreciosUF (cron, guard H3) | OK | P1-3 |
| E-101 | `{d.propiedad.velocidadVentaEstimada}` | Velocidad de venta normal (no influye en 0,65/0,825 — hardcode) | TX_DatosTasacion.velocidad_venta_estimada (UI sección B) | OK | P2-1 |
| E-103 | `{d.terminales.usdDia}` | Paridad «1US$=» | H_PreciosUF.tipo_cambio_usd — sin escritor automático (sólo seed manual) | HUECO | P1-3 |
| E-104..E-108 | `{d.terminales.valorReposicionUf}` | Valores terminales: reposición, seguro, avalúo fiscal, remate 65%, liquidación 82,5% | TX_Calculos (13 fórmulas v32) + RF-09 avalúo + overrides sección G | OK | P1-3 |
| E-109..E-110 | `{d.partes.tasador.nombre}` | Nombres de tasador y visador en el bloque de firmas | M_Tasadores/M_Visadores.nombre (asignación IF-02) | OK | — |
| E-111 | `{d.partes.tasador.firmaUrl}` | Firma manuscrita del tasador (imagen) | sin mecanismo — pegada a mano en el xlsm | HUECO | P1-9 |
| E-112 | `{d.partes.fechaVisita}` | Fecha de visita (la real, regla T-B) | TX_Solicitudes.fecha_visita (UI sección A) | OK | — |
| E-113 | `{d.partes.fechaVisado}` | Fecha de visado | IF-04 (visación) no existe | HUECO | P1-9 |
| E-114 | `{d.clienteInforme.nombreRevisor}` | Revisor (institución) | C_VariablesCliente.nombre_revisor (EAV, sin valor) | HUECO | P1-5 |
| E-116 | `—` | Declaración legal del profesional | hardcode plantilla Carbone (.docx) | PLANTILLA | P0-1 |
| E-117 | `{d.meta.codigo}` | Encabezado repetido Hojas 2-7 (cliente, dirección, RUT, N° interno) | TX_Solicitudes (datos ya existen; lo repite la plantilla) | OK | P0-1 |
| E-120 | `{d.mapa.staticMapUrl}` | Mapa de ubicación de referencias (satelital con pines) | Google Static Maps desde lat/long — sin implementación ni API key | METLIFE_ONLY | P1-4 |
| E-121..E-123 | `—` | Fichas de referencias 1-3 con foto de fachada (datos sí; foto por comparable no existe) | TX_Comparables (datos RF-09) + foto adjunta por comparable sin camino | METLIFE_ONLY | P1-4 |
| E-124 | `—` | Formato del año en fichas (2.015 vs 2015) — normalización de plantilla | formato es-CL en plantilla Carbone | PLANTILLA | — |
| E-125..E-140 | `{d.cualitativa.normativa}` | Exigencias normativas y plan regulador (PRMS/OGUC, leyes, cumplimiento, uso probable) | listas del xlsm — sin catálogo poblado ni UI (rescate M_Zonificacion en T4) | METLIFE_ONLY | P1-2 |
| E-141..E-146, E-148..E-157 | `{d.cualitativa.sector}` | Mercado y sector (demanda, tendencia, calzada/acera, redes, % usos, arteria) | sin UI ni columnas | HUECO | P1-2 |
| E-147, E-158, E-161 | `{d.propiedad.supTerrenoM2}` | Tipo de zona, superficie terreno, orientación | TX_DatosTasacion (UI sección B) | OK | P2-3 |
| E-159..E-160, E-162..E-165 | `{d.cualitativa.geometriaTerreno}` | Forma, pendiente, frente, contrafrente, deslindes, ratio | sin UI ni columnas | HUECO | P1-2 |
| E-166, E-170..E-171, E-173 | `{d.propiedad.estadoConservacion}` | Emplazamiento con captura: agrupamiento, calidad, estado conservación, orientación | TX_DatosTasacion (UI sección B) | OK | — |
| E-167..E-169, E-172, E-174..E-175 | `{d.cualitativa.emplazamiento}` | Emplazamiento cualitativo: diseño, utilidad funcional, adosamiento, vista, iluminación | sin UI ni columnas | HUECO | P1-2 |
| E-176..E-191 | `{d.cualitativa.constructivas}` | Características constructivas y «otros» (16 filas materialidad/calidad/estado) | UI captura y descarta (6 CI-023 + 7 silenciosos) — sin columnas | HUECO | P1-1 |
| E-192..E-196 | `{d.recintos.terminacionesPorRecinto[i].descripcion}` | Terminaciones por recinto (pavimento, muros, cielo) — 5 recintos | TX_TerminacionesPorRecinto (UI sección E) | OK | P2-3 |
| E-197..E-201 | `{d.cualitativa.servicios}` | Servicios de la propiedad (alcantarillado, agua, electricidad, gas, otros) | sin UI ni columnas | HUECO | P1-2 |
| E-202..E-206 | `{d.recintos.habitacionesPorNivel[i].cantidad}` | Habitaciones por nivel (matriz 10 tipos × 4 niveles + totales) | TX_HabitacionesPorNivel (UI sección E) | OK | — |
| E-207 | `{d.cualitativa.comodidades}` | Comodidades (16 ítems SI/NO) — la UI captura 14 switches y descarta | sin tabla destino (TX_Amenities no existe) | HUECO | P1-1 |
| E-210..E-211 | `{d.fotos.fotos[i].url}` | 16 fotos de la propiedad en grillas 2×4 con rótulos | TX_Adjuntos (UI Fotos, mínimos dinámicos A-16 · categoría en descripcion, CI-051) | OK | P2-2 |
| E-214..E-217, E-220..E-223 | `{d.anexos.documentos[i].url}` | Anexos 1-2: plano, esquema, info SII, rol-avalúo, permiso, recepción, no-expropiación | TX_Adjuntos.url_dropbox por tipo doc (adjuntos existen; inserción era manual) | METLIFE_ONLY | P0-1 |
| E-226..E-228 | `{d.terminales.valorComercialUf}` | Metadatos globales y cadena de consistencia numérica (sumas cuadran) | TX_Calculos (motor AT03, validación 0,00% vs oráculo) | OK | — |

---
*Generado desde `lib/informe/matriz-tags.ts` el 25-sep-2026. No editar a mano: regenerar.*
