# 02 · Plan de ejecución de Fase 3 — ramas, lotes y versionado

**Fecha** — 25-jul-2026 · **Estado** — pendiente de autorización (Checkpoint #3)
**Base** — fichas de brecha de Fase 1 + decisiones de Checkpoints #1 y #2

---

## 1. Estrategia de ramas — adaptada a lotes

El prompt §4.1 propone sub-ramas **por familia documental**. La decisión del Checkpoint #2
(*"lote SC05→SC08 primero"*) obliga a adaptarla: el primer lote es **transversal** — toca
8 archivos de 4 familias distintas con un cambio homogéneo.

Estrategia resultante: **rama base + sub-ramas por lote**, no por familia.

```
main
└── docs/sync-ifTasador-v193                     (rama base)
    ├── docs/sync-ifTasador-v193/lote0-versionado     ← habilitante · 4 copias + 4 SUPERSEDED
    ├── docs/sync-ifTasador-v193/lote1-sc05-sc08      ← transversal · 8 archivos
    ├── docs/sync-ifTasador-v193/lote2-spec-v194      ← familia A · 5 correcciones internas
    ├── docs/sync-ifTasador-v193/lote3-schema         ← familias D + H · 2 archivos
    ├── docs/sync-ifTasador-v193/lote4-blueprint-arq  ← familias E + C · 2 archivos
    └── docs/sync-ifTasador-v193/lote5-operativos     ← familias F + H · 4 archivos
```

Justificación del cambio frente al prompt: un lote homogéneo produce diffs revisables de un
vistazo (22 renombres idénticos), mientras que la partición por familia obligaría a repetir
el mismo cambio en cinco ramas distintas con riesgo de divergencia entre ellas.

**El nombre de la rama base se conserva** (`docs/sync-ifTasador-v193`) pese a que el
entregable sea v1.9.4: la rama nombra el *insumo* del sync, no su salida.

---

## 2. Los lotes

> **Consecuencia de orden derivada de D-A.** Cuatro documentos pasan a versión nueva y sus
> predecesores deben quedar **congelados** como SUPERSEDED. Si el lote 1 editara
> `Blueprint_v2_9`, `Capa_Datos_v2_6_4` y `Arquitectura_v2_8` en sitio, modificaría
> exactamente los archivos que deben permanecer intactos. Por eso se antepone un **lote 0**
> que ejecuta el bump de versión; todos los lotes posteriores trabajan sobre los archivos nuevos.

### Lote 0 · Bump de versión (habilitante · **antes que todo**)

Operación puramente mecánica: copiar y marcar. **Cero cambios de contenido.**

| Origen (queda congelado) | Copia nueva a editar |
|---|---|
| `VProperty_Especificacion_Proyecto_v1_9_3.md` | `VProperty_Especificacion_Proyecto_v1_9_4.md` |
| `VProperty_Blueprint_Interfaces_v2_9.md` | `VProperty_Blueprint_Interfaces_v2_10.md` |
| `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_5.md` |
| `Arquitectura_Enterprise_VProperty_v2_8.md` | `Arquitectura_Enterprise_VProperty_v2_9.md` |

Cada predecesor recibe en su header:

```
> **[SUPERSEDED]** Este documento fue reemplazado por `<nuevo>` el 25-jul-2026.
> Motivo: sincronización con §2 Interfaz Tasador del spec v1.9.3 (RF-TAS-01..10,
> TX_CoordinacionVisita, máquina de estados oficial).
> Se conserva por trazabilidad histórica (H_Documentacion).
```

Cada copia nueva recibe el header de sincronización de §3.

**Efecto sobre los greps de regresión:** los cuatro predecesores quedan marcados SUPERSEDED
y por tanto **excluidos** de §6.1, igual que `_archivo/` y los snapshots.

**Commit:** `docs(versionado): bump v1.9.4 · Blueprint v2.10 · Capa Datos v2.6.5 · Arquitectura v2.9 (D-A)`

---

### Lote 1 · SC05 → SC08 (transversal · **primero** por decisión C-5)

> Se aplica sobre los archivos **nuevos** del lote 0 para los tres canónicos versionados;
> `CLAUDE.md`, `README.md`, `diseno.md`, `construccion.md` y `schema-airtable.md` se editan
> en sitio porque no llevan versión en el nombre.

**22 ocurrencias en 8 archivos.** Cambio mecánico, homogéneo y de bajo riesgo.

| Archivo | Líneas | Familia |
|---|---|---|
| `docs/_md/VProperty_Blueprint_Interfaces_v2_9.md` | 525, 899, 986, 1829, 2229, 2258, 2577, 2660, 3627 | E |
| `docs/_md/VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | 5043, 6243 | D |
| `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md` | 3178, 3813 | C |
| `CLAUDE.md` | 64, 141, 166, 172, 173, 204, 214 | H |
| `README.md` | 22, 38 | H |
| `docs/diseno.md` | 28, 255, 264, 463, 520, 590 | H |
| `docs/construccion.md` | 73, 308, 335 | H |
| `docs/schema-airtable.md` | 37, 59, 119, 122 | H |

**Forma canónica del reemplazo** (nunca borrar la mención original):

> `SC08` *(ex-SC05 · renombrado en §2.11 del spec v1.9.3)*

En tablas donde el ancho de columna no admita la coletilla, usar `SC08 (ex-SC05)` y agregar
la nota completa una sola vez al pie del bloque.

**Dos cuidados especiales:**

1. `Arquitectura:3178` — el trigger `TX_Solicitudes.estado = visitada` **ya es correcto**.
   Renombrar sólo el escenario; **no tocar el trigger**.
2. `CLAUDE.md:214` — `MAKE_WEBHOOK_URL_SC05` es variable de entorno real, presente en `.env`
   y en Railway. Se documenta el renombre **con nota de transición** y se registra en
   `CODE_INCONSISTENCIES.md`. **No se toca ningún archivo de entorno ni de código.**

**Commit:** `docs(transversal): renombra SC05 → SC08 en 8 documentos (§2.11 spec v1.9.3)`

---

### Lote 2 · Spec v1.9.4 (familia A)

Produce `docs/_md/VProperty_Especificacion_Proyecto_v1_9_4.md` con **cinco correcciones
internas**, y marca v1.9.3 como SUPERSEDED.

| # | Ubicación en v1.9.3 | Corrección | Firma |
|---|---|---|---|
| 1 | §1.4 (601–632) · ficha RN-59 (635) · índice §13 (4409, 4511) | Excepción acotada a RN-59: `TX_ContactosVisita` editable en `asignada` cuando `coordinacion_vigente = rechazada` | EA + PM + DE |
| 2 | §4.2.1 (2319–2419) | Alta de `tipo_propiedad` `{nuevo, usado, ambos}` + corrección de la afirmación sobre la columna `cuándo` | DE + PM |
| 3 | §6.2 (2974) | `AT03_ejecutar_dag_formulas`: `estado=capturada` → **`estado=visitada`** | EA + DE |
| 4 | §1.3.2 (489–570) · §1.3.3 (570–579) | Lectura de `TX_CoordinacionVisita`: sub-bloque *Coordinación* en Datos + evento en Historial | UX + FE + PM |
| 5 | §2.8 (1707) | Cita `Origen de Datos del Informe v1.0 §3.3` → **v1.1 §3.3** (verificado, contrato intacto — C-9) | PM + EA |

**Más la nota al pie de §2.14** con el comando de recuperación de v1.9.2 (mitigación A-04).

**§2 no se toca.** Sus ocho filas de §2.14 ya están aplicadas.

**Commit:** `docs(spec): produce v1.9.4 con las 5 correcciones internas de §2.14 (RF-TAS-05, RF-TAS-06, AT03, RN-59)`

---

### Lote 3 · Schema — delta §2.12 (familias D + H)

El corazón del sync: todo lo que §2.12 declara y **no existe en ningún documento del repo**.

| Archivo | Contenido |
|---|---|
| `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | `TX_CoordinacionVisita` (11 campos + constraint blanda R-2) · 3 campos nuevos en `TX_Solicitudes` · `tipo_propiedad` en `D_TipoDocumento` · `devuelta` DEPRECATED en el enum · 2 plantillas en `C_Plantillas` · SC02/SC04/SC15 retirados · SC08/SC09 agregados · diagrama §10.4 |
| `docs/schema-airtable.md` | Las mismas altas, marcadas **"pendiente de creación · declarado en spec v1.9.3 §2.12 · no verificado en Airtable al 25-jul-2026"** |

**Regla innegociable de este lote:** jamás inventar un TABLE_ID ni un FIELD_ID. `CLAUDE.md`
obliga a derivar tipos TS desde `schema-airtable.md` y a preferir FIELD_ID sobre nombre; un ID
inventado se propagaría a código productivo.

**Cuidado con SC15 homónimo:** aparece con dos funciones distintas en la Capa de Datos —cruce
UF (3490, 5982, 6022, 6048, 6235) y backups nocturnos (6964, 7340)—. §2.11 sólo retira la
del UF. **No marcar en bloque.**

**Commit:** `docs(capa-datos): agrega TX_CoordinacionVisita y delta §2.12 (RF-TAS-02, RF-TAS-03, RF-TAS-06, RF-TAS-09)`

---

### Lote 4 · Blueprint + Arquitectura (familias E + C)

| Archivo | Contenido |
|---|---|
| `VProperty_Blueprint_Interfaces_v2_9.md` | **"Enviar visita" → "Calcular Tasación"** (554, 906, 1130, 2425) · **las 8 rutas de IF-03** (hoy hay cero) · `TX_CoordinacionVisita` en entradas/salidas · componentes reutilizados · hook sin coletilla de 3 intentos · lectura de coordinación en IF-02 · `devuelta` DEPRECATED (12 hits + 2 diagramas) · patrón grilla densa de comparables |
| `Arquitectura_Enterprise_VProperty_v2_8.md` | Máquina de estados (3749–3775) · 7 pantallas de IF-03 · `TX_CoordinacionVisita` en el inventario de entidades · SC04/SC15 retirados · narrativa de ejemplo (3807–3813) |

**Commit (uno por archivo):**
`docs(blueprint): documenta 7 pantallas IF-03 y renombra "Enviar visita" → "Calcular Tasación" (RF-TAS-01..10)`
`docs(arquitectura): alinea máquina de estados e IF-03 con §2.11 y §2.13 del spec v1.9.3`

---

### Lote 5 · Operativos y Motor (familias F + H)

| Archivo | Contenido |
|---|---|
| `docs/diseno.md` | Diagrama de estados: `[IF-03 Enviar visita]` → `[IF-03 Calcular Tasación]` (43) y `devuelta → asignada` → transición directa (57) · sección de coordinación · excepción RN-59 |
| `docs/construccion.md` | Lectura de `TX_CoordinacionVisita` · excepción RN-59 |
| `VProperty_Motor_Calculo_AT01_AT10_v2_6.md` | `devuelta` (303, 361) · canal único correo (578). **Editar en sitio, sin versión nueva** — recomendación EA de la ficha |
| `VProperty_Origen_Datos_Informe_v1.1.md` | SC15 retirado (1034). Nada más: la verificación de §3.3 confirmó el contrato |
| `CLAUDE.md` | Acotar la prohibición de SC13 a IF-02 · 3 campos nuevos de `TX_Solicitudes` |

**Commit:** `docs(operativos): sincroniza diseno, construccion, motor y origen-datos con §2 spec v1.9.3`

---

## 3. Convención de versionado por documento

| Documento | Tratamiento | Salida |
|---|---|---|
| `VProperty_Especificacion_Proyecto_v1_9_3.md` | Versión nueva + `[SUPERSEDED]` en el predecesor | **`…_v1_9_4.md`** |
| `VProperty_Blueprint_Interfaces_v2_9.md` | Versión nueva + `[SUPERSEDED]` (D-A ✅) | **`…_v2_10.md`** |
| `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | Versión nueva + `[SUPERSEDED]` (D-A ✅) | **`…_v2_6_5.md`** |
| `Arquitectura_Enterprise_VProperty_v2_8.md` | Versión nueva + `[SUPERSEDED]` (D-A ✅) | **`…_v2_9.md`** |
| `VProperty_Motor_Calculo_AT01_AT10_v2_6.md` | En sitio + changelog al pie (recomendación EA: 3 hits, ninguno estructural) | `v2_6` |
| `VProperty_Origen_Datos_Informe_v1.1.md` | En sitio + changelog al pie (1 hit) | `v1.1` |
| `CLAUDE.md`, `README.md`, `diseno.md`, `construccion.md`, `schema-airtable.md` | Sin versión en el nombre → en sitio + changelog al pie (§4.2 del prompt) | — |

**Header de sincronización** en todo documento modificado:

```
> **Versión sincronizada con** `VProperty_Especificacion_Proyecto_v1_9_3.md` §2 · 25-jul-2026 · commit <sha>
```

---

## 4. Verificación al cierre de cada lote

1. Diff completo publicado en el chat.
2. Confirmación explícita de las 10 reglas de oro §1.
3. Grep de regresión acotado al lote.
4. Fila en `SYNC_LOG.md`.
5. **Espera de aprobación antes del siguiente lote** (§5 del prompt).

---

## 5. Decisiones firmadas — Checkpoint #3 · 25-jul-2026

Las cuatro quedan resueltas conforme a la recomendación del equipo.

| # | Decisión | Resolución | Firma |
|---|---|---|---|
| **D-A** | Versionado de Blueprint, Capa de Datos y Arquitectura | ✅ **Versión nueva para los tres** — reciben cambios estructurales, no correcciones puntuales | EA |
| **D-B** | Métrica *"tasa de devolución = COUNT(devuelta)/total"* | ✅ **Marcar la inconsistencia, no recalcular.** Redefinir un KPI de negocio excede el mandato documental; se eleva a firma PM aparte | PM + QA |
| **D-C** | Literal `A_Eventos.visita_completada` (A-06) | ✅ **Se conserva.** Coherente con el estado destino `visitada`; cambiarlo rompería consultas históricas | DE + INT |
| **D-D** | ¿SC08/SC09 en el Motor de Cálculo v2.6? | ✅ **No entran.** El documento cubre AT01–AT10 (Airtable Automations); SC08/SC09 son escenarios Make y viven en el Blueprint | EA |

### Efecto de D-A sobre el versionado

| Documento | Salida | Predecesor |
|---|---|---|
| `VProperty_Especificacion_Proyecto_v1_9_3.md` | **`…_v1_9_4.md`** (nuevo) | v1.9.3 → `[SUPERSEDED]` |
| `VProperty_Blueprint_Interfaces_v2_9.md` | **`…_v2_10.md`** (nuevo) | v2.9 → `[SUPERSEDED]` |
| `VProperty_Diseno_Capa_Datos_Enterprise_v2_6_4.md` | **`…_v2_6_5.md`** (nuevo) | v2.6.4 → `[SUPERSEDED]` |
| `Arquitectura_Enterprise_VProperty_v2_8.md` | **`…_v2_9.md`** (nuevo) | v2.8 → `[SUPERSEDED]` |

⚠ **Colisión de nomenclatura a evitar.** La Arquitectura pasa a **v2.9**, que es el mismo
número que el Blueprint tiene *hoy* (`VProperty_Blueprint_Interfaces_v2_9.md`). Son documentos
distintos con numeraciones independientes, pero conviven en el mismo directorio. Los nombres
completos los distinguen sin ambigüedad (`Arquitectura_Enterprise_VProperty_v2_9.md` vs
`VProperty_Blueprint_Interfaces_v2_9.md`); aun así, toda cita en prosa debe incluir el nombre
del documento, nunca sólo "v2.9".

### Efecto de D-B sobre los lotes 3 y 4

En `Blueprint:3943` y `Arquitectura:4407` **no se toca la fórmula**. Se agrega junto a ella:

> ⚠ *Métrica pendiente de redefinición: `devuelta` deja de poblarse tras §2.11 del spec v1.9.3
> (el visador devuelve con transición directa `pdf_listo → asignada`). Requiere firma PM.*

Se registra además en `CODE_INCONSISTENCIES.md` como inconsistencia de negocio, no de código.
