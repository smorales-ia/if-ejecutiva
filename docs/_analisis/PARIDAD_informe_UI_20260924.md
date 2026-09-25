# PARIDAD informe UI — Auditoría T-INFORME-PARIDAD-20260924

> **Tanda:** T-INFORME-PARIDAD-20260924 · solo lectura · 5 agentes en paralelo
> **Gold master:** `docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf` (8 páginas · 228 elementos inventariados · 78 imágenes)
> **Caso poblado de referencia:** VP-2026-0066 (`recNiwM4s1ibr3sbO`) — es el mapeo de MET-6283 en Airtable
> **Análisis previo reutilizado:** `docs/_analisis/AUDITORIA_inputs_motor_UNIVERSAL_20260922.md` (sus 3 P0 —H1/H2/H3— están CERRADOS y verificados en producción; ver §Delta)
> **Excel gemelo:** `docs/_analisis/PARIDAD_informe_UI_20260924.xlsx` (2 hojas · 228 filas, una por elemento E-01…E-228)

---

## § 1 · Resumen ejecutivo

**¿Se puede hoy generar el informe idéntico vía UI? NO.** Tres razones: (1) **no existe capa de generación de PDF operativa** — el gold master salió 100% del flujo manual xlsm+VBA; el pipeline Carbone (SC09/SC10) está "Pendiente" en Make, sin blueprint, sin plantilla `.docx` real y `TX_DocumentosGenerados` tiene una sola fila demo; (2) **~45% de los elementos del informe no tienen camino digital** — toda la Hoja 3 cualitativa (normativa, sector, constructivas, servicios, comodidades), los textos redactados, el mapa, el dólar y la maquetación; (3) el **motor solo está validado para Refinanciamiento** (Casa/Depto/default v32) y ningún cliente —ni MetLife— tiene configuración completa de punta a punta.

Lo que SÍ está resuelto y verificado: el **núcleo económico**. El cuadro de valoración + los 13 valores terminales salen del motor AT03 v11.1.1 desplegado, con inputs capturables por la UI del Tasador (H1/H2 cerrados en T-MC-P0) y UF por cron (H3), validados **0,00% de desviación** contra el oráculo MET-6283 por la ruta cuadro pura, sin overrides del xlsm.

| Métrica | Valor |
|---|---|
| Elementos del informe (gold master) | **228** (E-01…E-228, 8 páginas) |
| Con camino OK hoy (dato digital completo: UI/RF-09/motor/cron) | **97 (43%)** |
| HUECO (sin camino, o UI que captura y descarta) | **101 (44%)** |
| MetLife-only (solo se salvó con el xlsm/proceso manual) | **30 (13%)** |

## § 2 · Tabla completa (53 grupos que cubren los 228 elementos)

> Detalle fila-por-elemento en el Excel. Origen: **a**=RF-09 · **b**=UI Tasador · **c**=sistema/AT01/cron/IF-02 · **d**=xlsm MetLife manual · **e**=desconocido/nadie.

| E-ids | Elemento | Valor en PDF ref | Origen | Camino de generación | ¿UI? | Estado | Acción |
|---|---|---|---|---|---|---|---|
| 01,03,15-16,18,84,86,118-119,209,212-213,218-219,224-225 | Rótulos/títulos/foliación de plantilla | "INFORME DE TASACION", rótulos, "Hoja N°X" | hardcode | xlsm impresión; sin equivalente digital | n/a | HUECO | P0-1 plantilla Carbone |
| 11-14 | Pie corporativo | Santa Magdalena 75 · 22 500 0366 | hardcode | xlsm Tapa!B50-E52 | n/a | HUECO | P0-1 |
| 02 | Logo/marca portada | logo VProperty (MET salió con marca Austral — B2) | c | C_VariablesCliente sin clientes reales | no | HUECO | P1-5 (H9) |
| 04-05,17,31 | Identificadores solicitud | METLIFE-6283 · 900159638 | c | lectura-informe.ts:395-412 | IF-02 | OK | — |
| 06-10,19-22,32-35 | Cliente/propietario/RUT/dirección/comuna/región | Vergara Undurraga · 16.610.203-0 · Colina | c | TX_Solicitudes → bloque 1 | IF-02 | OK | — |
| 23-28 | Ejecutivo, tasador, objetivo, tipo, fecha, destino SII | M. Reyes · M.E. Soto · Refinanciamiento · Casa | c/a | bloque 1 + RF-09 destino_sii | sí | OK | — |
| 29-30,115 | Campos plantilla vacíos (Formalizador, fecha revisión) | vacíos | e | — | no | HUECO | P2 (tags condicionales) |
| 36,40 | Rol SII, manzana | N°882-40 | a/b | RF-09 + sección F | sí | OK | P1-6 alinear destino |
| 37,39,41,45,52,56 | Condominio, sitio/lote, zona, mansarda, subterráneos, fuente info | LAS BRISAS · A 40 · IPB(Colina) | b→∅ | UI captura y descarta (CI-023) | UI sí, persist. no | HUECO | P1-1 columnas |
| 38,42-44,46-47,53 | Pisos, estac., bodegas, DFL-2, año, estado conserv. | 1 · 0 · 0 · NO · 2024 · BUENO | b | seccion-propiedad.tsx → datos/route.ts:237-268 | sí (B) | OK | — |
| 48,76,81 | Vida útil / remanente / tiempo renta | 70 · 70 · 65 años | e | F_VidaUtil fuera de la regla | no | HUECO | P1-9 nodo motor |
| 49-50 | Permiso y recepción final | N°319 09/09/2020 · N°210 18/07/2024 | b/a | sección F → TX_DocumentosLegales | sí (F) | OK | — |
| 51,208 | Ampliaciones | No · "Regulado"×3 | b | TX_Ampliaciones (route:457-489) | sí (E) | OK | P2 nPe+fecha completa |
| 54-55 | Sello SEC, afecto expropiación | No Aplica · NO | b→∅ | UI captura y descarta | UI sí, persist. no | HUECO | P1-1 |
| 57 | Texto expropiación | "De acuerdo al DOM… NO cuenta con expropiación" | b+plantilla | n_cert persiste (route:261); párrafo sin generador | parcial | HUECO | P1 texto plantilla |
| 58,99 | Fotos fachada Hoja 1 | 2 fotos | b | UI Fotos → TX_Adjuntos | sí | OK | — |
| 59-60 | Síntesis propiedad + descripción sector | 2 párrafos redactados del caso | d | sin productor (diseño: Claude RN-25/RF-32 en SC09) | no (por diseño) | MetLife-only | **P0-2 textos IA** |
| 61-65,70-72 | Comparables (5 ofertas + 2 CBR) | filas completas | a | RF-09 foto del cuadro (A-13) → TX_Comparables | foto | OK | — |
| 66-68,73-75 | Promedios muestra + TASACION vs % | 21.440 · -3% · 36% | c efímero | solo frontend (lectura-informe.ts:324-326, 472-482), no persiste; fila TASACION "—" (F-2) | preview | HUECO | P1-8 persistir en motor |
| 69 | Comentarios por comparable | vacíos | e | no existe campo | no | HUECO | P2 |
| 77,79,82-83 | Rentabilidad (arriendo, gasto, ingreso líquido, renta perpetua) | $3,3M · $36,3M · $806,7M | b+motor | sección H → F_Ingreso/F_RentaPerpetua | sí (H) | OK | — |
| 78 | Arriendo UF/mes | 82,7 | c | F_IngresoLiquido fuera de regla | no | HUECO | P2 |
| 80 | Tasa cap rate base | 4,5% | c/d | cascada override>datos>M_Clientes (guard H5) | solo override G | HUECO | P1 checklist alta cliente |
| 85 | "Análisis de las referencias" | boilerplate metodológico | hardcode | xlsm manual | n/a | HUECO | P0-1 |
| 87-98 | **Cuadro de valoración completo** | 20.125,86 UF (11.218,80+8.157,06+750) | b+motor | sección C (H1/H2) → 13 fórmulas v32 · **0,00% vs oráculo** | sí (C) | **OK** | — |
| 100,102 | Valor tasación UF/$ + "1UF=" | 20.125,86 · $802.913.431 · $39.894,61 | c | motor + H_PreciosUF (guard H3, cron) | auto | OK | P1-3 robustez cron |
| 101 | Velocidad de venta | 8 A 10 MESES | b | sección B; NO influye en 0,65/0,825 (hardcode) | sí | OK | P2 decidir |
| 103 | "1US$=" | $890,33 | e | nadie escribe tipo_cambio_usd | no | HUECO | **P1-3 dólar en cron** |
| 104-108 | Terminales: reposición, seguro, avalúo fiscal, remate, liquidación | 9.246,94 · 8.907,06 · 8.517,68 · 13.081,81 · 16.603,84 | c/a/b | 13 fórmulas v32 + RF-09 avalúo + overrides G | overrides sí | OK | US$ pendiente P1-3 |
| 109-110,112 | Tasador, visador, fecha visita | M.E. Soto · H. Martínez · 13-abr | c/b | asignación IF-02 + sección A | sí | OK | — |
| 111 | Firma manuscrita | imagen | e | pegada a mano | no | HUECO | P1 imagen en M_Tasadores |
| 113 | Fecha visado | 15-abr-2026 | e | IF-04 no existe | no | HUECO | P1 alcance IF-04 |
| 114 | Revisor | MetLife | c | C_VariablesCliente.nombre_revisor sin valor | no | HUECO | P1-5 (H9) |
| 116 | Declaración legal | boilerplate | hardcode | xlsm | n/a | HUECO | P0-1 |
| 117 | Encabezado Hojas 2-7 | 4 campos repetidos | c | datos OK; falta plantilla | auto | OK | P0-1 |
| 120 | Mapa de referencias con pines | 1 mapa satelital | d | pegado a mano | no | MetLife-only | P1-4 Static Maps |
| 121-123 | Fichas referencias con foto | 3 fichas | a/d | datos RF-09 OK; fotos a mano | datos sí | MetLife-only | P1-4 foto por comparable |
| 124 | Formato año (2.015) | hallazgo formato | — | — | — | OK | P2 normalizar |
| 125-140 | **Normativa/plan regulador** (PRMS/OGUC, leyes, cumplimiento) | 16 campos | d | listas del xlsm; sin catálogo ni UI | no | MetLife-only | **P1-2 catálogo + UI** |
| 141-146,148-157 | **Mercado y sector** (demanda, calzada, redes, % usos, arteria) | 16 campos | d | sin UI ni columnas | no | HUECO | **P1-2 sección UI** |
| 147,158,161 | Tipo zona, sup. terreno, orientación | Rural · 5.024,86 · NORTE | b | sección B | sí | OK | P2 orientación multi |
| 159-160,162-165 | Forma, pendiente, frente, deslindes | REGULAR · PLANO · 29,95 · N50/S50 | d | sin UI | no | HUECO | P1-2 |
| 166,170-171,173 | Emplazamiento con captura | CONDOMINIO · BUENA · BUENO · NORTE | b | sección B | sí | OK | — |
| 167-169,172,174-175 | Emplazamiento cualitativo | TIPICO · ADECUADA · AISLADA… | d | sin UI | no | HUECO | P1-2 |
| 176-191 | **Características constructivas + otros** (16 filas) | estructura, cubierta, ventanas, sanitarios… | b→∅ | **UI captura y descarta** (6 CI-023 + 7 silenciosos) | UI sí, persist. no | HUECO | **P1-1 columnas** |
| 192-196 | Terminaciones por recinto | 5 recintos ×3 atributos | b | TX_TerminacionesPorRecinto | sí (E) | OK | P2 completar atributos |
| 197-201 | Servicios | Colector · Matriz Pública… | d | sin UI | no | HUECO | P1-2 |
| 202-206 | Habitaciones por nivel | 16 recintos · 249,91 m² | b | TX_HabitacionesPorNivel | sí (E) | OK | — |
| 207 | Comodidades (16 SI/NO) | Piscina SI, Gimnasio NO… | b→∅ | UI captura 14 switches y descarta | UI sí, persist. no | HUECO | P1-1 tabla destino |
| 210-211 | 16 fotos propiedad | grillas 2×4 rotuladas | b | UI Fotos (mínimos dinámicos A-16) | sí | OK | P2 categorías faltantes |
| 214-217,220-223 | Anexos 1-2 (capturas plano/SII/permisos) | ~12 capturas | a/b/d | adjuntos existen; inserción era manual | adjuntos sí | MetLife-only | P1 plantilla inserta adjuntos |
| 226-228 | Metadatos/consistencia numérica | sumas cuadran | c | validación 0,00% | auto | OK | — |

## § 3 · GAPS por escenario

### Escenario MetLife (con xlsm histórico) — válido pero NO es producto
- Todo el informe es producible **a mano**: el xlsm `1951-MET 6283…` es la plantilla corporativa (`Formato-Informe-VProperty-Enero2026.xlsm`) instanciada — 21 hojas idénticas, 393 fórmulas en `Portada`, impresión a PDF.
- El repo ya replica su aritmética (13/13 terminales, 0,00%), pero el **entregable final** (maquetación, textos, mapa, anexos, fotos de referencias, normativa) solo sale del Excel + pegado manual.
- Ni siquiera MetLife tiene hoy camino automático: `C_VariablesCliente` sin valores reales, plantilla Carbone `MUTUO_MET.docx` es un placeholder sin binario, y SC09/SC10 inactivos.

### Escenario Cliente Nuevo — bloqueantes reales
1. **Sin pipeline de PDF** (P0-1): nadie obtiene informe automático; el fallback `window.print()` está prohibido (CI-016) y no imprime la plantilla del cliente.
2. **Sin textos redactados** (P0-2): síntesis, sector y análisis de referencias no tienen productor (diseño: Claude RN-25/RF-32 en SC09).
3. **Motor no validado fuera de Refinanciamiento** (P0-3): Mutuo Hipotecario —el volumen del negocio— cae a reglas v26 jamás validadas o al wildcard.
4. **Onboarding incompleto** (P0-4): ≥12 clientes sin factores → guards H5/H6 abortan; ~18 sin plantilla; `C_VariablesCliente` vacía; C_SLA solo 2 filas; duplicados en M_Clientes.
5. **Cobertura geográfica**: M_Comunas con `uf_m2_*` en 59/356 comunas → guard H7 aborta el 83% del país.
6. Todo lo marcado MetLife-only/HUECO en §2 sale **vacío** para un cliente nuevo (Hoja 3 cualitativa completa, mapa, dólar, firma, fecha visado).

## § 4 · Pendientes priorizados

### P0 — bloqueantes (sin esto no hay informe para NADIE)
| # | Pendiente | Solución propuesta | Esfuerzo |
|---|---|---|---|
| P0-1 | Pipeline de generación del PDF apagado (SC09/SC10 "Pendiente", sin blueprint, sin `.docx`, matriz de ~180 tags §7.3 inexistente, TX_DocumentosGenerados con 1 fila demo) | Reconstruir/activar pipeline Carbone: plantilla `.docx` parametrizada por cliente + matriz de tags + SC09 (ensamblado JSON + Claude) + SC10 (Dropbox + versionado RN-56) + blueprints versionados en repo | L |
| P0-2 | Textos redactados sin productor (síntesis, sector, análisis de referencias, texto expropiación) | Generador Claude (RN-25/RF-32) dentro de SC09 con inputs de TX_DatosTasacion/TX_Comparables/M_Zonificacion; preview editable por el tasador | M |
| P0-3 | Motor validado solo para Refinanciamiento (reglas v32); Mutuo Hipotecario y 6 tipos más caen a v26/wildcard no validados | Clonar patrón v32 por `tipo_informe` + regresión con los PDFs históricos de `docs/_referencias/` como golden masters | M-L |
| P0-4 | Alta de cliente sin checklist: factores, plantilla, C_SLA, C_VariablesCliente, regla — nadie está completo; duplicados y fila basura en M_Clientes | Checklist formal de onboarding + saneo de duplicados (decisión de negocio: valores comerciales por cliente) | S |

### P1 — el informe sale incompleto/incorrecto
| # | Pendiente | Solución | Esfuerzo |
|---|---|---|---|
| P1-1 | 30+ campos que la UI captura y DESCARTA (constructivas, comodidades, sello SEC, condominio, subterráneos, CBR extendido; 7 fuera de contrato CI-023, en silencio) | Crear columnas/tablas destino y sacar los 7 silenciosos del limbo (declararlos o persistirlos) | M |
| P1-2 | Hoja 3 sin captura: normativa/plan regulador, mercado/sector, servicios, geometría del terreno, emplazamiento cualitativo (~50 campos) | Nueva(s) sub-secciones UI + catálogo normativo (M_Zonificacion/M_Comunas) + columnas destino | M-L |
| P1-3 | `tipo_cambio_usd` sin escritor (el informe imprime "1US$=") + cron UF frágil (falló la corrida del 24-sep, `recJKeeofeA9r7jhL`; fila vacía huérfana `recrQdCDkJvGgxClK`) | Ampliar CRON_UF_Diaria con dólar (mindicador) + respaldo CMF + alerta a 2 fallos | S |
| P1-4 | Mapa de referencias y fotos por comparable: solo pegado manual | Google Static Maps desde lat/long (§4.3 Origen v1.7) + adjunto foto por comparable | M |
| P1-5 | H9: logo, marca y revisor por cliente — `C_VariablesCliente` sin clientes reales (portada MET salió con marca Austral Leasing) | Poblar EAV logo_url + nombre_revisor por cliente real; consumo desde plantilla | S-M |
| P1-6 | RF-09↔motor desalineado: año/superficies/material van a TX_Unidades pero el DAG lee TX_DatosTasacion; `uso_campo_destino=sup_m2` apunta a columna inexistente; `calidad_sii` vs `calidad_construccion` | Fix sup_m2→sup_construccion_m2 + redeclarar 3 atributos a TX_DatosTasacion (decisión A4, gate doble escritor) | S |
| P1-7 | M_Comunas: `uf_m2_*` en 59/356 comunas (guard H7 aborta el resto) | Poblar precios por tanda según cobertura de cada cliente (al checklist P0-4) | M |
| P1-8 | Promedios de comparables y "TASACIÓN vs %" solo en frontend, no persistidos; fila TASACION pinta "—" (F-2) | Persistir en motor (fórmula de promedio de muestra a la regla) o en SC09; cablear sujeto en InformeData | S-M |
| P1-9 | Firma manuscrita (sin mecanismo), fecha visado (IF-04 inexistente), vida útil remanente y tasa cap base sin origen propio | Imagen de firma en M_Tasadores + decisión de alcance IF-04 + F_VidaUtil a la regla + tasa en checklist alta | S-M |

### P2 — mejoras
| # | Pendiente | Solución |
|---|---|---|
| P2-1 | Factores 0,65 (remate) y 0,825 (liquidación) hardcode en fórmulas v32 → `velocidad_venta_estimada` no influye pese a existir C_Factores | Decidir: conectar lookup por velocidad o ratificar factores fijos |
| P2-2 | Fotos: 8 categorías que el formato exige no son predefinidas (Sector, Terraza, Bodega, Logia, Planos…); categoría viaja en `descripcion` (CI-051); 422 con 2+ unidades | Ampliar categorías predefinidas + campo estructurado + selector de unidad |
| P2-3 | UF/mes, comentarios por comparable, atributos de terminaciones sin columna, orientación multi→single, nPe/fecha de ampliaciones | Columnas menores + fórmulas a la regla |
| P2-4 | C_SLA con 2 filas · `requiere_rentabilidad` solo en Refinanciamiento · AT08/SC-SLA-Envio apagados | Absorber en checklist P0-4 + decisión de activación |
| P2-5 | Saneo documental: CLAUDE.md dice "E1/E2/E3 ✅ ACTIVO" (falso), C_AutomationsAirtable desalineada (AT02/AT04 "Activo" estando undeployed; no registra CRON ni AT03-Ext), `VP-NaN-0066` en A_DecisionesMotor, seed demo con Link vacío (CI-024) | Tanda de saneo documental dedicada |

## § 5 · Deuda de artefactos / escenarios

1. **SC09/SC10 (alias E1/E2/E3) sin blueprint** en `docs/_artefactos/make/` y estado "Pendiente"/inactivo en Make (ids 5748459/5750023/5791413) — **CLAUDE.md desactualizado** ("✅ ACTIVO — no tocar"). El alias E1/E2/E3↔SC09/SC10 no está documentado en ninguna parte.
2. **Plantillas Carbone inexistentes**: 16 filas de C_Plantillas con URLs placeholder; ningún `.docx` en repo ni Dropbox verificable; matriz de tags §7.3 ("artefacto vivo") no existe. Además AT01 resuelve `MUTUO_MET.docx` mientras el seed demo linkea `Plantilla_Base_METLIFE` — dos plantillas para el mismo caso.
3. **CRON_UF_Diaria** desplegado (`wflQ9NC7dHcuY6Hh0`) pero corrida del 24-sep fallida, sin dólar, con fila vacía huérfana y descripción stale.
4. **AT02/AT04/AT08 undeployed** con script en repo; **C_AutomationsAirtable desalineada** (marca activos los undeployed, no registra CRON/AT03-Ext/AT-RF09-Trigger, inventaría AT05-AT10 inexistentes).
5. **SC-SLA-Envio (7597712)**: blueprint solo en `_evidencia/`, sin fila en Z_EscenariosMake, inactivo. **SC05 v1.0 existe inactivo** (CLAUDE.md dice "por provisionar" — stale). **Dos SC-Adjuntos-Upload activos a la vez** (v1.2 y v1.7).
6. **`window.print()` vivo** en `informe-preview.tsx:263-267` contra RF-TAS-21 (CI-016/CI-063); el preview no consume el modelo canónico de `lectura-informe.ts` (divergencia registrada).
7. **CI-005/CI-037** (reloj SLA, 5/7 etapas sin escritor) y **CI-024** (TX_DocumentosGenerados: Link vacío + 4 pares de homónimos) siguen abiertas.
8. Guard nuevo `origen_dato=tipeado` (AT03-Ext:333-350) protege el juicio del tasador pero convierte RF-09 en no-op sobre casos pre-poblados (0066): documentar el comportamiento.

### Delta vs. AUDITORIA_inputs_motor_UNIVERSAL_20260922
**Cerrado desde entonces:** H1 (`uf_m2_unitario` con UI), H2-captura (`factor_aplicado` con UI), H3 (guard + lookup H_PreciosUF + cron desplegado), H5/H6/H7 (guards fail-ruidoso publicados — AT03 live byte-idéntico al repo), overrides reposición/seguro con UI, routing RF-09 de avalúo fiscal alineado (VP-2026-0060/0067 con `origen_dato=extraido_rf09`). El xlsm bajó de "fuente fantasma" a **oráculo de regresión**. **Sigue vigente:** desalineación RF-09→TX_Unidades, comparables sin promedios persistidos, identificador desconocido→0 silencioso en `safeEval`, AT02/AT04/AT08 undeployed, SC07/textos IA inexistentes, H9 sin resolver. **Nuevo aquí:** USD sin escritor, factores 0,65/0,825 hardcode, 7 campos silenciosos fuera de contrato CI-023, pipeline PDF confirmado apagado.

## § 6 · Recomendación consolidada del equipo

El trabajo de septiembre dejó resuelta la mitad difícil —captura y cálculo del núcleo económico, validado al 0,00% contra el oráculo— pero el producto "informe" sigue sin existir: ningún cliente, ni MetLife, obtiene hoy un PDF automático, y la mitad cualitativa del documento (Hoja 3, textos, mapa, anexos) no tiene ni captura ni generador. Recomendamos secuenciar: **(1)** P0-1+P0-2 como una sola tanda (pipeline Carbone parametrizado por cliente con generador de textos incluido — es el único hueco que ninguna otra tanda toca y sin él todo termina en tipeo manual sobre el xlsm); **(2)** P0-3 reglas v32 por tipo de informe con los PDFs históricos como golden masters; **(3)** P0-4 checklist formal de alta de cliente, que absorbe P1-5/P1-7 y P2-4; y en paralelo las tareas S de bajo riesgo: dólar+robustez del cron UF, fix `sup_m2`, persistir promedios de comparables, y saneo documental para que CLAUDE.md y C_AutomationsAirtable vuelvan a reflejar la realidad. Las secciones nuevas de UI (P1-1/P1-2) conviene diseñarlas junto con la matriz de tags de la plantilla, para crear columnas una sola vez y con destino cierto.

---
*Auditoría de solo lectura — cero writes en Airtable/Make/código. Archivos generados: este documento y su Excel gemelo. Evidencias: archivo:línea y record ids citados en cada fila.*
