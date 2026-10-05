# Descubrimiento — Reglas de cálculo · Plantillas por cliente · Comparables como foto

**Tanda:** T-REGLAS-PLANTILLAS-COMPARABLES-20261005
**Fecha:** 2026-10-05
**Modo:** SOLO LECTURA · descubrimiento previo a la réplica de los Casos 2–5
**Equipo:** 6 agentes en paralelo (localización, reglas de cálculo, plantillas, comparables, hard-rules) + consolidación
**Set analizado:** 5 casos (Excel + PDF oráculo c/u) de `docs/_referencias/5tasaciones/`, ancla Caso 1 = MetLife · La Marina 1176 · VP-2026-0073 (`reczuns8NHdI45Owp`)

---

## §1 Resumen ejecutivo

| Pregunta | Respuesta | Evidencia |
|---|---|---|
| **Q1 · Perfiles de cálculo** | **1 sola fórmula de cálculo**, no 5. Los 5 Excel son un único template paramétrico idéntico (21 hojas, misma topología) y el motor Airtable `C_Formulas` lo reimplementa 1:1. La única bifurcación por cliente es el **factor de garantía ×0.8 vs ×1.0** → **2 perfiles de parámetro** (A = ×0.8; B = ×1.0). Eje secundario ortogonal: **tasa exigida 4,5% vs 6,0%** por lista de clientes (solo afecta renta, no el valor comercial). | Portada `BO51`/`DB51`, `BJ41`; `C_Formulas` |
| **Q2 · Plantillas** | **1 sola plantilla genérica VProperty, NO una por cliente.** Los 6 PDF oráculo (5 bancos) comparten esqueleto idéntico de 8 páginas / 7 "Hojas". El banco entra como **dato** (`Nº Interno`), nunca como variante estructural. | 6 PDF oráculo idénticos; `PLANTILLA_MET_v5.docx` |
| **Q3 · Comparables** | El modelo **foto-como-fuente-de-verdad ya está implementado y vigente** (A-13). La premisa "[ROTO] en AT03-Ext 263-264" es **incorrecta**: esas líneas son un comentario, el pipeline está vivo. Los valores entran por extracción RF-09 (invisible a la UI → respeta T-C/R8). Deuda real acotada: purga A-45, guard anti-merge, backfill `adjunto_origen`. | `AT03-Ext_script.js:263-266`, `:548-745`; `aprendizajes.md` A-13 |
| **Decisiones para Héctor** | **10** (3 × P0, 5 × P1, 2 × P2). La más crítica: el UF/m² final lo fija el tasador a mano **sin acotarlo** al promedio de muestra (Caso 1: eligió 31,6 con muestra en 45,3 = −30%, sin control). | §6–§7 |

**Conclusión de encuadre:** replicar los Casos 2–5 NO requiere nuevas fórmulas ni nuevas plantillas. Requiere (a) parametrizar 2 datos maestros por cliente (factor garantía, tasa exigida), (b) afinar el maquetado de la plantilla única (firma + grilla de fotos), y (c) cerrar 3 deudas acotadas del pipeline de comparables. Todo lo demás ya existe.

---

## §2 Q1 — Reglas de cálculo / negocio por caso

### Método de valoración (único para los 5)

Cuadro de valoración por ítem (costo/mercado unitario homogeneizado), **no** promedio directo de comparables. Cadena real (celdas del template):

- UF/m² por ítem: `Portada!BD51 = BA51 (F.M.) × AX51 (D.F.) × AT51 (UF/m² Nuevo)`
- Valor UF por ítem: `BI51 = BD51 × AN51 (sup m²)`
- **Valor Comercial** `BI62 = SUM(BI59:BM61)` (edificación + OO.CC. + terreno)
- **Valor Garantía/Seguro** `BO51` = IF anidado sobre `ClienteN`: Casa o lista-de-clientes → ×1; resto → **×0.8** (único castigo real, por cliente)
- **Reposición** `BG72 = edif_nuevo × 0.8 + OO.CC.` (terreno=0 en los 5)
- **Remate** `BG77 = valor_comercial × AU77`; **Liquidación** `BG78 = valor_comercial × AU78`; `AU77/AU78` = VLOOKUP sobre "velocidad de venta"
- Comparables (`Portada!B29:AQ44`): solo producen el **promedio de muestra** `AX34` (ofertas) / `AX42` (CBR) para **contraste**; el UF/m² final lo fija el tasador en el cuadro.

> ⚠ **Corrección a la premisa de la tanda.** El "−30%" y "−17%" del Caso 1 **no son castigos aplicados al valor**: son ratios de diagnóstico `AX36 = BD59/AX34 − 1` y `AX44 = BD59/AX42 − 1` (tasación vs promedio de muestra). `C_Formulas.F_DesviacionVsPromedioCBR` confirma el −17%.

### Tabla por caso

| Caso | Cliente / `ClienteN` | Método | Ajustes / parámetros reales | Perfil | Evidencia |
|---|---|---|---|---|---|
| 1 · La Marina 1176 | MetLife / **2** | cuadro valoración (depto, terreno=0) | garantía **×0.8**; D.F.=0.79; UF/m² 31.6; remate 0.65; liquid 0.825 | **A** | `BO51`/`DB51`=0.8, `AX59`=0.79, `BD59`=31.6 |
| 2 · AG 1548 | Agencia Habitacional / **7** | cuadro valoración | garantía **×1.0**; D.F.=1.0; UF/m² 34; tasa exigida **6,0%**; remate 0.65; liquid 0.825 | **B** | `DB51`=1.0, `AX59`=1, `BJ41`="6,0%" |
| 3 · Las Rejas Norte 65 | Hipotecaria Security / **1** | cuadro valoración | garantía **×0.8**; D.F.=0.95; UF/m² 33.09; tasa **5,5%**; remate 0.65; liquid 0.825 | **A** | `DB51`=0.8, `AX59`=0.95, `BJ41`=0.055 |
| 4 · HEV3183 | Hipotecaria Evoluciona / **4** | cuadro valoración | garantía **×0.8**; D.F.=1.0; UF/m² 72.65; avalúo="NO REGISTRA"; tasa 4,5%; remate 0.65; liquid 0.825 | **A** | `DB51`=0.8, `AX59`=1, `K41`="NO REGISTRA" |
| 5 · caspana 310 | Austral Leasing Hab. / **20** | cuadro valoración | garantía **×1.0**; D.F.=0.8; UF/m² 25.6; tasa 4,5%; remate 0.65; liquid 0.825 | **B** | `DB51`=1.0, `AX59`=0.8 |

### Qué varía por cliente / qué es fijo

| Parámetro | ¿Varía por cliente/banco? | Valores observados | Evidencia |
|---|---|---|---|
| Factor garantía/seguro (`BO51`) | **SÍ — por `ClienteN`** | ×0.8 (ClienteN 1,2,4) · ×1.0 (ClienteN 7,20 y toda Casa) | IF anidado `Portada!BO51`; ratio `DB51` |
| Tasa exigida (renta) `BJ41` | **SÍ — por cliente** | 4,5% default · **6,0%** lista {ULH, ICGE, Concreces, Agencia Hab., Credihome, Másleasing, TESSI} · 5,5% (Security C3, override) | fórmula `Portada!BJ41` |
| Factor remate `AU77` | NO (depende de velocidad de venta) | 0.65 en los 5 ("8 A 10 MESES") | VLOOKUP `BZ62:CA71` |
| Factor liquidación `AU78` | NO (depende de velocidad de venta) | 0.825 en los 5 | VLOOKUP `BZ62:CB71` |
| Fórmula reposición `BG72` | NO | `edif_nuevo×0.8 + OO.CC.` | `Portada!BG72` |
| Redondeo valor final `BI62` | **SÍ — si `K9=13`** | FIXED(…,0) si ClienteN=13; decimal el resto | `Portada!BI62/BO62/BV62` |
| UF/m² Nuevo (`AT`), D.F. (`AX`), F.M. (`BA`), sup, UF del día, avalúo, arriendo | SÍ — **por propiedad** (no por cliente) | ver tabla por caso | cuadro Portada filas 51-58 |
| Topología de fórmulas (todo lo demás) | **NO — idéntica** | — | 21 hojas idénticas en los 5 |

### Conteo de perfiles

- **1 perfil de CÁLCULO** (misma fórmula para los 5).
- **2 perfiles de PARÁMETRO** por el factor de garantía: **A (×0.8)** = Casos 1,3,4 · **B (×1.0)** = Casos 2,5.
- Eje secundario ortogonal (tasa exigida 4,5% / 6,0%) que **no** multiplica perfiles de valoración.

El motor `C_Formulas` ya encapsula ambos ejes como parámetros de `M_Clientes`/overrides. **No se requiere código distinto por caso.**

---

## §3 Q2 — Plantillas por cliente

### Inventario de los 5 PDF oráculo

| Cliente | Banco (Nº Interno) | Págs | Secciones (en orden) |
|---|---|---|---|
| ALEJANDRO ÁVILA DURÁN | METLIFE-6280 | **8** | Portada · Hoja N°1 (Identif.+Tasación+Firma) · N°2 (Comparables/Fachadas) · N°3 (Datos/Exigencias) · N°4 (Fotos) · N°5 (Fotos) · N°6 (Anexo 1) · N°7 (Anexo 2) |
| JANETH CANDO ARIAS | AGH-1548 | **8** | idéntico |
| MIGUENSON RAMEAU | ALH-335 | **8** | idéntico |
| PATRICIO TORO NIEVAS | HIPOTECARIA SECURITY-6073 | **8** | idéntico |
| CARLOS CORTÉS PÉREZ | HEV-3183 | **8** | idéntico |
| (histórico) FRANCISCO VERGARA | MET-6283 | **8** | idéntico |

**Hallazgo central:** los 6 PDF comparten el mismo esqueleto exacto (Portada + Hojas N°1 a N°7 = 8 páginas, una Hoja por página). Lo único que cambia entre bancos es el texto del campo `Nº Interno` y el relleno de datos/fotos — **ningún** cambio de estructura, orden o paginación atribuible al cliente.

### ¿Una plantilla por cliente?

| Cliente | ¿Plantilla propia? | Diferencias estructurales | Motivo |
|---|---|---|---|
| METLIFE / AGH / ALH / SECURITY / HEV | **No (los 5)** | Ninguna estructural; solo relleno (nº de fotos, rótulos de anexo, `Nº Interno`) | Mismo layout VProperty parametrizado |

**Se necesita UNA sola plantilla genérica.** `PLANTILLA_MET_v5.docx` ya es esa plantilla única (A4, 7 literales "Hoja N°1..7", 528 tags `{d.*}`, 198 loops, sin ramas por cliente).

### El 11 vs 8 del Caso 1

`caso1-PROD.pdf` = 11 págs; oráculo ÁVILA = 8 págs. Causa = **overflow de maquetado dentro de la plantilla única**, no falta de plantillas separadas. Las 7 Hojas lógicas están todas y en orden; sobran 3 páginas de desbordamiento:

| +Pág | Causa | Detalle |
|---|---|---|
| p3 | **Firma** se desborda de Hoja N°1 | el oráculo encaja identificación + tabla de valores + firma en una sola A4; v5 deja caer la firma a la página siguiente |
| p7 | **Fotos** desbordan Hoja N°4 | contexto trae **18 fotos** (mapa 1 + ofertas 3 + fachada 5 + living 3 + habitaciones 6) vs ~14 del oráculo; la grilla de v5 usa celdas más grandes |
| p9 | **Fotos** desbordan Hoja N°5 | ídem |

8 + 3 = 11. **Se resuelve afinando la plantilla única**, con 3 ajustes de maquetado: (i) keep-together de la firma en Hoja N°1; (ii) sizing fijo de la grilla de fotos (N fotos/página = oráculo); (iii) revisar los saltos de página de v5. Separar por cliente no resolvería nada: el problema es dimensionamiento de contenido, común a todos los bancos.

---

## §4 Q3 — Comparables como foto del tasador

### Modelo vigente (ya implementado — A-13)

Los comparables llegan por **extracción de la foto del cuadro** de la plantilla; la sección D de la UI es **sólo lectura**. Pipeline verificado punta a punta:

1. Tasador fotografía el cuadro de comparables (`Portada!B28:AX44`) → sube adjunto categoría "Ofertas / Comparables".
2. **RF-09** (`SC-RF09-ExtraccionClaude.blueprint.json`) extrae un ítem por comparable con metadato `fila` (entero ≥1); reconoce secciones "REF. OFERTAS" y "REF. C.B.R.".
3. **AT03-Ext §3b-bis/§3d** (`AT03-Ext_script.js:548-745`) agrupa por `fila` y materializa N filas en **TX_Comparables** (`tbllbTuhb0waWIbRo`); upsert idempotente por `clave_natural = ${codigo_ext}|COMP-NN`.
4. Consumo (lectura): UI `seccion-comparables.tsx` hidratada por `lib/tasador/lectura-datos.ts::comparablesDeSolicitud()`; promedio de muestra = `promedioSinCeros()` en `lib/informe/fila-tasacion.ts:63-71` (espejo del XLSM `Portada!AX34`, ofertas y CBR por separado).

### El "[ROTO]" — confirmación matizada

`AT03-Ext_script.js:263-266` **es un comentario de documentación**, no lógica que descarte fotos:

```js
//   - muchas_por_solicitud → tabla destino (TX_Comparables), N filas por
//     solicitud agrupadas por `fila` (metadato por item...);
//     upsert idempotente por clave_natural `${codigo_ext}|COMP-NN`. Ver §3d.
```

La implementación real está viva (acumula en `:609-620`, materializa en `:695-745`). **La aserción "salta la cardinalidad y descarta en silencio las fotos" es INCORRECTA — la cardinalidad se honra.**

Riesgo/deuda que SÍ existe:
- **A-45 (abierta):** sin DELETE/purga → re-fotografiar con menos comparables deja huérfanos COMP-NN (upsert nunca borra). `AT03-Ext_script.js:651-657`, `route.ts:19-23`.
- **Guard anti-merge** (`:609-620`, `:711-716`): un ítem sin `fila` válida anula el lote completo → descarte posible, pero por dato malo de extracción, **ruidoso** (log + `propError`), no silencioso.

### Modelo recomendado

**El modelo correcto ya está implementado y vigente.** No requiere reconstrucción; requiere cerrar 2 deudas y ratificar T-C/R8.

- **Data model:** sin cambios estructurales. TX_Comparables conserva campos numéricos poblados por extracción.
- **Cómo entran los valores al motor sin violar T-C/R8:** los valores los produce la extracción de la foto (RF-09, en Make → invisible al usuario); la UI nunca menciona IA/OCR, solo que los comparables provienen del cuadro fotografiado. No hay tipeo de comparables en UI (A-13 eliminó "Agregar comparable").
- **UI:** sección D sólo lectura (hecho). Resta auditar los literales de `seccion-comparables.tsx` para confirmar que ningún string diga IA/OCR/extracción.
- **Plantilla/Carbone:** el cuadro se alimenta de `comparablesInforme` (promedio aritmético XLSM). Sin cambios.
- **Pipeline:** cerrar A-45 (purga, en el escenario Make, no en el Route Handler) y endurecer el guard anti-merge.

**Dimensión del arreglo: pequeña.** No es rehacer el pipeline. Es (1) purga A-45, (2) auditoría de strings UI por T-C/R8, (3) opcional: suavizar el anti-merge.

### Reconciliación de los 6 comparables sembrados a mano (Caso 1)

Sembrados por `seed-caso1.mjs:136-142` con la **misma `clave_natural** (`|COMP-NN`) y los mismos campos que escribiría AT03-Ext §3d → **compatibles con el modelo, sin migración de datos**. Única diferencia: el seed no setea `adjunto_origen` (link a TX_Adjuntos) que AT03-Ext sí pone (`:699`). Consecuencia: los 6 de Caso 1 no serían purgables en cascada si A-45 se resuelve por `adjunto_origen` → habría que re-sembrarlos vía extracción real o backfillar `adjunto_origen`. **Decisión de Héctor.**

---

## §5 Mapa de los 5 casos

| Caso | Cliente / banco | Propietario (Excel) | Dirección / comuna | VP-code | record_id | Estado Airtable | Excel | PDF |
|---|---|---|---|---|---|---|---|---|
| **1 (ancla)** | MetLife · METLIFE-6280 | Alejandro Ávila Durán | La Marina 1176, Dpto 102, Ed. Guillermo II · San Miguel | VP-2026-0073 | `reczuns8NHdI45Owp` | **calculada** | `…La Marina 1176 dp 102 bd 13.xlsm` | `Informe ALEJANDRO AVILA DURAN (II).pdf` |
| 2 | Agencia Habitacional · AGH-1548 | Andrés Pablo Israel Avram | Coronel Souper 4060, Dpto 2502 B · Estación Central | VP-2026-0004 | `rec19zYDt8muMQ9G4` | cancelada | `AG 1548.xlsm` | `Informe JANETH PATRICIA CANDO ARIAS.pdf` |
| 3 | Austral Leasing Hab. · ALH-335 | Víctor Leónidas González Moreno | Caspana 310, Dpto 14 Block A · Quilicura | VP-2026-0005 | `recPx0yiK9k4oPG4V` | cancelada | `caspana 310 dp 14, quilicura.xlsm` | `Informe MIGUENSON RAMEAU.pdf` |
| 4 | Hipotecaria Security · HIP. SECURITY-6073 | Irma Elena Alzamora Riveros | Av. María Rozas Velásquez 65 (=Las Rejas Norte 65), Dpto 211 P · Estación Central | VP-2026-0007 | `reclC1CE5VHLTisKD` | cancelada | `…Las Rejas Norte 65 dp 211 P.xlsm` | `Informe PATRICIO ADRIAN TORO NIEVAS.pdf` |
| 5 | Hipotecaria Evoluciona · HEV-3183 | Inmob. Exequiel Fernández Torre Tres SpA | Exequiel Fernández 6150, Dpto 411 Torre 3 · La Florida | VP-2026-0006 | `reci06q1kySVg43KG` | cancelada | `HEV3183.xlsm` | `informe CARLOS ANDRÉS CORTÉS PÉREZ.pdf` |

> **GATE G2: PASA** — 5/5 con Excel + PDF legibles y record identificado. Faltantes: ninguno.
> Notas: `tipo_informe` no existe como campo en TX_Solicitudes (los 5 son "Crédito Hipotecario · Departamento" según Excel, INFERIDO). C4 y C5 tenían records duplicados/distractores en Airtable (VP-0060 "Chaitén 1149" y VP-0038) — descartados por código interno. Caso 1 es el único en estado `calculada`; los otros 4 están `cancelada` pero su material oráculo es válido.

---

## §6 Huecos y decisiones priorizados

| # | Prioridad | Tema | Hallazgo | Solución propuesta (equipo) |
|---|---|---|---|---|
| 1 | **P0** | UF/m² final sin acotar | El UF/m² final lo fija el tasador a mano; Caso 1 eligió 31,6 con muestra en 45,3 (−30%) **sin control**. Es la ruta principal del valor y no tiene UI ni validación (huecos P0 HP-1/HP-2 de la auditoría previa). | Definir si el UF/m² final debe quedar acotado/alertado contra el promedio de muestra, y con qué tolerancia. **Decisión de Héctor.** |
| 2 | **P0** | Factor garantía como dato maestro | El IF `BO51` hardcodea la lista de ClienteN ×1 vs ×0.8. Riesgo: cliente nuevo no listado → ×0.8 silencioso. | Migrar a `M_Clientes.factor_garantia` (campo ya existe · auditoría H6). **Decisión de Héctor** sobre el default. |
| 3 | **P0** | Purga de comparables (A-45) | Sin DELETE: re-fotografiar con menos comparables deja huérfanos COMP-NN. | ¿Re-fotografiar reemplaza o acumula? Implementar purga en el escenario Make. **Decisión de Héctor.** |
| 4 | **P1** | Tasa exigida 6,0% como dato maestro | Lista {ULH, ICGE, Concreces, Agencia, Credihome, Másleasing, TESSI} hardcodeada en `BJ41`. | Migrar a dato maestro de cliente. **Decisión de Héctor.** |
| 5 | **P1** | Override de tasa 5,5% (Caso 3) | 5,5% no es producible por el IF `BJ41` (default daría 4,5%) → override manual del tasador sin motivo registrado. | ¿Se parametriza o queda como override libre con registro? **Decisión de Héctor.** |
| 6 | **P1** | Tope de fotos por informe | Origen trae 18 fotos vs ~14 del oráculo → overflow. | ¿Recortar a N fijo, paginar, o achicar celdas? Fijar nº por página en la plantilla. **Decisión de Héctor** (presentación). |
| 7 | **P1** | Guard anti-merge de comparables | Un `fila` faltante bota el lote completo de comparables. | ¿Aceptable, o escribir los válidos y loguear el inválido? **Decisión de Héctor.** |
| 8 | **P1** | Backfill `adjunto_origen` (6 seeds Caso 1) | Los 6 comparables sembrados no tienen `adjunto_origen` → no purgables en cascada. | Backfillar o re-sembrar vía extracción real, una vez A-45 se defina. |
| 9 | **P2** | Reglas de borde | Avalúo "NO REGISTRA" (Caso 4) y redondeo `K9=13`. | Ratificar comportamiento esperado. **Decisión de Héctor.** |
| 10 | **P2** | Factores D-21 (A-44) | Los 3 factores de homogeneización ratificados por D-21 no aparecen en el cuadro fotografiado. | Si deben usarse, no es por este flujo. Dueños: Héctor + visador titular. |

---

## §7 Preguntas para Héctor (consolidadas)

**P0 — bloquean la réplica de Casos 2–5:**

1. **UF/m² final:** ¿debe el valor UF/m² que fija el tasador quedar **acotado o alertado** contra el promedio de la muestra de comparables? ¿Con qué tolerancia? (Hoy el Caso 1 quedó −30% bajo la muestra sin control.)
2. **Factor garantía:** confirmamos migrar la lista cliente→factor (×0.8 / ×1.0) a `M_Clientes.factor_garantia`. ¿Cuál es el **default para un cliente nuevo** no listado? (hoy caería en ×0.8 en silencio.)
3. **Comparables — re-fotografiado:** cuando el tasador vuelve a fotografiar el cuadro, ¿el nuevo conjunto **reemplaza** al anterior (purga de huérfanos) o **acumula**?

**P1 — necesarias antes del cierre:**

4. **Tasa exigida 6,0%:** ¿migramos la lista de clientes a dato maestro? ¿Qué cliente la lleva hoy además de los 7 observados?
5. **Caso 3 (5,5%):** ¿fue un override legítimo del tasador? ¿Se parametriza por cliente o se deja como override libre con registro de motivo?
6. **Tope de fotos:** cuando el tasador sube más fotos que el oráculo (18 vs 14), ¿recortamos a un máximo fijo por categoría, paginamos a una 2ª página, o achicamos la grilla?
7. **Comparable con dato faltante:** si un comparable llega sin número de fila, ¿descartamos el lote completo (actual) o escribimos los válidos y registramos el inválido?

**P2 — ratificaciones:**

8. **Reglas de borde:** avalúo "NO REGISTRA" y redondeo entero (ClienteN=13) — ¿comportamiento esperado?
9. **Factores D-21 (A-44):** ¿deben aplicarse los 3 factores de homogeneización aunque no estén en el cuadro fotografiado? Si sí, ¿por qué vía entran?

---

## §8 Tandas siguientes propuestas (SIN ejecutar)

> Bloques de prompt listos para pegar. Ninguno se ejecuta en esta tanda.

**T-PARAM-CLIENTES-MAESTROS-20261006** — Parametrizar los 2 datos maestros por cliente (factor garantía, tasa exigida) en `M_Clientes`, reemplazando los IF hardcodeados del template. Requiere P0-#2 y P1-#4 resueltas por Héctor.

**T-PLANTILLA-MAQUETADO-FIX-20261006** — Afinar `PLANTILLA_MET_v5.docx` (→ v6): keep-together de firma en Hoja N°1, sizing fijo de grilla de fotos, revisión de saltos de página. Objetivo: Caso 1 vuelve a 8 páginas. Requiere P1-#6 (tope de fotos) resuelta.

**T-COMPARABLES-PURGA-A45-20261006** — Implementar purga/reemplazo de comparables en el escenario Make de extracción + backfill `adjunto_origen` de los 6 seeds del Caso 1 + endurecer guard anti-merge. Requiere P0-#3 y P1-#7 resueltas.

**T-UFM2-CONTROL-20261007** — Definir e implementar el control/alerta del UF/m² final vs promedio de muestra (huecos HP-1/HP-2). Requiere P0-#1 resuelta. Mayor impacto en calidad del valor.

**T-TASADOR-E2E-CASOS-2a5-REPLICA-20261008** — Réplica real de los Casos 2–5 (recalculando, no copiando valores) una vez cerradas las tandas de parámetros + plantilla + comparables. Entrega los 4 casos restantes validados contra su oráculo.

---

## §9 Recomendación consolidada del equipo

El set de 5 casos **no esconde las incógnitas que se temían**: hay **una sola fórmula de cálculo** (con 2 parámetros por cliente, no 5 lógicas), **una sola plantilla** (el banco es un dato, no una variante) y el **modelo de comparables-como-foto ya está construido y correcto** (la premisa del [ROTO] era un comentario mal leído). Por tanto, replicar los Casos 2–5 es barato en arquitectura y caro en **decisiones de negocio pendientes**: antes de construir nada, Héctor debe zanjar las 3 preguntas P0 — sobre todo el control del UF/m² final, que hoy permite al tasador fijar un valor 30% bajo la muestra sin ninguna barrera. Recomendamos resolver las P0, luego ejecutar en serie las tandas de parámetros → plantilla → comparables, y sólo entonces la réplica E2E de los 4 casos restantes.

---

*Entregables de esta tanda: este `.md` y `DESCUBRIMIENTO_REGLAS_PLANTILLAS_COMPARABLES_20261005.xlsx` (3 hojas). Tanda SOLO LECTURA — sin writes a Airtable/Make/código/plantilla, sin commit/push.*
