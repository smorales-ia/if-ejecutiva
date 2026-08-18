# Aprendizajes · P1-TAS — Types TypeScript

| | |
|---|---|
| **Tanda** | P1-TAS · Types TypeScript |
| **Fecha** | 2026-08-17 · cierre 22:05 (-04) |
| **Rama** | `feat/tasador-ui` |
| **Contrato aplicado** | 🟢 libre |
| **Decisiones previas de Sergio** | (1) §3.1 · **no tipar coordinación**, limpiar después. (2) **OV-4 resuelto a favor de `@/lib/tasaciones`**, no `lib/tasador/types.ts`. (3) Aval explícito para arrancar con el build rojo. (4) Borrar `snapshot-P0.5-TAS-en-curso.md` y commitear el borrado junto con esta tanda. |

---

## 1 · Qué se construyó

Cuatro módulos, **cero cambios en código existente**:

| Archivo | Contenido |
|---|---|
| `lib/tasaciones.ts` | 14 tipos de dominio + 4 catálogos (`CATEGORIAS_FOTO`, `RECINTOS_SUGERIDOS`, `OPCIONES`, `Opcion`) |
| `lib/tasador/field-ids.ts` | `TABLE_IDS` + 4 mapas de FIELD_ID congelados con `Object.freeze` |
| `lib/tasador/mock-user.ts` | `getUsuarioTasador()` · `mockTasadorConfigurado()` |
| `lib/tasador/tipo-propiedad.ts` | Paliativo P-5: normalización de género masculino ↔ femenino |

**Efecto en el build:** `pnpm tsc --noEmit` pasa de **102 a 41 errores** (−61). Ninguno de los 41
está en los archivos nuevos.

---

## 2 · Decisiones técnicas

### 2.1 · Las formas se derivaron del código, no del plan

El plan §2.1 propone ~6 interfaces. La superficie real que el v0 exige son **27 símbolos**
(inventario §Deuda 2). Se leyeron los 18 consumidores uno por uno —`tasacion-form.tsx`,
`informe-preview.tsx`, las seis `form-sections/`, `fotos-*.tsx`, `expediente-sheet.tsx`— y
`InformeData` salió con **68 campos**, no con los que el plan enumera. Un tipo derivado del plan
habría compilado contra nada.

### 2.2 · `NivelHabitaciones` como interface, no como `Record<string, number>`

`seccion-edificacion.tsx` hace `key={c.key}` sobre `keyof NivelHabitaciones`. Con un índice
genérico, `keyof` incluye `symbol`, que no es una `React.Key` válida — ése era exactamente el
**TS2322 de las líneas 219 y 293** que el inventario §9 listaba como "hallazgo colateral a resolver
en P7-TAS". Declarar las diez claves explícitamente lo cierra sin tocar el componente. **P7-TAS ya
no tiene que resolverlo.**

### 2.3 · `ContactoVisita` se importa de IF-02, no se redefine

Colisión real detectada al verificar el criterio "ningún tipo duplica uno de `lib/console-data.ts`":
IF-02 ya tipa `ContactoVisita` (`lib/console-data.ts:56`) sobre la misma tabla
`TX_ContactosVisita` (`tblW3SSbKo6vRjwBJ`). Se importa y se re-exporta (R7), en vez de crear una
segunda forma para una sola fila de Airtable.

**Coste asumido, medido:** el campo se llama `ordenPrioridad`, no `prioridad`, y
`coordinar-visita.tsx:91` ordena por `prioridad`. Eso sumó **+2 errores** en ese archivo (11 → 13).
Se aceptó a conciencia: `coordinar-visita.tsx` es huérfano por CI-012 y la alternativa era duplicar
un tipo para acomodar un archivo que se va.

`Unidad`/`UnidadSii` y `Adjunto`/`AdjuntoDropbox` **no** son colisiones: nombres distintos y formas
distintas (la de IF-02 es la de edición del formulario; la de IF-03 es una proyección de lectura
del informe).

### 2.4 · Ningún FIELD_ID inventado — y los que faltan quedan declarados

Los 32 `fld…` y los 17 `tbl…` de `lib/tasador/field-ids.ts` se verificaron **programáticamente**
contra `docs/schema-airtable.md`:

```bash
grep -ohE "fld[A-Za-z0-9]{14}" lib/tasador/*.ts | sort -u > /tmp/used.txt
grep -oE  "fld[A-Za-z0-9]{14}" docs/schema-airtable.md | sort -u > /tmp/schema.txt
comm -23 /tmp/used.txt /tmp/schema.txt      # → vacío
```

`docs/schema-airtable.md` §2 documenta con `—` el FIELD_ID de campos que IF-03 necesita
(`direccion`, `rol_sii`, `comuna`, `producto`, `tasador`, `pdf_final_url`, `cliente_final_*`). **No
se inventó ninguno**: van en `FIELD_IDS_PENDIENTES` como lista explícita. → **P2-TAS los resuelve
contra el schema real antes de la primera lectura, y actualiza §2 del schema doc en el mismo
movimiento.**

### 2.5 · `mockUserTasador` sin recordId inventado

No hay ningún recordId de `M_Tasadores` documentado en el repo, y P1-TAS no consulta producción.
El módulo lo lee de `process.env.TASADOR_MOCK_RECORD_ID`; sin esa variable devuelve `''` y
`mockTasadorConfigurado()` devuelve `false`. **Fallar visible es preferible a un ID inventado que
apunte a un tasador ajeno.**

→ **Acción para Sergio antes de P2-TAS:** definir `TASADOR_MOCK_RECORD_ID` en `.env.local` con el
recordId de un tasador real. No se tocó `.env.example` porque el criterio de aceptación de la tanda
acota el diff a `lib/tasador/`, `lib/tasaciones.ts` y `docs/`.

### 2.6 · Los mínimos de fotos: A-16 con el punto de cambio aislado

`CATEGORIAS_FOTO` reproduce las ocho categorías de la spec §2.6 con `min` como
`number | 'dorm' | 'banos' | 'estac'`. La traducción a número la hará `resolverLimite()` en
P2-TAS: **ése es el único punto de cambio** si A-16 se resuelve a favor de mínimos fijos.

`max` es `null` en las ocho — la spec no declara ningún máximo y no se inventó uno. Consecuencia
visible: el rótulo "(máx N)" de `fotos-categorizadas.tsx` no aparecerá y "Agregar" nunca se
deshabilitará por tope. Es correcto respecto de la spec; si el negocio quiere topes, se declaran ahí.

---

## 3 · Overrides al plan (rutas y criterios reales vs plan)

| # | Plan dice | Realidad aplicada | Motivo |
|---|---|---|---|
| **OV-4** | Tipos en `lib/tasador/types.ts` | Tipos en **`lib/tasaciones.ts`** | Decisión de Sergio. Es la ruta que el v0 ya importa; evita el Riesgo 4 (dos rutas para lo mismo) sin reescribir 26 imports |
| **R5** | IF-03 escribe sólo bajo `app/tasaciones/**`, `app/api/tasaciones/**`, `components/tasador/**`, `lib/tasador/**` | Se añade **`lib/tasaciones.ts`** al territorio | Consecuencia directa de OV-4. Es archivo **nuevo**: no se modificó nada de IF-02, así que la prohibición de fondo de R5 sigue intacta. **→ MIGRAR: R5 necesita enmienda textual** (el inventario §11 · Riesgo 5 ya lo pedía por otra vía) |
| **§2.3** | «`AccionCard` es una unión discriminada» | **No se creó** | Sus tres variantes (`coordinar` / `abrir` / `esperando_ejecutiva`) son el gate de coordinación. Con CI-012 cerrado, T-A colapsa a un solo botón: el tipo codificaría una regla muerta y nadie lo importa. **Criterio superado por decisión de negocio, no omitido** |
| **§2.1** | `CoordinacionVisita`, `EstadoCoordinacion`, `MotivoNoContacto`, `intentoNumero` | **No se tiparon** | Decisión de Sergio · §3.1 opción 1 |
| **§2.1** | `SlaEtapaTasador` | Se tipó como **`SlaStatus` + `horasRestantes?`** | Es lo que el v0 consume (`tasacion-card.tsx:17,20`). Sigue sin aritmética propia: el valor viene del motor (CI-021) |

---

## 4 · Lo que se dejó a propósito sin cerrar

**Los 41 errores restantes son todos deuda ya inventariada**, ninguno nuevo:

| Cuántos | Qué | Destino |
|---|---|---|
| 13 | `coordinar-visita.tsx` — huérfano de CI-012 (incluye los 3 símbolos de coordinación no creados) | Se borra o se deja inerte · decisión de Sergio pendiente |
| 12 | Las 8 funciones de `@/lib/tasaciones` (`getTasacion` ×6, `TASACIONES`, `marcarVisitada`, `marcarPdfListo`, `guardarObservacionRechazo`, `resolverInforme`, `resolverLimite`) | **P2-TAS** |
| 8 | `@/hooks/use-estado-tasador` · `@/lib/tasador-store` · `@/lib/factores-default` | **P2-TAS** (con OV-9: van a `lib/tasador/`, no a `hooks/`) |
| 5 | `tipoDocumentoLabel` / `documentosPara` en `@/lib/tipos-documento` | **OV-10** · P5-TAS y P9-TAS |
| 2 | `onValueChange` de `@base-ui/react` emite `string \| null` (`fields.tsx:211`, `coordinar-visita.tsx:441`) | **P7-TAS** — síntoma de origen Radix en el diseño v0 |
| 1 | `intentos-indicator.tsx` — residuo CI-015 | **P7-TAS** lo borra entero |

**Dominios de `OPCIONES` sin respaldo en el schema doc.** `estadoConservacion` sí reproduce el
dominio real de `TX_Solicitudes.estado_conservacion` (`flde0ExWfB1dhkp4t`, §21.2). Los demás salen
del v0 porque `docs/schema-airtable.md` **no documenta a nivel de campo** ni
`TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`) ni `TX_Comparables` (`tbllbTuhb0waWIbRo`).
→ **P2-TAS debe contrastarlos antes de escribir.** El caso concreto: `origenSuperficie` usa
`plano-municipal` en el v0, mientras su homónimo de `TX_Unidades` usa `plano`,
`certificado_avaluo`, `medicion_tasador`. Si son el mismo dominio, `nuevoItem()` en
`seccion-valoracion.tsx:16` está escribiendo un valor que Airtable rechazará.

**`FuenteDato` es una asunción.** `'solicitud' | 'documentos' | 'visita'` — la spec no fija este
dominio; se derivó de los tres orígenes que la UI distingue. Confirmar en P7-TAS. Cumple Regla T-C:
ningún valor nombra el medio técnico.

---

## 5 · Deuda que hereda P2-TAS

1. Resolver los 9 FIELD_IDs de `FIELD_IDS_PENDIENTES` contra el schema real.
2. Definir `TASADOR_MOCK_RECORD_ID` (bloquea la primera lectura).
3. Contrastar los dominios de `OPCIONES` contra `TX_ItemsCuadroValoracion` y `TX_Comparables`.
4. **OV-9**: `use-estado-tasador` va a `lib/tasador/use-estado-tasador.ts`, no a `hooks/`.
5. **OV-8**: `createRecord` y `listRecords` **ya existen** en `lib/airtable-client.ts` — no
   extenderlo ni instalar el SDK.
6. `resolverLimite()` es el punto de cambio de A-16.

Sigue abierto de tandas anteriores: `TX_Amenities` no existe y `Comodidades` no tiene tabla destino
(**P7-TAS**); P-5 sólo tiene paliativo, la corrección real es alinear el dominio en Airtable;
`C_Plantillas` vs `C_NotificacionesConfig` sin resolver.

---

## 6 · Reglas nuevas

**→ MIGRAR a `docs/aprendizajes.md`:**

> **Al tipar contra un repo v0 heredado, la fuente de verdad de las formas es el consumidor, no el
> plan.** El plan enumera lo que el autor imaginó; el `grep` de accesos a campo enumera lo que el
> código exige. En P1-TAS la diferencia fue de ~6 interfaces contra 27 símbolos y 68 campos en
> `InformeData`. Procedimiento: `grep -rhoE "\b(form|tasacion)\.[a-zA-Z0-9_]+" | sort -u` antes de
> escribir la primera línea del tipo.

> **Un tipo derivado de Airtable se verifica con `comm`, no con la vista.** Extraer los `fld…` del
> código y los del schema doc a dos archivos ordenados y restarlos con `comm -23` convierte
> "ningún FIELD_ID inventado" de promesa en aserción reproducible. Aplica igual a los `tbl…`.

> **`Record<string, T>` en un tipo cuyas claves se usan como `React.Key` es un bug latente.**
> `keyof Record<string, T>` incluye `symbol`. Si las claves son conocidas y finitas, va interface
> con claves explícitas.
