# SYNC_LOG — bitácora viva de sincronización con §2 spec v1.9.3

**Insumo autoritativo** — `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` §2 (líneas 1574–1953)
**Rama base** — `docs/sync-ifTasador-v193` *(pendiente de crear · Checkpoint #3)*
**Inicio** — 25-jul-2026

---

## Estado global

| Fase | Estado | Entregables |
|---|---|---|
| Fase 0 · Descubrimiento | ✅ **completa** | `00_inventario.md` · `01_clasificacion.md` · `00b_correcciones_al_prompt.md` |
| Fase 1 · Análisis de brecha | ✅ **completa** | 12 fichas en `gap/` + `gap/_sin_cambio.md` + `gap/_ambiguedades.md` |
| Fase 2 · Plan de ramas | ✅ **completa** · D-A a D-D firmadas | `02_plan_fase3.md` |
| Fase 3 · Ejecución | 🟡 **en curso** — lotes 0 y 2 completos; **lote 1 bloqueado por A-10 y lote 3 por A-09**, ambos por trabajo fuera del repo | ver tabla de lotes |
| Fase 4 · Validación | ⏸ no iniciada | `TRAZABILIDAD.md` · `VALIDATION.md` |

**Punto de retoma documentado en `RESUME.md`.** Última actualización: **13-ago-2026**, al
cierre del lote 7.

> **El lote 7 no pertenece a la Fase 3 original.** Es una tanda posterior, disparada por un
> insumo que no existía cuando se planificó el sync: `Imagenes_IF_Tasador_v4.pdf`. Se registra
> en esta bitácora porque toca el mismo eje —§2 del spec y sus RF-TAS— y porque partirla en un
> archivo aparte fragmentaría la trazabilidad que este registro sostiene. La Fase 4 sigue sin
> iniciar y el lote 6 sigue propuesto sin autorizar; **ninguno de los dos avanza con esta tanda**.

> **Los lotes 2 y 3 comparten commit.** Se fusionaron junto con la bitácora en `ae5202e`,
> de modo que ese sha aparece en las filas de ambos lotes. La granularidad de un commit por
> lote no se cumplió en esta tanda; la trazabilidad se sostiene por este registro, no por el
> historial de git.

---

## Estado de los lotes

| Lote | Descripción | Estado | Commit |
|---|---|---|---|
| **0** | Bump de versión: 4 archivos nuevos + 4 predecesores SUPERSEDED | ✅ **COMPLETADO** · 25-jul-2026 | `196c1e1` |
| **1** | SC05 → SC08 (transversal) | 🔴 **BLOQUEADO por A-10** — no ejecutar hasta decisión humana. Ver `RESUME.md` | — |
| **2** | Spec v1.9.4 · 5 correcciones internas de §2.14 | ✅ **COMPLETADO** · 25-jul-2026 — adelantado sobre el lote 1 con A-10 abierto (autorización del usuario) | `ae5202e` |
| **3** | (i) Delta §2.12 · (ii) §22 alias A-05 · (iii) `CODE_INCONSISTENCIES.md` | 🟡 **PARCIAL** · 25-jul-2026 — **(ii) y (iii) completos**; **(i) BLOQUEADO por A-09**: `TX_CoordinacionVisita` no existe en Airtable y sin TABLE_ID ni FIELD_IDs no se puede escribir `schema-airtable.md`. Ver `gap/_ambiguedades.md` | `ae5202e` |
| **4** | Blueprint v2.10 + Arquitectura v2.9 · puntos 4.1–4.6 | 🟡 **PARCIAL** · 25-jul-2026 — 4.1, 4.2, 4.4, 4.5, 4.6 completos; **4.3 sólo en su mitad**: la máquina de estados sí, la narrativa de ejemplo **no requiere cambio** (su vocabulario de estados ya es el oficial; sus únicos defectos son de numeración `SC`, fuera de alcance) | `a08bd20` |
| **5** | Operativos + Motor · puntos 5.1–5.5 | 🟡 **PARCIAL** · 25-jul-2026 — 5.1–5.5 completos; **4 ítems diferidos**: SC13 acotado a IF-02 y `SC15` en Origen de Datos (`DEP-EXT:A-10`), 3 campos de `TX_Solicitudes` en `CLAUDE.md` y lectura de `TX_CoordinacionVisita` en operativos (`DEP-EXT:A-09`). `CLAUDE.md` y Origen de Datos **no se abrieron** | `38f275d` |
| **6** | Citación de identificadores `RF-TAS-XX` inline | ⏸ **PROPUESTO · NO AUTORIZADO** — sigue esperando la decisión 3.1 (H-2) de `RESUME.md`. El lote 7 **no lo absorbe ni lo sustituye** | — |
| **7** | Sync RF-TAS de la UI Tasador contra `Imagenes_IF_Tasador_v4.pdf` · bump v1.9.8 → v1.9.9 | ✅ **COMPLETADO** · 13-ago-2026 — 12 RF-TAS nuevos, 10 modificados, 0 eliminados. **RF-TAS-04 y RF-TAS-05 emitidos bloqueados por CI-012.** 6 ambigüedades y 9 inconsistencias nuevas registradas | contenido `pendiente-single-commit` · bump `pendiente-single-commit` · bitácora `pendiente-single-commit` |

### Nota sobre el orden de lotes 1 y 2

El plan original (C-5) puso el lote 1 primero por ser el de mayor superficie. A-10 lo
bloqueó. El lote 2 **no depende del lote 1**: sus cinco correcciones viven en §1, §4, §6.2
y §13 del spec y ninguna toca la numeración de escenarios Make. Puede adelantarse sin
comprometer la resolución de A-10.

**Resuelto el 25-jul-2026:** el usuario autorizó adelantar el lote 2 dejando A-10 abierto.
Ejecutado en `ae5202e`. Verificado que el diff no contiene ninguna ocurrencia de `SC05`,
`SC08` ni `SC13`, de modo que la decisión de A-10 sigue sin condicionar y el lote 1 puede
ejecutarse después sin conflicto con este commit.

---

## Lote 7 · sync RF-TAS contra `Imagenes_IF_Tasador_v4.pdf` (13-ago-2026)

**Insumo autoritativo del lote** — `docs/_md/Imagenes_IF_Tasador_v4.pdf`, 30 páginas.
Las pp. 1–16 son la auditoría del prototipo IF-Tasador v0 (`package.json`, árbol de rutas,
componentes leídos); las pp. 17–30 son la sección `3-PANTALLAS`, con las siete pantallas
anotadas. **Sólo esta segunda parte especifica diseño**; la primera se usó como evidencia de
código para las fichas CI.

**Alcance** — actualizar los Requerimientos Funcionales de la UI del Tasador (§2 del spec)
conforme al diseño v4, replicando el patrón de redacción de la §1 (Interfaz Ejecutiva), y
bumpear el documento normativo de **v1.9.8 a v1.9.9**.

**Regla de precedencia aplicada** — ante contradicción entre §2 y el diseño v4, **manda el
diseño** y la divergencia se registra como CI. Ante algo que el diseño muestra pero no puede
especificarse sin decisión de negocio, **no se inventa**: se registra como A-XX y el RF se
emite marcado como pendiente.

### Resultado sobre los RF

| Movimiento | Cantidad | Identificadores |
|---|:--:|---|
| Agregados | **12** | RF-TAS-11 a RF-TAS-22 |
| Modificados | **10** | RF-TAS-01 · 02 · 03 · 04 · 05 · 06 · 08 · 09 · 10 · RF-12 |
| Eliminados | **0** | — |
| Bloqueados al emitirse | **2** | RF-TAS-04 · RF-TAS-05 (CI-012) |

Verificación estructural: 25 tablas RF en §2, todas con exactamente `Descripción` +
`Criterio de aceptación`, en pipes markdown; RF-TAS-01 a 22 sin huecos ni duplicados. Cero
identificadores renumerados.

### Archivos tocados, agrupados por commit

**Commit 1 — `docs(spec): sync IF-Tasador v1.9.9 con RF-TAS-11..22` · `pendiente-single-commit`**

| Archivo | Qué cambia |
|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` | `git mv` desde `…_v1_9_8.md` + toda la edición de §2, §13 (RN-54 y RN-59), §14 (2 entradas de glosario), cabecera y bloque de cambios de versión |
| `docs/CODE_INCONSISTENCIES.md` | CI-013 a CI-021 + precisión de alcance + rutas de CI-003, CI-007 y CI-012 reapuntadas a `v1_9_9` |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | A-12 a A-17, en bloque propio fechado |

> ⚠ **`CODE_INCONSISTENCIES.md` no se puede repartir entre los commits 1 y 2.** Sus
> actualizaciones de versión están **dentro** de las celdas `Archivo:línea` de fichas que el
> commit 1 escribe o corrige, de modo que separarlas exigiría staging por línea sobre celdas
> de la misma tabla. Va entero al commit 1. Por eso el commit 2 son **12** archivos y no 13.

**Commit 2 — `chore(version): bump referencias v1.9.8 → v1.9.9 en repo` · `pendiente-single-commit`**

| Archivo | Refs |
|---|:--:|
| `CLAUDE.md` | 7 |
| `docs/_md/plan-ejecucion-if02-v1_9.md` | 6 |
| `docs/diseno.md` | 7 |
| `docs/construccion.md` | 5 |
| `docs/schema-airtable.md` | 4 |
| `README.md` | 1 |
| `components/console/nav-principal.tsx` | 1 |
| `docs/_artefactos/airtable/AT08_Alertas_SLA.js` | 1 |
| `docs/_artefactos/manual_imgs/build_manual_v2.py` | 1 |
| `lib/sla-cronologia.ts` | 1 |
| `lib/sla-etapas.ts` | 1 |
| `lib/sla-habil.ts` | 1 |

**Commit 3 — `docs(sync): cierra bitácora IF-Tasador v1.9.9 con shas` · `pendiente-single-commit`**

| Archivo | Qué cambia |
|---|---|
| `docs/_sync_ifTasador_v1/SYNC_LOG.md` | Este bloque, la fila del lote 7, las filas del registro de archivos y la desviación C-10 |
| `docs/_sync_ifTasador_v1/RESUME.md` | Estado canónico al cierre del lote 7 |

**Referencias preservadas como huella histórica**, conforme a la instrucción del lote:
`docs/aprendizajes.md`, `docs/_notas/snapshot_20260812_1500.md`, las filas del changelog
interno del spec (*Cambios v1.9.7 → v1.9.8*, *v1.9.8 (anterior)*), la línea `SUPERSEDED` y
todas las construcciones «hasta v1.9.8» / «entre v1.9.4 y v1.9.8».

### Ambigüedades registradas · A-12 a A-17

Ficha completa en `gap/_ambiguedades.md`. Todas abiertas al cierre del lote.

| ID | Punto abierto | Bloquea | Impacto |
|---|---|---|---|
| **A-12** | Composición del chip "Hoy": qué debe hacer el tasador en el día. La definición anterior (`fecha_asignacion` < 24 h) no es una agenda | RF-TAS-01 | alto |
| **A-13** | Origen de los comparables si la sección D pasa a sólo lectura, como pide el diseño v4 p. 23 punto 6.1 | RF-12 · §2.8 | alto |
| **A-14** | Tabla de configuración donde viven los defaults de características constructivas y terminaciones (p. 24 punto 13) | RF-TAS-08 · §2.12 | medio |
| **A-15** | Si el rechazo del informe emite un aviso al visador: el diseño lo promete al tasador, §2.10 lo niega | RF-TAS-09 | medio |
| **A-16** | Si los mínimos de fotos de Habitaciones, Baños y Estacionamientos son fijos o dinámicos según lo declarado | RF-TAS-14 | medio |
| **A-17** | Si el catálogo de motivos de contacto no logrado es paramétrico en Airtable o fijo en el enum | RF-TAS-12 | bajo |

### Inconsistencias registradas · CI-013 a CI-021

Fichas completas en `docs/CODE_INCONSISTENCIES.md`. Todas abiertas, **con Dueño y Fecha
objetivo en blanco** por instrucción del usuario —excepción declarada a la regla 1 de ese
archivo, que exige ambos campos; las entradas posteriores vuelven a exigirlos—.

| ID | Divergencia | Estado de la corrección |
|---|---|---|
| **CI-013** | §2.7 dejaba continuar sin esperar la lectura; el diseño bloquea el botón hasta "Datos listos" | doc ✅ · código pendiente |
| **CI-014** | §2.8 declaraba siete secciones; el diseño presenta ocho (A–H) | doc ✅ · **parte fuera de §2 sin verificar**: `Origen_Datos_Informe_v1.1` §3.3 |
| **CI-015** | El prototipo sigue renderizando el contador "N de 3 usados" que la decisión capital 1 de §2 retiró | **única entrada donde el diseño está equivocado y el spec tiene razón** · código pendiente |
| **CI-016** | §2.10 admitía `window.print()` como respaldo, produciendo un informe sin la plantilla del cliente | doc ✅ · **parte fuera de §2 sin verificar**: §7 |
| **CI-017** | Acuse de envío por redirección automática contra pantalla con acción, y diálogo de confirmación no especificado | doc ✅ · código pendiente |
| **CI-018** | La card de la cola pedía "versión"; el diseño pide Rol SII, producto y teléfono accionable | doc ✅ |
| **CI-019** | §2.1 declaraba cuatro chips; el diseño tiene tres, sin "SLA en riesgo" | doc ✅ · chip "Hoy" condicionado a A-12 |
| **CI-020** | §2.4 describía un detalle de solicitud inexistente y §2.13 listaba dos rutas que no existen | doc ✅ · **parte fuera de §2 sin verificar**: `Blueprint_Interfaces_v2_10` |
| **CI-021** | El SLA del tasador se derivaba del plazo agregado en días en vez del plazo por etapa en horas hábiles | doc ✅ parcial · **contraparte fuera de §2 sin verificar**: §5.2.4 · RF-53. Relacionada con CI-005 |

**Las cuatro partes «fuera de §2 sin verificar» quedan anotadas en su ficha respectiva y no se
tocaron** (RO-03): §5.2.4/RF-53 y §7 por no estar autorizados, y `Origen_Datos_Informe_v1.1` y
`Blueprint_Interfaces_v2_10` por quedar fuera del alcance del lote. Ninguna es un olvido.

### Inconsistencia declarada entre §1 y §2 (CI-012)

El lote se ejecutó bajo la **opción B** decidida por el usuario: actualizar **sólo §2**
conforme al diseño v4, sin tocar §1.3.2, §1.3.3, §1.4, RN-59 ni §1.9.1, que en esta misma
versión retiran la coordinación por sistema.

La contradicción resultante **no se disimula**: §2.3 abre con una nota
`⚠ Inconsistencia declarada con §1 — ver CI-012`, y RF-TAS-04 y RF-TAS-05 llevan en su
descripción la marca *"Pendiente de resolución de CI-012 (decisión de negocio Héctor/Óscar,
11-ago-2026)"*. §2.5 deja constancia de que la excepción acotada a RN-59, retirada de §1.4,
hace falta de nuevo si CI-012 se cierra reinstaurando la coordinación.

### Nota de commit

> Por decisión del usuario, los tres commits planificados —contenido, bump y bitácora— se
> consolidaron en un **único commit**. Los 12 marcadores `<sha …>` quedan con el placeholder
> `pendiente-single-commit` y serán reemplazados por el sha real en una edición posterior
> post-push. La agrupación por commit que documentan los tres bloques de arriba **se conserva
> como agrupación lógica**: describe qué cambia junto con qué, aunque el historial de git no
> la refleje. Es el mismo criterio con que se registraron los lotes 2 y 3, que también
> compartieron commit: la trazabilidad se sostiene por este registro, no por el historial.
> Desviación **C-13**.

---

## Registro de archivos tocados

| Archivo | Familia | Lote | Fecha | Commit | RF/RN afectados | Rol firmante | ✓ |
|---|---|---|---|---|---|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md` (nuevo) | A | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md` (nuevo) | E | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_5.md` (nuevo) | D | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md` (nuevo) | C | 0 | 25-jul-2026 | `196c1e1` | — (copia sin cambios) | EA (D-A) | ✓ |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_3.md` | A | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md` | E | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | D | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md` | C | 0 | 25-jul-2026 | `196c1e1` | bloque `[SUPERSEDED]` | EA (D-A) | ✓ |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md` | A | 2 | 25-jul-2026 | `ae5202e` | RN-59 (excepción acotada) · RF-TAS-04 · RF-TAS-05 · RF-TAS-06 · AT03 · P-4 · P-5 | EA + PM + DE + UX + FE | ✓ |
| `docs/schema-airtable.md` (§22 nueva) | H | 3 (ii) | 25-jul-2026 | `ae5202e` | A-05 · RF-TAS-06 · P-5 | DE | ✓ |
| `docs/CODE_INCONSISTENCIES.md` (nuevo) | H | 3 (iii) | 25-jul-2026 | `ae5202e` | CI-001 · A-05 | DE | ✓ |
| `docs/_md/VProperty_Blueprint_Interfaces_v2_10.md` | E | 4 | 25-jul-2026 | `a08bd20` | RF-TAS-01..10 · RF-TAS-02 · RF-TAS-07 · D-B · P-3 · **DEP-EXT:A-09 ×2** (L2524 `horas_restantes` · L2560 `TX_CoordinacionVisita`) | EA + UX + FE | ✓ |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_9.md` | C | 4 | 25-jul-2026 | `a08bd20` | máquina de estados §2.11 · 7 pantallas IF-03 · D-B · P-3 · **DEP-EXT:A-09 ×1** (L1280 `TX_CoordinacionVisita`) | EA | ✓ |
| `docs/diseno.md` | F | 5 | 25-jul-2026 | `38f275d` | vocabulario §2.11 · `devuelta` DEPRECATED · RN-59 excepción acotada · RF-TAS-04 (citada) | UX + PM | ✓ |
| `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_6.md` | F | 5 | 25-jul-2026 | `38f275d` | `devuelta` DEPRECATED · canal único correo (§1.7) · **en sitio sin bump + changelog al pie (§3 del plan)** | EA + DE | ✓ |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` (renombrado desde `…_v1_9_8.md`) | A | 7 | 13-ago-2026 | `pendiente-single-commit` | RF-TAS-11..22 (nuevos) · RF-TAS-01..10 y RF-12 (modificados) · RN-54 · RN-59 (§13) · glosario §14 · CI-012 declarada en §2.3 | PM + EA + UX + QA | ✓ |
| `docs/CODE_INCONSISTENCIES.md` | H | 7 | 13-ago-2026 | `pendiente-single-commit` | CI-013..CI-021 · rutas de CI-003, CI-007 y CI-012 reapuntadas | PM + EA + QA | ✓ |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | H | 7 | 13-ago-2026 | `pendiente-single-commit` | A-12..A-17 | PM + EA + UX | ✓ |
| `CLAUDE.md` · `docs/_md/plan-ejecucion-if02-v1_9.md` · `docs/diseno.md` · `docs/construccion.md` · `docs/schema-airtable.md` · `README.md` | F/H | 7 | 13-ago-2026 | `pendiente-single-commit` | puntero normativo v1.9.8 → v1.9.9 (30 refs) | QA | ✓ |
| `components/console/nav-principal.tsx` · `lib/sla-cronologia.ts` · `lib/sla-etapas.ts` · `lib/sla-habil.ts` · `docs/_artefactos/airtable/AT08_Alertas_SLA.js` · `docs/_artefactos/manual_imgs/build_manual_v2.py` | — | 7 | 13-ago-2026 | `pendiente-single-commit` | puntero normativo en comentario de cabecera (6 refs) · **desviación C-10** | QA | ✓ |
| `docs/_sync_ifTasador_v1/SYNC_LOG.md` · `docs/_sync_ifTasador_v1/RESUME.md` | — | 7 | 13-ago-2026 | `pendiente-single-commit` | cierre de bitácora del lote 7 | QA | ✓ |

**Corrección de punteros del checklist en el lote 5.** 5.5 aplicado en `docs/diseno.md:287`
(enunciado normativo de la excepción) y `docs/diseno.md:608` (REGLA C remite a ella); el
puntero original `diseno.md:256` y la inclusión de `construccion.md` resultaron incorrectos,
corregidos en ejecución. `construccion.md` no enuncia RN-59 como norma —su única mención está
en una fila de bitácora histórica de progreso— y por eso no se abrió.

**Nombres §22 actualizados vs. aprobación previa:** `tipoPropiedad` y `tipoPropiedadNuevoUsado`
adoptados de código existente vía §22.4 paso 2 (reemplazan `tipoInmueble` y
`condicionPropiedad`); sólo `condicionPropiedadAplicable` es acuñación nueva.

**Integridad del lote 0 verificada:** `cmp` byte a byte entre original y copia, más `diff`
de cuerpos contra `HEAD`. Cero cambios de contenido; sólo cabeceras.

**Integridad del lote 4 verificada:** 229 líneas nuevas en 2 archivos. Validador de columnas
sobre todas las líneas del diff: **cero** violaciones en tablas pandoc y **cero** desalineaciones
en cajas grid (ancho 73). Greps de regresión: `"Enviar visita"` en cero; `capturada` en una sola
ocurrencia, que es la nota que declara su inexistencia; `"Calcular Tasación"` en 6. Ningún `SC`
modificado —`SC06` aparece en el diff sólo arrastrado en una línea editada, balance 1:1—.
Predecesores congelados (`Blueprint_v2_9`, `Arquitectura_v2_8`, `spec_v1_9_3`, `Capa_Datos_v2_6_4`)
sin cambios. **Marca `DEP-EXT:A-09` en 3 puntos**, sin menciones huérfanas.

> **Convención de la marca DEP-EXT.** Comentario HTML de una línea, **fuera de toda tabla** para
> no romper la alineación pandoc. Formato fijo:
> `<!-- DEP-EXT:<ambigüedad> · <entidad o campo> · pendiente creación Airtable · no verificada <fecha> · declarada en spec <versión> §<sección> -->`
> Cuando A-09 se resuelva, localizar todas las referencias con `grep -rn "DEP-EXT:A-09" docs/`.
>
> **Las 3 marcas del lote 4, agrupadas por dependencia externa (A-09):**
>
> | # | Archivo:línea | Objeto bloqueado | Punto del lote |
> |---|---|---|---|
> | 1 | `Arquitectura_Enterprise_VProperty_v2_9.md:1280` | `TX_CoordinacionVisita` (entidad) | 4.4 · inventario de entidades |
> | 2 | `VProperty_Blueprint_Interfaces_v2_10.md:2560` | `TX_CoordinacionVisita` (entradas/salidas) | 4.4 · IF-03 §7.3 |
> | 3 | `VProperty_Blueprint_Interfaces_v2_10.md:2524` | `horas_restantes` (campo fórmula) | 4.5 · semáforo SLA |
>
> Las tres bloquean por la misma causa —schema declarado en §2.12 del spec v1.9.3 y no creado en
> Airtable—, no por tres causas distintas. Se resuelven todas juntas cuando A-09 cierre.

**Integridad del lote 2 verificada:** 171 inserciones · 14 supresiones en un solo archivo.
Las cuatro tablas pandoc tocadas (§1.3.2 bloques · ficha RN-59 · §6.2 AT01–AT10 · índice §13)
validadas por script de alineación de columnas: cero celdas cruzando el separador. Greps de
regresión: `capturada` sin ocurrencias vivas —quedan sólo los enunciados de deprecación y la
nota histórica—; `Informe v1.0 §3.3` en cero. Ningún identificador histórico renumerado
(`AT03` y `RN-59` reaparecen idénticos). Predecesor v1.9.3 sin cambios.

---

## Checklist de las ediciones obligatorias §5.1 del prompt

Estado al cierre de Fase 2. Ninguna ejecutada aún; la columna *Destino* indica dónde se aplicará.

### Máquina de estados y vocabulario

| Edición | Destino | Estado |
|---|---|---|
| `capturada` → `visitada` | spec §6.2 línea 2974 (**única ocurrencia viva del repo**) | ✅ **lote 2** · `ae5202e` |
| `devuelta` DEPRECATED con nota canónica | Capa Datos (2018, 5893) · Blueprint (413, 417, 602, 633, 925, 936, 948, 2465, 2576, 2603, 2660, 3717, 3755) · Arquitectura (3761, 3764, 3771) · Motor (303, 361) · schema-airtable (153) · diseno (57) | ⏸ lotes 3–5 |
| Botón → **"Calcular Tasación"** | Blueprint (554, 906, 1130, 2425) · diseno (43) — término real hallado: **"Enviar visita"** (C-7) | ⏸ lotes 4–5 |
| Eliminar "AlertDialog dual" → autosave + botón | **cero ocurrencias fuera del spec**, que ya lo enuncia correctamente (1714) | ✅ nada que hacer |

### Coordinación de visita (§2.3)

| Edición | Destino | Estado |
|---|---|---|
| Ruta `app/tasaciones/[id]/coordinar/` en Blueprint IF-03 | Blueprint — hoy **cero rutas de IF-03 documentadas** | ⏸ lote 4 |
| `TX_CoordinacionVisita` con los 11 campos de §2.12 | Capa de Datos §19.x + schema-airtable | ⏸ lote 3 |
| `coordinacion_vigente`, `observacion_rechazo_tasador`, `horas_restantes` | Capa de Datos §19.1 + schema-airtable + CLAUDE.md | ⏸ lotes 3, 5 |
| 2 plantillas en `C_Plantillas` | Capa de Datos §12.2 + schema-airtable | ⏸ lote 3 |
| SC13 sirve ambas plantillas · **no** escenario nuevo | Capa de Datos + CLAUDE.md (acotar la prohibición a IF-02) | ⏸ lotes 3, 5 |

### RN-59 con excepción acotada

| Edición | Destino | Estado |
|---|---|---|
| Ficha RN-59 + §1.4 + índice §13 | spec v1.9.4 (635, 601–632, 4409, 4511) | ✅ **lote 2** · `ae5202e` — se amplió a §1.9.1 (FUT-EJ-06 y FUT-EJ-07), que §2.14 fila 10 también nombra y afirmaban lo contrario |
| Verificar que ningún otro doc afirme la regla vieja sin excepción | diseno.md (256) · construccion.md | ⏸ lote 5 |

### Fotos vs Documentos (§2.6)

| Edición | Destino | Estado |
|---|---|---|
| Eliminar categoría "Documentos" del organizador | **cero ocurrencias en el repo.** Origen de Datos v1.1 §3.3 Sección 2 ya lista 22 categorías sin "Documentos" (verificado C-9) | ✅ nada que hacer |
| Sheet documental filtrado por `tipo_propiedad` | spec §4.2.1 + Capa de Datos + Blueprint | 🟡 **spec ✅ lote 2** (`ae5202e`) · pendientes Capa de Datos y Blueprint (lotes 3–4) |
| `tipo_propiedad` en `D_TipoDocumento` | Capa de Datos + schema-airtable + spec §4.2.1 | 🟡 **spec ✅ lote 2** (`ae5202e`) · pendientes Capa de Datos y schema-airtable (lote 3) |
| Corregir que `cuándo` **no** es proxy de tipo de propiedad | spec §4.2.1 línea 2322 | ✅ **lote 2** · `ae5202e` |

### Automatizaciones

| Edición | Destino | Estado |
|---|---|---|
| AT03 trigger `estado = visitada` | spec §6.2 (2974). **Motor v2.6 ya correcto** en 36, 157, 678, 688 | ✅ **lote 2** · `ae5202e` |
| SC08 y SC09 con sus triggers | Capa de Datos + Blueprint + Arquitectura | ⏸ lotes 3–4 |
| SC02 fusionado en SC01 → retirado | Capa de Datos (3619, 4820) | ⏸ lote 3 |
| SC04 retirado (asignación manual) | Capa de Datos (1998, 5707, 5944, 7006) · Arquitectura (3158, 3749, 3807) | ⏸ lotes 3–4 |
| SC05 → SC08 | 8 archivos · **38 ocurrencias** (la cifra 22 era errónea — ver A-10) | 🔴 **BLOQUEADO · A-10** |
| SC15 retirado (→ AT08) | Capa de Datos (5 de UF) · Arquitectura (3122, 3307) · Blueprint (3585) · Origen Datos (1034). ⚠ **no** las 2 de backups | ⏸ lotes 3–5 |
| Constraint blanda `(solicitud_id, fecha_respuesta_truncada_al_minuto)` | Capa de Datos §19.x | ⏸ lote 3 |

### UI · vocabulario y comportamiento

| Edición | Destino | Estado |
|---|---|---|
| Chips "Hoy" y "Por coordinar" | Blueprint IF-03 | ⏸ lote 4 |
| Badge "Esperando contacto de ejecutiva" | Blueprint IF-03 | ⏸ lote 4 |
| Semáforo + `horas_restantes` numérico | Blueprint + Capa de Datos | ⏸ lotes 3–4 |
| Eliminar "franja roja", "3 re-visitas", "último intento" | **cero ocurrencias fuera del spec**, que ya las retira (1582, 1794) | ✅ nada que hacer |
| Eliminar lenguaje de IA en textos de UI | **cero violaciones.** El único hit es la prohibición correctamente enunciada (spec 1698) | ✅ nada que hacer |
| Botón "Rechazar" con nueva semántica | Blueprint IF-03 (Pantalla 7) | ⏸ lote 4 |
| "Ver expediente" como modal reutilizado | Blueprint IF-03 | ⏸ lote 4 |

### Herencias desde IF-02 v1.9 (preservar)

| Herencia | Verificación | Estado |
|---|---|---|
| RN-49 · estado de conservación heredado, catálogo de 6 valores | Presente en Capa de Datos §19.1 (`estado_conservacion` singleSelect `nuevo/sin_uso/bueno/normal/malo/deficiente`) ✅ | preservar |
| RN-45 · superficies con origen y adjunto de respaldo | Presente en spec §1.3.2 (bloque Unidades) ✅ | preservar |
| RN-50 · ampliaciones con marca de regularizable | Presente en spec §1.3.2 y Blueprint (1721) ✅ | preservar |

### Punto abierto P-3 (Next.js)

| Edición | Destino | Estado |
|---|---|---|
| Nota de punto abierto donde se fije Next.js 14 (RT-01) | Blueprint + Arquitectura + spec §1.8 | ⏸ lote 4 |
| **No** cambiar RT-01 | — | 🔒 prohibido hasta sign-off PM + EA + FE |

---

## Desviaciones autorizadas respecto del prompt

| # | Desviación | Autorizada en |
|---|---|---|
| C-1 | Ruta del insumo: `docs/_md/`, no `docs/spec/` | Checkpoint #1 |
| C-2 | Versiones reales del repo prevalecen sobre las del prompt | Checkpoint #1 |
| C-3 | Ampliación de scope: se produce v1.9.4 | Checkpoint #1 |
| C-4 | Familias B y G vacías; DoD reducida a spec + Blueprint + operativo | Checkpoint #1 |
| C-7 | "Enviar visita" agregado a los greps de regresión | Fase 1 |
| **C-8** | **v1.9.2 no se restaura** — desviación de §1.3 y §4.2 | Checkpoint #2 |
| C-9 | Cita `Origen de Datos v1.0 §3.3` → v1.1 (verificado, contrato intacto) | Checkpoint #2 |
| §4.1 | Sub-ramas por **lote**, no por familia (el lote 1 es transversal) | Checkpoint #2 |
| §4.1 | **Lote 0 habilitante** antepuesto: el bump de versión debe preceder al lote 1 para no modificar los predecesores que quedan congelados como SUPERSEDED | Checkpoint #3 (D-A) |
| **C-10** | **Se tocan archivos `.ts`/`.tsx`/`.js`/`.py`** en el lote 7, contra la regla de oro *"esta tarea es sólo de documentación"* de `RESUME.md`. El cambio es de **comentario de cabecera exclusivamente** —el puntero al documento normativo, `v1.9.8 → v1.9.9`, en `nav-principal.tsx`, los tres `lib/sla-*.ts`, `AT08_Alertas_SLA.js` y `build_manual_v2.py`—: cero líneas ejecutables, cero cambios de comportamiento. Dejar esos punteros sin actualizar habría dejado seis referencias apuntando a un archivo inexistente tras el `git mv`, que es el modo de fallo que la instrucción del bump existe para evitar | Sesión 13-ago-2026 · instrucción explícita del usuario (Conflicto 3, opción ii) |
| **C-11** | **El lote 7 no pertenece a la Fase 3 planificada.** Se numera 7 y no 6 para no ocupar el identificador del lote de citación, que sigue propuesto sin autorizar. Registrado en esta bitácora por compartir eje con el sync (§2 y sus RF-TAS) y no en un archivo aparte | Sesión 13-ago-2026 |
| **C-12** | **CI-013 a CI-021 ingresan con Dueño y Fecha objetivo en blanco**, contra la regla 1 de `CODE_INCONSISTENCIES.md`. Los completa el usuario al priorizar la tanda de IF-03. La excepción queda declarada en el propio archivo y **no se normaliza**: las entradas posteriores vuelven a exigir ambos campos | Sesión 13-ago-2026 · instrucción explícita del usuario |
| **C-13** | **El lote se consolida en un único commit**, contra los tres commits secuenciados —contenido, bump y bitácora— con que se planificó el cierre y con que quedó redactado este registro. Consecuencias asumidas: (1) los 12 marcadores `<sha …>` pasan al placeholder único `pendiente-single-commit`, y el sha real se escribe en una edición posterior al push que **se commitea en la tanda siguiente, no en ésta**; (2) la agrupación por commit de los tres bloques del lote 7 **se conserva como agrupación lógica** —sigue diciendo qué cambia junto con qué, aunque el historial de git no lo separe—; (3) la regla de oro *"un commit por lote"* cede ante la decisión del usuario y **la trazabilidad se sostiene por este registro, no por el historial de git**, con precedente en los lotes 2 y 3, que compartieron `ae5202e`. Lo que **no** se hace es dejar el placeholder sin fecha de reemplazo: un marcador que nadie sustituye convierte la bitácora en un registro que apunta a nada | Sesión 13-ago-2026 · instrucción explícita del usuario |

---

## Decisiones firmadas · Checkpoint #3

| # | Resolución | Firma |
|---|---|---|
| **D-A** | Versión nueva para los tres canónicos: Blueprint **v2.10** · Capa de Datos **v2.6.5** · Arquitectura **v2.9** | EA |
| **D-B** | Métrica de tasa de devolución: **marcar, no recalcular**. Se eleva a firma PM aparte | PM + QA |
| **D-C** | `A_Eventos.visita_completada` **conserva su literal** (A-06 cerrada) | DE + INT |
| **D-D** | SC08/SC09 **no** entran al Motor de Cálculo (cubre AT01–AT10, Airtable) | EA |
