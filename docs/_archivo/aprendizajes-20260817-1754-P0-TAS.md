# Aprendizajes · P0-TAS — Inventario del repo Tasador + deduplicación de `components/tasador/ui/`

| | |
|---|---|
| **Tanda** | P0-TAS · Inventario del repo Tasador |
| **Fecha** | 2026-08-17 · cierre 17:54 (-04) |
| **Rama** | `feat/tasador-ui` |
| **Plan maestro** | `docs/_md/plan_ejecucion_UItasador_v1.0.md` |
| **Contrato aplicado** | 🟡 pausa-en-comandos destructivos (alcance corregido por Sergio, no el 🟢 del plan) |
| **Sesión** | Retomada tras corte por contexto. Estado previo en `docs/_notas/snapshot-P0-TAS-en-curso.md` (borrado al cerrar) |

---

## 1 · Qué se construyó

**Alcance ejecutado, en el orden (a)→(f) que fijó Sergio:**

| Paso | Qué | Resultado |
|---|---|---|
| **(a)** | Inventario completo según §1.2 del plan | `docs/_notas/inventario-tasador.md` · 12 secciones |
| **(b)** | Borrar los 9 duplicados exactos de `components/tasador/ui/` | 9 archivos · 19,6 KB liberados |
| **(c)** | Reescribir los imports mal-prefijados | 23 líneas en 12 archivos |
| **(d)** | Mover los 4 primitivos huérfanos a `components/ui/` | 4 renames · `components/ui/` 22 → 26 |
| **(e)** | Conservar los 4 superset con nota | §8 del inventario, con el riesgo de código muerto declarado |
| **(f)** | Documentar los módulos faltantes como deuda | §9 del inventario · **5** deudas, no 4 |

**Criterio de aceptación revisado — CUMPLIDO.** «`pnpm build` sigue igual de rojo, con la lista de
imports irresolubles reducida sólo por los mal-prefijados que P0-TAS sí arregla»:

| Métrica | Antes | Después |
|---|---|---|
| Errores `tsc` totales | 137 | **102** |
| Líneas `TS2307` | 61 | **34** |
| Módulos distintos irresolubles | 28 | **4** |

Los 4 restantes son exactamente el grupo C (`@/lib/tasaciones`, `@/hooks/use-estado-tasador`,
`@/lib/tasador-store`, `@/lib/factores-default`). El verde queda comprometido para **P2-TAS**.

**Bifurcación §1.1 resuelta: CASO A.** El v0 del Tasador está en el repo (`b70117a`). Cierra el
Riesgo #1 de §17 del plan.

---

## 2 · Decisiones técnicas

**Reescritura de imports con lookahead negativo, no con lista enumerada.**
```bash
perl -pi -e 's{\@/components/(?!ui/|console/|tasador/)}{\@/components/tasador/}g'
```
Enumerar los 20 módulos a mano habría dejado fuera cualquiera que el `grep` inicial no viera. El
lookahead expresa la regla real —«todo lo que no sea `ui/`, `console/` ni ya-prefijado»— y por eso
el conteo previo/posterior (23 → 0) es una verificación, no una coincidencia.

**`git mv` en vez de `cp` + `rm` para el paso (d).** Git registró los 4 como renames (`R`), lo que
preserva el historial del archivo y hace evidente en el diff que es un movimiento, no un alta
paralela a un borrado.

**Guards antes de cada comando destructivo, no confianza en el análisis previo.** Antes de (b) se
re-corrió `diff -q` archivo por archivo (9/9 idénticos) y el conteo de consumidores (0). Antes de
(d) se re-verificó que los 4 nombres siguieran libres en `components/ui/`. Ambos guards eran
redundantes con el snapshot; ninguno costó más de un segundo.

---

## 3 · Overrides aplicados (rutas reales vs plan)

13 overrides en §10 del inventario. Los que cambian trabajo de tandas futuras:

- **OV-8 · `lib/airtable-client.ts` ya exporta `createRecord` (`:175`) y `listRecords` (`:48`).**
  §0.2-bis y §0.4·nota 3 del plan dicen que faltan y que P2-TAS debe extenderlo. **P2-TAS no tiene
  que tocarlo.** Esto además elimina el riesgo R5-E secundario que la nota 3 anticipaba y hace
  innecesario el envoltorio `lib/tasador/airtable-writes.ts`.
- **OV-3 · R5-E refutada.** `components/tasador/expediente-sheet.tsx` (242 l.) cumple RF-TAS-10 sin
  tocar `components/console/**`. §0.2-bis y §10.1 del plan quedan desactualizados.
- **OV-9 · `hooks/` no existe como directorio raíz** y R5 no lo autoriza. IF-02 pone sus hooks como
  `lib/use-*.ts`. Recomendación para P2-TAS: `lib/tasador/use-estado-tasador.ts`, que respeta R5 sin
  pedir excepción.
- **OV-4 · conflicto de ruta de los tipos.** El plan los sitúa en `lib/tasador/types.ts`; el v0 los
  importa de `@/lib/tasaciones` (26 líneas, 18 archivos). Recomendación: reescribir los imports en
  P1-TAS, no crear un re-export.
- **OV-5 · `components/ui/` recibió 4 archivos** y R5 no la nombra como territorio autorizado.
  Autorizada por Sergio caso a caso.

---

## 4 · Bugs y su resolución

**Tres errores del análisis de la sesión anterior, corregidos con evidencia.**

**4.1 · El grupo A eran 20 módulos, no 19.** El snapshot listó las 23 líneas correctamente pero
contó 19 rutas distintas, y su propio total no cerraba: `19+4+4=27≠28`. El `uniq -c` sobre la salida
de `tsc` da exactamente 28 módulos, de los cuales 4 son `ui/` y 4 son grupo C → 20.

**4.2 · `tipoDocumentoLabel` no existe.** El snapshot §3.9 daba por verificado que
`expediente-sheet.tsx:11` «ya reutiliza lib de IF-02». `lib/tipos-documento.ts` exporta
`CondicionPropiedad`, `TipoDocumento`, `getTiposDocumento` y `_resetCacheTiposDocumento` — **no**
`tipoDocumentoLabel`. Es un `TS2724` real y una **quinta deuda** que nadie había registrado. Como el
módulo es de IF-02, agregarle el export está prohibido por R5: la salida es resolver la etiqueta del
lado del Tasador con `getTiposDocumento()`.

**Causa raíz de 4.1 y 4.2:** el snapshot documentaba `grep` de encabezado (que el símbolo se
importa) como si fueran verificación de contrato (que el símbolo se exporta). Un `grep` del lado
consumidor no prueba nada del lado proveedor.

**4.3 · Las 8 secciones del formulario ya están las ocho.** Este mismo inventario afirmó en su
primera redacción que faltaban la E y la H, por contar los 6 archivos de `form-sections/`. Leer el
render de `tasacion-form.tsx:263-377` mostró que **A · Visita** y **H · Rentabilidad** están inline,
y que los 6 archivos cubren **B–G** — además con el mapeo de letras distinto al que la inferencia
por nombre sugería (`seccion-edificacion` es **E**, no B). Se corrigió antes de cerrar la tanda.

**Hallazgo asociado (OV-13):** `coordinar-visita.tsx:96` declara `const [fechaVisita, …]`, un
identificador que **Regla T-B llama literalmente un bug**. Semánticamente no hay colapso de campos
—la etiqueta dice "Fecha planificada de visita"—, así que es violación de nomenclatura, no de
modelo. P4-TAS lo renombra. El formulario de captura sí respeta T-B correctamente
(`fechaPlanificadaVisita` / `fechaVisitaReal`, con la real validada como obligatoria en `:89`).

---

## 5 · Deuda técnica para tandas siguientes

Detalle completo en §9 del inventario. Resumen:

| # | Módulo ausente | Consumidores | Destino |
|---|---|---|---|
| 1 | `@/hooks/use-estado-tasador` | 4 | P2-TAS · ubicación por **OV-9** |
| 2 | `@/lib/tasaciones` — **27 símbolos** | 26 líneas / 18 archivos | P1-TAS (tipos) + P2-TAS (datos) |
| 3 | `@/lib/tasador-store` | 3 | P1-TAS (mínimo) → P7-TAS |
| 4 | `@/lib/factores-default` | 1 | P2-TAS (ruta) + P7-TAS · **OV-6** |
| 5 | `tipoDocumentoLabel` | 1 | P9-TAS · **OV-10** — nueva |

**Residuos a purgar en P7-TAS:** `intentos-indicator.tsx` completo + `tasacion-form.tsx:27,192` +
`intentosEnvio` de `:51` (CI-015 · **no** confundir con `bloqueadoCalculo`, que es legítimo por
RF-TAS-07); y `seccion-documentos.tsx:20` («Prellenado por IA … (SC07)»), **única** ocurrencia de
lenguaje de IA en todo el territorio IF-03.

**Cuatro `TS2322` de tipado real** que sobreviven a la creación de los módulos: dos por la firma de
`onValueChange` de `@base-ui/react` Select (`coordinar-visita.tsx:441`, `fields.tsx:211`) y dos por
`key: symbol` (`seccion-edificacion.tsx:219,293`). El del Select es huella de origen Radix en el
diseño v0, aunque el repo no tenga la dependencia.

**Código muerto conservado:** los 4 superset de `components/tasador/ui/` tienen cero consumidores y
son versiones más pobres que las de IF-02. Mitigación sugerida para una tanda futura: borrarlos, o
sustituir cada uno por un `export * from "@/components/ui/<x>"`.

---

## 6 · Reglas nuevas que deberían migrar a `docs/aprendizajes.md`

**→ MIGRAR · `grep` del consumidor no prueba el contrato del proveedor.** Registrar que un símbolo
se importa no verifica que se exporte. Para dar por bueno un reuso, el `grep` va contra el módulo
que **provee** (`grep -n "^export" lib/x.ts`), no contra el que consume. Dos de los tres errores
corregidos en esta tanda (§4.1, §4.2) vienen de esa confusión, y el segundo había sido marcado con
✅ en el análisis previo.

**→ MIGRAR · el árbol de archivos no es el mapa de la funcionalidad.** Contar archivos en un
directorio para concluir cuántas unidades funcionales hay falla cuando algunas viven inline. La
verificación de una regla como CI-014 («ocho secciones») se hace sobre el **render**, no sobre `ls`.
Esta tanda incurrió en el error y lo corrigió antes de cerrar (§4.3).

**→ MIGRAR · guards redundantes antes de comandos destructivos.** Re-verificar la precondición
inmediatamente antes de `rm`/`mv` cuesta segundos y es independiente de cuán confiable sea el
análisis que la estableció. En esta tanda ambos guards confirmaron el análisis previo; el valor está
en que habrían parado la ejecución si no lo hubieran hecho.

---

## 7 · Bloques obligatorios de §14.2

### 7.1 · Ambigüedades e inconsistencias declaradas

Ninguna decidida por criterio propio. Estado de las que tocan a P0-TAS:

- **CI-015 · CONFIRMADA con dos residuos exactos.** Detectados y documentados; **no purgados** —
  corresponde a P7-TAS. Sergio decidió expresamente reescribir el prefijo de
  `tasacion-form.tsx:27` en vez de purgarlo aquí, para no exceder el alcance (b)–(f). Reescribirlo
  no consolida nada ejecutable: `intentos-indicator.tsx` importa `MAX_INTENTOS` del grupo C y sigue
  roto.
- **CI-020 · RESPETADA por el v0.** Siete rutas, la raíz `[id]/` es el formulario; no existen
  `[id]/captura/` ni `[id]/calculo/`.
- **CI-014 · verificada y matizada.** Ver §4.3 y OV-12.
- **CI-012, A-12 a A-17, P-5, CI-013, CI-016 a CI-019, CI-021** — fuera del alcance de esta tanda.
  Documentadas en §2 y §10 del inventario contra la tanda que las declara. Ninguna se anticipó.

### 7.2 · Verificación de la frontera R5

```bash
git diff --stat HEAD -- components/console app/api/solicitudes "app/(ejecutiva)" \
  lib app/globals.css package.json
→ (vacío)
```

**Ningún archivo de IF-02 fue modificado.**

⚠ **La verificación honesta incluye `components/ui/`**, que R5 no nombra y que por tanto **no
aparecería** en el comando de arriba aunque se hubiera roto algo. Los 4 archivos del paso (d) son
**altas** (`git status` los muestra como `R`, rename); los 22 archivos preexistentes de
`components/ui/` están intactos. La alta fue autorizada explícitamente por Sergio antes de
ejecutarse (**OV-5**).

---

## 8 · Archivos tocados

| Acción | Archivo |
|---|---|
| **D** ×9 | `components/tasador/ui/{badge,input,label,progress,select,separator,tabs,textarea,tooltip}.tsx` |
| **R** ×4 | `components/tasador/ui/{card,collapsible,radio-group,switch}.tsx` → `components/ui/` |
| **M** ×12 | `app/tasaciones/page.tsx` · `app/tasaciones/[id]/{,coordinar/,estado/,fotos/,informe/,lectura/}page.tsx` · `components/tasador/{app-header,fotos-categorizadas,fotos-screen,informe-preview,tasacion-form}.tsx` — **sólo líneas de import** |
| **A** | `docs/_notas/inventario-tasador.md` |
| **A** | `docs/_archivo/aprendizajes-20260817-1754-P0-TAS.md` (este archivo) |
| **D** | `docs/_notas/snapshot-P0-TAS-en-curso.md` (estado intermedio, ya consumido) |

---

## 9 · Siguiente tanda

**P0.5-TAS · Schema Airtable IF-03** · modo `default` · contrato 🔴 **pausa-total** para toda
escritura de schema.

⚠ **Primera acción obligatoria: la compuerta CI-012.** Crear `TX_CoordinacionVisita` materializa la
opción (a) de una decisión de negocio abierta (consulta a Héctor/Óscar del 11-ago-2026). No se
ejecuta ningún `create_table` sin confirmación explícita de Sergio.

⚠ **El build sigue rojo (102 errores).** §0.7·paso 7 del plan exige verde antes de arrancar tanda;
por decisión de Sergio el verde se difiere a **P2-TAS**. P0.5-TAS no toca código, así que el rojo no
la bloquea.
