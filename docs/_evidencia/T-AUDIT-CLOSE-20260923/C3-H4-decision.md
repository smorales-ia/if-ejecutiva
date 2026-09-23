# C3 · H4 — Gating de la sección H · Rentabilidad por `tipo_informe`

> T-AUDIT-CLOSE-20260923 · paso C3. Decisión tomada por Sergio el 23-09-2026
> (Opción 1 del AskUserQuestion, tras quedar sin responder la Q2 del OK-Gate §12).

## Mecanismo elegido: flag en `M_TiposInforme`

**Checkbox `requiere_rentabilidad` en `M_TiposInforme` (`tblOcsdiwxQLfD178`).**
La regla vive en Airtable y la UI sólo la proyecta y obedece — cero valores de
negocio en código (principio rector CLAUDE.md: «la UI muestra y captura; nunca
decide», mismo criterio A-17 que `MotivoNoContacto`: marcar/desmarcar un tipo
llega a la UI sin deploy).

**Por qué no las alternativas:**
- *Constante en `lib/tasador`*: metería la lista de tipos en código (regla de
  negocio en UI) y exigía responder Q2 ahora.
- *Espejo del motor (`C_ReglasNegocio.formulas_resultado` de la regla aplicada)*:
  idéntico al motor pero depende de que `regla_aplicada` esté resuelta al
  momento de captura, lo que no está garantizado.

## Campo creado

| Tabla | Campo | Tipo | Estado |
|---|---|---|---|
| `M_TiposInforme` (`tblOcsdiwxQLfD178`) | `requiere_rentabilidad` | checkbox | ⚠ PENDIENTE de creación vía MCP (OAuth en curso al escribir esto — ver cierre) |

**Sin poblar por instrucción explícita**: Sergio marca los tipos manualmente
según el catálogo real. Ningún registro se tocó.

## Cómo lo lee la UI (cadena completa)

1. `lib/tasador/lectura-tasacion.ts` · `mapaRequiereRentabilidad()`: lee
   `M_TiposInforme.requiere_rentabilidad` (todas las filas, sin filtro `activo`),
   caché 5 min, y lo expone en `MaestrosTasacion.requiereRentabilidad`
   (`ReadonlyMap<recordId, boolean> | null`). **No reusa `fetchCatalogos()`**:
   `lib/catalogos.ts` es territorio IF-02 (§8 NO-TOCAR).
2. `proyectarTasacion()` resuelve el Link `TX_Solicitudes.tipo_informe` con
   `resolverFlagRentabilidad()` (`lib/tasador/rentabilidad.ts`) →
   `Tasacion.requiereRentabilidad: boolean | null`.
3. `components/tasador/tasacion-form.tsx` consume dos predicados puros:
   - `seccionRentabilidadVisible(flag)` → renderiza o no la sección H.
   - `rentabilidadObligatoria(flag)` → mete `arriendoBrutoClp`/`gastoAnualClp`
     a `faltantes` (bloquean "Calcular"), quita "(opcional)" del título y suma
     2 al denominador del progreso.

## Semántica (confirmada por Sergio)

| Flag | Sección H | Arriendo/gasto |
|---|---|---|
| `true` (checkbox marcado) | visible · título "Rentabilidad" | **obligatorios** (entran a `faltantes`) |
| `false` (checkbox desmarcado) | **oculta** | no aplican |
| `null` (dato no disponible) | visible · "Rentabilidad (opcional)" | opcionales — **fail-safe = comportamiento pre-C3** |

`null` cubre: solicitud sin `tipo_informe` vinculado · maestro ilegible (p. ej.
el campo aún no existe en la base → 422 en `listRecords` → catch) · recordId
fuera del mapa. La degradación de `leerMaestros` es `null`, **no** mapa vacío:
un mapa vacío significaría «ningún tipo la exige» y ocultaría la sección para
todos por un error de lectura.

## ⚠ Implicación de orden de deploy

Un checkbox de Airtable no distingue «false» de «vacío»: desmarcado = `false` =
sección oculta. Como **ningún registro quedará marcado** hasta que Sergio pueble
el catálogo, al desplegar este código con el campo ya creado la sección H se
ocultará para **todos** los tipos. Orden recomendado: **poblar los flags de los
tipos que exigen rentabilidad ANTES de mergear/desplegar** (o inmediatamente
después). Mientras el campo no exista, rige el fail-safe y nada cambia.

## Tests

`lib/tasador/rentabilidad.test.ts` — S-H4-01 (true → visible+obligatoria),
S-H4-02 (false → oculta), S-H4-03 (null → fail-safe pre-C3) + 4 casos de
`resolverFlagRentabilidad`. Suite completa tras C3: **917/917 verde · 52
archivos · `tsc --noEmit` limpio** (23-09-2026 16:57).

## Archivos tocados (todos territorio IF-03, §8 respetado)

- `lib/tasador/rentabilidad.ts` (nuevo · predicados puros client-safe)
- `lib/tasador/rentabilidad.test.ts` (nuevo)
- `lib/tasador/tasaciones.ts` (`Tasacion.requiereRentabilidad?`)
- `lib/tasador/lectura-tasacion.ts` (mapa + maestros + proyección)
- `components/tasador/tasacion-form.tsx` (sección H gated + faltantes + progreso)
