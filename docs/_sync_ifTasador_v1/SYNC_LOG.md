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
| **7** | Sync RF-TAS de la UI Tasador contra `Imagenes_IF_Tasador_v4.pdf` · bump v1.9.8 → v1.9.9 | ✅ **COMPLETADO** · 13-ago-2026 — 12 RF-TAS nuevos, 10 modificados, 0 eliminados. **RF-TAS-04 y RF-TAS-05 emitidos bloqueados por CI-012.** 6 ambigüedades y 9 inconsistencias nuevas registradas | contenido `7727c20` · bump `7727c20` · bitácora `7727c20` |

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

**Commit 1 — `docs(spec): sync IF-Tasador v1.9.9 con RF-TAS-11..22` · `7727c20`**

| Archivo | Qué cambia |
|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` | `git mv` desde `…_v1_9_8.md` + toda la edición de §2, §13 (RN-54 y RN-59), §14 (2 entradas de glosario), cabecera y bloque de cambios de versión |
| `docs/CODE_INCONSISTENCIES.md` | CI-013 a CI-021 + precisión de alcance + rutas de CI-003, CI-007 y CI-012 reapuntadas a `v1_9_9` |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | A-12 a A-17, en bloque propio fechado |

> ⚠ **`CODE_INCONSISTENCIES.md` no se puede repartir entre los commits 1 y 2.** Sus
> actualizaciones de versión están **dentro** de las celdas `Archivo:línea` de fichas que el
> commit 1 escribe o corrige, de modo que separarlas exigiría staging por línea sobre celdas
> de la misma tabla. Va entero al commit 1. Por eso el commit 2 son **12** archivos y no 13.

**Commit 2 — `chore(version): bump referencias v1.9.8 → v1.9.9 en repo` · `7727c20`**

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

**Commit 3 — `docs(sync): cierra bitácora IF-Tasador v1.9.9 con shas` · `7727c20`**

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
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_9.md` (renombrado desde `…_v1_9_8.md`) | A | 7 | 13-ago-2026 | `7727c20` | RF-TAS-11..22 (nuevos) · RF-TAS-01..10 y RF-12 (modificados) · RN-54 · RN-59 (§13) · glosario §14 · CI-012 declarada en §2.3 | PM + EA + UX + QA | ✓ |
| `docs/CODE_INCONSISTENCIES.md` | H | 7 | 13-ago-2026 | `7727c20` | CI-013..CI-021 · rutas de CI-003, CI-007 y CI-012 reapuntadas | PM + EA + QA | ✓ |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | H | 7 | 13-ago-2026 | `7727c20` | A-12..A-17 | PM + EA + UX | ✓ |
| `CLAUDE.md` · `docs/_md/plan-ejecucion-if02-v1_9.md` · `docs/diseno.md` · `docs/construccion.md` · `docs/schema-airtable.md` · `README.md` | F/H | 7 | 13-ago-2026 | `7727c20` | puntero normativo v1.9.8 → v1.9.9 (30 refs) | QA | ✓ |
| `components/console/nav-principal.tsx` · `lib/sla-cronologia.ts` · `lib/sla-etapas.ts` · `lib/sla-habil.ts` · `docs/_artefactos/airtable/AT08_Alertas_SLA.js` · `docs/_artefactos/manual_imgs/build_manual_v2.py` | — | 7 | 13-ago-2026 | `7727c20` | puntero normativo en comentario de cabecera (6 refs) · **desviación C-10** | QA | ✓ |
| `docs/_sync_ifTasador_v1/SYNC_LOG.md` · `docs/_sync_ifTasador_v1/RESUME.md` | — | 7 | 13-ago-2026 | `7727c20` | cierre de bitácora del lote 7 | QA | ✓ |

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

---

## Tanda del 21-ago-2026 — audios del cliente + plantilla operativa

> **No pertenece a la Fase 3 planificada**, con el mismo criterio que el lote 7 (**C-11**): se
> registra acá por compartir eje —§2 del spec y sus RF-TAS— y porque partirla en un archivo aparte
> fragmentaría la trazabilidad que este registro sostiene. **No se numera como lote**: no es una
> sub-rama del plan de la Fase 2, es una ronda disparada por insumos de negocio nuevos.

**Insumos** — segunda tanda de audios de Héctor en `docs/_md/audios/` (12 transcripciones `.txt`:
`p1`–`p8`, `r21`–`r23`, `revision 1`) y la plantilla operativa vigente
`docs/_md/archivo_ejemplo/Formato Informe VProperty Enero2026.xlsm` (21 hojas). Radiografía del
libro en `docs/_notas/radiografia-excel-informe.md`.

**Rama** — `feat/tasador-ui`.

**Ámbito** — Control de SLA + UI Tasador. Los hallazgos del alta de IF-02 (código de solicitud,
campos obligatorios, comunas, clientes, reasignación) quedan **registrados y sin trabajar**, por
decisión de Sergio.

### Entregables

| Archivo | Acción |
|---|---|
| `docs/_md/VProperty_SLA_Negocio_v1.2.md` | **nuevo** · sucede a v1.1 |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_13.md` | **nuevo** · sucede a v1.9.12, que queda SUPERSEDED |
| `docs/_md/plan_ejecucion_UItasador_v1.1.md` | **nuevo** · sucede a v1.0 |
| `docs/_md/plan-ejecucion-if02-v1_9.md` | **in-place** · bump interno v1.12 → v1.13 |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | A-14 enmendada · **A-17 cerrada** · alta de A-22 a A-34 |
| `docs/CODE_INCONSISTENCIES.md` | **CI-049** nuevo · CI-021, CI-038 y CI-040 enmendadas · 19 punteros actualizados |
| `docs/aprendizajes.md` | dos entradas |
| `CLAUDE.md` · `docs/schema-airtable.md` | punteros al normativo y al plan del Tasador |

### Convenciones y decisiones de esta tanda

| # | Resolución | Origen |
|---|---|---|
| **C-14** | **El plan de IF-02 se versiona sólo en su encabezado.** `plan-ejecucion-if02-v1_9.md` conserva el sufijo `v1_9` del nombre mientras su versión interna avanza (v1.13). Los dos números miden cosas distintas: el sufijo es la **referencia estable** que apuntan §0.1 de ambos planes, `CLAUDE.md` y los aprendizajes ya escritos; el encabezado es el **contador de revisiones**. Renombrarlo en cada bump obligaría a actualizar todas esas referencias en el mismo commit, y una que se escape deja a la sesión siguiente leyendo un plan inexistente. **La regla general —archivo nuevo por versión— sigue vigente para la especificación normativa y los documentos de diseño**, donde nombre y cuerpo deben coincidir siempre. El motivo queda escrito en §0.1 del propio plan, no sólo acá | Sesión 21-ago-2026 · instrucción explícita del usuario |
| **C-15** | **Las cifras que el cliente declara en audio entran a la spec marcadas, no como normativas.** Formato fijo: `**Valor**: X · **Fuente**: audio [pN] · **Estado**: pendiente de ratificación por el product owner (A-XX)`. Se aplicó al umbral del recordatorio (A-22), al catálogo de seis motivos (A-25) y al de siete motivos de reproceso (A-26). El motivo es que un audio es evidencia de intención, no una decisión firmada: escribirla sin marca la vuelve indistinguible de un número acordado, y escribirla fuera de la spec la pierde | Sesión 21-ago-2026 |
| **C-16** | **Toda cita de la plantilla operativa lleva su celda**, en formato `[Excel: hoja!celda]`. 29 citas en total entre el SLA de negocio, la spec y el plan del Tasador. Sin la celda, un valor por defecto es indistinguible de una invención, y la plantilla cambia con cada versión mensual | Sesión 21-ago-2026 · instrucción explícita del usuario |
| **C-17** | **A-32 se reclasificó en ámbito sin renumerar.** Nació en el bloque fuera de ámbito y terminó citada desde tres secciones normativas, porque el tablero de vencimientos es §5.2.9 — Control de SLA. Se dejó su número y se documentó el motivo en la propia ficha, en vez de renumerar y romper las tres citas | Sesión 21-ago-2026 · decisión del usuario |
| **C-18** | **El código no se toca, ni siquiera en comentarios.** Dos punteros JSDoc quedaron apuntando a documentos inexistentes (`lib/tasaciones.ts:4`, `lib/tipos-documento.ts:53`) y **no se corrigieron**, contra el precedente C-10 del lote 7, que sí actualizó seis punteros equivalentes. La diferencia es de alcance declarado: esta ronda era documental y R2 excluía código. El hallazgo se registró como **CI-049** en vez de arreglarse sobre la marcha, que es el mecanismo que este registro tiene para eso | Sesión 21-ago-2026 · instrucción explícita del usuario |

---

## Tanda del 22-ago-2026 — respuestas de Héctor

> **Ronda de cierre, no de elicitación.** No hay insumo nuevo: Héctor respondió las tres consultas
> bloqueantes que dejó abiertas la tanda del 21-ago-2026. Se registra por el mismo criterio
> (**C-11**) y porque cierra ambigüedades que atraviesan §2 y §5.2 del spec.

**Rama** — `feat/tasador-ui`. **Ámbito** — Control de SLA + UI Tasador.

### Decisiones bajadas

| Consulta | Respuesta de Héctor | Efecto |
|---|---|---|
| **A-22** · umbral del recordatorio | **4 horas hábiles** | Cierra A-22 y **D-17**. Resulta coincidir con el SLA ideal de la etapa 2, ya sembrado en `C_SLA_Etapas` |
| **A-27** · domicilio de los defaults | **Tipo de propiedad × estado de uso** | Cierra A-27, **D-20** y **A-14** completa. Desbloquea la precarga de la sección E |
| **A-28** · factores de homogeneización | **Los tres se usan · RF-TAS-08 ratificado** | Cierra A-28 y **D-21**. `D. F.`/`F. M.` pasan a observación (**A-35** · **D-22**) |

### Entregables

| Archivo | Acción |
|---|---|
| `docs/_md/VProperty_SLA_Negocio_v1.3.md` | **nuevo** · sucede a v1.2 |
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_14.md` | **nuevo** · sucede a v1.9.13, que queda SUPERSEDED |
| `docs/_md/plan_ejecucion_UItasador_v1.2.md` | **nuevo** · sucede a v1.1 |
| `docs/_md/plan-ejecucion-if02-v1_9.md` | **in-place** · bump interno v1.13 → v1.14 (**C-14**) |
| `docs/_sync_ifTasador_v1/gap/_ambiguedades.md` | A-14/A-22/A-27/A-28 cerradas · A-18 estrechada · alta de A-35 y **A-36** |
| `docs/CODE_INCONSISTENCIES.md` | CI-045 y CI-048 desambiguadas · CI-022 y CI-031 enmendadas |
| `docs/_sync_ifTasador_v1/RESUME.md` · `CLAUDE.md` · `docs/schema-airtable.md` | estado canónico y punteros |

### Convenciones y decisiones de esta tanda

| # | Resolución | Origen |
|---|---|---|
| **C-19** | **Una cifra ratificada que coincide con un umbral ya existente no crea un mecanismo nuevo.** Héctor fijó el recordatorio en 4 h hábiles y ese número **ya estaba en la base**: es `sla_ideal_horas` de `e2` en `C_SLA_Etapas`, cuyo instante el motor materializa como `sla_etapa_alerta_ts`. El plan v1.13 tenía diferido un campo para alojarlo; v1.14 **cierra el diferimiento sin crear nada** y el predicado pasa a ser el semáforo que la fórmula ya emite. Modelarlo igual habría producido **dos fuentes para el mismo número** —lo que **RO-05** prohíbe—, con un fallo silencioso: los dos valores empiezan iguales y divergen el día que alguien edita uno. Queda como **§9.6-R8** en el plan de IF-02. La regla de método: **antes de modelar una cifra que llega del negocio, comprobar si el sistema ya la calcula** | Sesión 22-ago-2026 |
| **C-20** | **Los identificadores `A-XX` los asigna `gap/_ambiguedades.md` y sólo ese archivo.** La decisión sobre la cota del chip "Por coordinar" se registró en CI-045 y CI-048 bajo la etiqueta `A-22`, que el registro ya usaba para el umbral del recordatorio. Ambas giran alrededor de "4 h en coordinación", que es lo que las volvía indistinguibles. **La del chip se re-etiqueta como A-36**, entra al registro con ficha propia marcada cerrada · aplicada, y las dos fichas CI llevan nota de desambiguación. Precedente directo: **A-10** (colisión SC05/SC08), que costó un lote bloqueado. La regla: una ficha CI **cita** un `A-XX`, nunca lo crea | Sesión 22-ago-2026 · instrucción explícita del usuario |
| **C-21** | **Ratificar un umbral no lo hace replicable aguas abajo.** Con las 4 h confirmadas, la tentación en IF-03 era reintroducir la cota horaria en el chip "Por coordinar" para que la cola "cuadrara" con el recordatorio. **No se hace**, y el argumento es más fuerte que antes: reabriría **CI-021** —recalcular horas hábiles en el cliente— y desharía **A-36**, escondiendo del chip justamente las coordinaciones vencidas que el recordatorio acaba de señalar. IF-03 **observa** coherencia; no replica aritmética | Sesión 22-ago-2026 |

---

## Tanda del 22-ago-2026 (b) — P0.5-TAS · schema de defaults

> **Primera tanda de esta serie que muta Airtable.** Las anteriores fueron documentales. Contrato
> 🔴 pausa-total: ocho pausas `s/n`, ninguna rechazada, ningún `create_field` fallido.

**Rama** — `feat/tasador-ui`. **Base** — `app9G7lLkIV3CpeLa`.
**Habilitada por** — el cierre de **A-27** el 22-ago-2026: sin la clave de partición, esta tabla no
se podía diseñar.

### Qué se creó

**`C_DefaultsAntecedentes` · `tblOj7nXcjeouPy09`** · 11 campos · **0 filas**.

Aloja los defaults de la hoja de antecedentes (spec v1.9.14 §2.8.1 · RF-TAS-23), particionados por
tipo de propiedad × estado de uso, con un registro por (combinación, `campo_destino`, `atributo`).
IDs completos en `docs/schema-airtable.md` y en `docs/_notas/snapshot-P0.5-TAS-defaults.md`.

**Efecto colateral inevitable:** el Link generó el campo inverso `fldN5ya6IA6j0nM0S` en
`M_TiposPropiedad`. Anotado para que no aparezca como huérfano en la próxima auditoría.

### Decisiones de esta tanda

| # | Resolución | Origen |
|---|---|---|
| **C-22** | **El eje de una tabla particionada copia el TIPO del campo contra el que se va a unir, no su vocabulario.** `TX_Solicitudes.tipo_propiedad` es un `multipleRecordLinks` a `M_TiposPropiedad`, así que el eje 1 de `C_DefaultsAntecedentes` es Link y no `singleSelect` con los 8 literales del Excel; y `estado_uso` copia `nuevo`/`usado` en **minúscula** de `TX_Solicitudes.tipo_propiedad_nuevo_usado`, no `Nuevo`/`Usado` del Excel ni `nueva`/`usada` de `D_TipoDocumento`. Tres vocabularios para el mismo dominio ya produjeron **P-5**, cuyo síntoma es un join que nunca coincide y una pantalla vacía sin error. La regla: **antes de declarar un eje, leer el tipo y el dominio reales del campo con el que va a casar** | Sesión 22-ago-2026 · hallazgo de la verificación previa |
| **C-23** | **Granularidad fina sobre fila ancha, cuando el conjunto de campos puede crecer.** `C_DefaultsAntecedentes` usa un registro por (combinación, campo, atributo) —~216 filas sembradas— en vez de un registro por combinación con ~54 columnas. Tres razones: agregar un campo es alta de datos y no `create_field`, que es la operación más frágil del MCP; cada default lleva **su propia** cita `[Excel: hoja!celda]`, imposible en una fila ancha; y 54 columnas no son mantenibles a mano, mientras que 216 filas son triviales para Airtable | Sesión 22-ago-2026 |
| **C-24** | **Lo que no ramifica por la clave no entra a la tabla particionada.** El anexo de estado de conservación —38 filas con la misma terna— es constante para las 16 combinaciones, y alojarlo habría significado 114 filas idénticas por combinación. Queda fuera (**A-39**), y `bloque` se crea con tres opciones. Lo mismo con los catálogos de valores admisibles, que no dependen de la combinación y sólo se **referencian** por `catalogo_ref` (**A-38**). Meter un dato constante en una tabla particionada no es conservador: es duplicación con costo de mantenimiento y riesgo de deriva (**RO-05**) | Sesión 22-ago-2026 |

### Ambigüedades abiertas

**A-37** (bloqueante · duplicados en `M_TiposPropiedad`) · **A-38** (catálogos) · **A-39** (anexo de
conservación). Registradas en `gap/_ambiguedades.md` según **C-20**, no sólo en el snapshot.

---

## Tanda del 22-ago-2026 (c) — P0.5.B-TAS · saneamiento de `M_TiposPropiedad`

> **La tanda de mayor riesgo de esta serie**: primera con borrados irreversibles sobre una tabla
> maestra con 72 referencias vivas desde 12 tablas. Contrato 🔴 pausa-total extrema: ocho pausas
> `s/n` más una **pausa manual** para verificación humana de Automations. Ninguna rechazada,
> ninguna operación fallida.

**Objetivo** — cerrar **A-37**, que bloqueaba el sembrado de `C_DefaultsAntecedentes`.

### El hallazgo

A-37 se había registrado como "duplicados por capitalización". El conteo de links mostró que **los
duplicados no estaban solapados**: `CASA`/`DEPARTAMENTO` acumulaban sólo links transaccionales (26
solicitudes) y `Casa`/`Departamento` sólo configuración (33 referencias). **Ninguna de las 39
solicitudes podía resolver su regla, su vida útil, su precio unitario ni su SLA por ese eje.** No
era deuda pendiente de sembrado: era una desconexión funcional viva en la base.

### Resultado

15 filas → **9 activas + 6 en baja lógica**, con `CASA` y `DEPARTAMENTO` eliminadas y `Casa Piloto`
/ `Departamento Piloto` dadas de alta. Dominio final = las 8 de `ListaTipoPropiedad` más `Bodega`
(**A-40**). Detalle en `docs/_notas/snapshot-P0.5.B-TAS.md` y en `docs/schema-airtable.md` §7.1.

### Decisiones de esta tanda

| # | Resolución | Origen |
|---|---|---|
| **C-25** | **Antes de deduplicar una maestra, contar los links entrantes por fila — el reparto es el diagnóstico.** Aquí la distribución reveló que el problema no era el duplicado sino la **desconexión** entre transacciones y configuración, y además decidió cuál fila era canónica sin necesidad de opinar: se conserva la que concentra la configuración (más cara de migrar y la que alimenta al motor) y se migran los links transaccionales. Un merge decidido por "cuál se ve mejor escrita" habría podido tirar las 33 referencias de configuración | Sesión 22-ago-2026 |
| **C-26** | **Renombrar no es migrar, y conviene no confundirlos.** Para las filas sin duplicado, normalizar la capitalización es un `update` del campo primario que **preserva todos los links**: `OFICINA`→`Oficina` conservó sus 5 solicitudes y `BODEGA`→`Bodega` sus 8, sin tocar `TX_Solicitudes`. Sólo los duplicados verdaderos exigen migrar y borrar. Distinguirlos redujo esta tanda de 15 operaciones de migración a 2 | Sesión 22-ago-2026 |
| **C-27** | **Una verificación que el MCP no puede hacer se convierte en pausa manual explícita, no en supuesto.** Renombrar el primary de una maestra rompe cualquier filtro por literal, y el MCP **no puede leer el estado ni el código de una Airtable Automation**. En vez de asumir que no había ninguna, la tanda se detuvo con un mensaje literal hasta que Sergio confirmó `OK Automations verificadas`. El `grep` sobre `lib/`, `app/` y los blueprints —cero coincidencias— cubrió la mitad automatizable; la otra mitad la cubrió un humano | Sesión 22-ago-2026 · instrucción explícita del usuario |
| **C-28** | **Baja lógica antes que borrado, salvo evidencia de orfandad.** Las 6 filas sin match ni links se marcaron `activo = false` en vez de borrarse: son reversibles, no estorban, y `lib/catalogos.ts` ya las excluye del dropdown por su filtro `{activo} = TRUE()`. El borrado se reservó para las 2 filas cuya orfandad se **verificó** por lectura tras migrar. La eliminación por API no tiene papelera | Sesión 22-ago-2026 · R6 del prompt |

### Efecto sobre el código, sin tocarlo

`lib/catalogos.ts` tenía un workaround explícito para este duplicado. El saneamiento **lo mejora**:
la deduplicación pasa a ser un no-op y el nombre que viaja a SC01 se vuelve determinista, cuando
antes dependía del orden en que Airtable devolviera los registros. El comentario de las líneas
43-44 queda desactualizado y se anotó en **CI-049**; no se corrigió (R5).

---

## Tanda del 22-ago-2026 (d) — P0.5.C-TAS · sembrado de `C_DefaultsAntecedentes`

> **La tanda que convierte una tabla vacía en un catálogo consultable.** 212 filas en 12 batches,
> cero rechazos, cero reintentos. Contrato 🔴 pausa-total para escritura, relajado a corrido por
> instrucción explícita de Sergio tras el primer batch verificado.

**Objetivo** — sembrar los defaults de spec §2.8.1 (RF-TAS-23) en la tabla que P0.5-TAS creó vacía,
una vez que P0.5.B-TAS cerró **A-37**.

### Resultado

**212 filas** repartidas en las **4 combinaciones que la plantilla distingue** —`Casa` y
`Departamento` × `nuevo` y `usado`—, de las 16 que el dominio admite. Las otras 12 quedan sin filas,
que es el comportamiento declarado: campos vacíos, sin herencia. Verificación post-sembrado en ocho
comprobaciones independientes: total 212, cero huérfanas, cero inactivas, 51/51/55/55 por
combinación, 13 filas con nota de excepción. Detalle en `docs/_notas/snapshot-P0.5.C-TAS.md`.

### El hallazgo

Al re-verificar el mapeo contra el `.xlsm` real —leyendo los bloques `dataValidation` del XML de la
hoja, sin `openpyxl`— apareció que **la spec §2.8.1 y `radiografia-excel-informe.md` invierten dos
catálogos**: le atribuyen `Antecedentes!CK45:CK50` a *cierros exteriores* cuando el archivo lo
declara sobre `H43`, *obras complementarias*, y **`H42` no tiene ninguna validación** — es texto
libre. El mapeo de Fase 1 ya lo tenía bien, de modo que el sembrado salió correcto; lo que estaba
mal era la documentación derivada. Se corrigió la radiografía in-place; la spec, por normativa,
espera su bump.

Del mismo barrido salió que **`iluminacion` comparte la `dataValidation` de `calidad`**
(`BE46:BE50` y `Y37:Y44` en la misma declaración), campo que la decisión del Gate 1 no había
incluido entre los de catálogo inline. Sergio lo aprobó y sus 20 filas lo llevan.

### Decisiones de esta tanda

| # | Resolución | Origen |
|---|---|---|
| **C-29** | **Un default que depende de un tercer eje no se siembra "por mayoría".** `entrepisos` en Casa depende de `numeroPisos`, ajeno a la clave de partición, y sus dos ramas son igual de plausibles: se dejó sin sembrar (**A-41**). `calefaccion` depende de `AB22` pero **sí** tiene una rama que corresponde al caso que el pre-llenado modela —la plantilla en blanco despacha `NO PRESENTA`—, y esa se sembró. El criterio no es "cuántos ejes faltan" sino **si existe un caso en blanco que desempate**; sin él, vacío es más honesto que plausible-y-falso | Sesión 22-ago-2026 · decisión de Sergio |
| **C-30** | **Un valor claramente errado del origen se copia igual, con la excepción anotada en la fila.** `Departamento·usado·obras_complementarias·estado` vale `BUENA`, del catálogo de calidad y no del de estado. Corregirlo a `BUENO` habría hecho que la tabla dejara de reproducir la plantilla vigente sin que nadie lo decidiera, y habría escondido el error en vez de exponerlo. Se sembró tal cual (R1) con la nota en el campo `notas`, y **la carga de tolerarlo pasa a la UI**: el `singleSelect` de P7-TAS debe mostrar un valor fuera de su lista en vez de presentar el campo vacío (**A-42**) | Sesión 22-ago-2026 · decisión de Sergio |
| **C-31** | **`catalogo_ref` distingue tres estados, no dos.** Rango oculto (`Antecedentes!BZ45:BZ80`), lista inline en la celda (`Antecedentes!AF39 · lista inline`) y **vacío = texto libre**. Sin el estado intermedio, un campo con catálogo declarado dentro de la propia data validation era indistinguible de uno sin catálogo, y P7-TAS habría tenido que adivinar cuál renderizar como dropdown. ⚠ Airtable **descarta el string vacío al escribir**: esas filas vuelven de la API sin la clave, no con `""` | Sesión 22-ago-2026 · decisión 4 del Gate 1 |
| **C-32** | **Verificar el `.xlsm` no requiere `openpyxl`.** El entorno no lo tenía y `python3 -m venv` falla sin `ensurepip`. Un `.xlsm` es un ZIP: `zipfile` + una regex sobre `xl/worksheets/sheetN.xml` extrae los bloques `dataValidation` con sus `sqref` y sus `formula1`, que es exactamente lo que hacía falta para saber qué celda tiene qué catálogo. La ruta de respaldo resultó más directa que la principal, y no dependió de instalar nada | Sesión 22-ago-2026 |
| **C-33** | **El conteo declarado en un plan se verifica contra la base, no contra la aritmética del plan.** El plan de esta tanda anunciaba "12 filas con nota"; la lectura post-sembrado devolvió **13**, y el desglose —4 + 4 + 4 + 1— mostró que el error estaba en la suma del plan, no en los datos. La comprobación por consulta detectó en un paso lo que releer el plan no habría detectado | Sesión 22-ago-2026 |

### Efecto sobre el código

**Ninguno** (R4). No se tocó `app/`, `lib/` ni `components/`. El efecto es aguas abajo: **P7-TAS
puede construir la sección E con precarga efectiva**, que hasta hoy leía una tabla vacía.

---

## Tanda · 23-ago-2026 · Segunda tanda de respuestas del cliente · siete ambigüedades cerradas

**Actor:** Claude Code (documentación) · **Aprobación:** Sergio, con las cinco decisiones
explícitas del arranque de la tanda. **Efecto sobre el código: ninguno** (R4).

### Documentos emitidos

| Archivo | Estado |
|---|---|
| `docs/_md/VProperty_Especificacion_Proyecto_v1_9_15.md` | **nuevo** · sucede a v1.9.14, que queda SUPERSEDED |
| `docs/_md/VProperty_SLA_Negocio_v1.4.md` | **nuevo** · sucede a v1.3 |
| `docs/_md/plan_ejecucion_UItasador_v1.3.md` | **nuevo** · sucede a v1.2 |
| `docs/_md/plan-ejecucion-if02-v1_9.md` | versión interna **v1.14 → v1.15** · el nombre no se renombra (**C-14**) |
| `docs/_referencias/` | **nuevo directorio versionado** · el `.xlsm` de la plantilla operativa y el JPG del cuadro de comparables |

### Las siete ambigüedades

**Cierran:** A-13 · A-18 · A-23 · A-24 · A-25 · A-26 · A-32.
**Abre:** A-44.
**Decisiones de spec §15:** **D-18**, **D-19** y **D-24** cierran; entra **D-23**.

### El hallazgo

La respuesta del cliente a A-18 —*"los valores por defecto son los del `.xlsm`"*— **no respondía la
pregunta que A-18 tenía viva**. Tras cuatro estrechamientos, A-18 pedía una sola cosa: la cifra de
`factor_sup`, `factor_edad` y `factor_distancia`. El libro no las contiene, cosa que la radiografía
del 21-ago ya había establecido y que se re-verificó leyendo `xl/worksheets/sheet2.xml` con
`zipfile`: el cuadro `[Excel: Portada!B28:AX44]` tiene **doce columnas y ninguna de factor**, y
calcula `UF/m² C. = (Total UF − UF/m²T × Sup.Terreno − OO.CC.) / Sup.Constr.` La foto de ejemplo
que aportó el cliente es exactamente ese rango.

Lo que la respuesta sí hizo fue **disolver la pregunta**: al pasar la sección D a sólo lectura, no
queda campo de factor que precargar. A-18 se cerró por esa vía y **con la reserva escrita**: la
cifra nunca se dio, y si vuelve la captura, vuelve el bloqueo.

De ahí salió **A-44**: **D-21** había ratificado el 22-ago que los tres factores *"se usan en la
práctica"*, y el cuadro que ahora es su única entrada tampoco los trae.

### Decisiones de esta tanda

| # | Resolución | Origen |
|---|---|---|
| **C-34** | **Una respuesta del cliente se contrasta contra la pregunta archivada antes de aplicarla.** Cuando una ficha lleva varios estrechamientos, su enunciado original y su pregunta viva dejan de coincidir, y el cliente responde a la conversación, no a la ficha. | A-18, cuya respuesta cerraba una pregunta que la ficha no estaba haciendo |
| **C-35** | **"Cerrada por disolución del requisito" es un desenlace propio y se nombra así.** Una ficha cerrada *con respuesta* no se vuelve a mirar; una cerrada *por disolución* hay que volver a mirarla si vuelve el requisito. La reserva va en la ficha, en la spec y en el CI asociado. | A-18 · D-24 |
| **C-36** | **Un identificador que aparece una sola vez, y en `docs/_notas/`, no es vocabulario del proyecto.** Se traduce al canónico en vez de propagarlo. | «T1–T7», que sólo existía en el snapshot del 22-ago; las tandas reales son A–G |
| **C-37** | **Un criterio de aceptación se corre antes de escribirse** (RO-16). Los dos `grep` de P7-TAS se ejecutaron al redactarlos y quedaron con su baseline anotado —**1** y **7** hits—, en rojo a propósito. | §8 de `plan_ejecucion_UItasador_v1.3.md` |

### Efecto aguas abajo

**P7-TAS queda sin ambigüedades bloqueantes**, con la sección D redefinida. **En IF-02 no se
desbloquea ninguna tanda**: las cuatro respuestas de SLA habilitan §5.2.9 y ratifican los dos
catálogos. **Tanda F sigue bloqueada** por el patrón de disparo de `AT08_Alertas_SLA`.
