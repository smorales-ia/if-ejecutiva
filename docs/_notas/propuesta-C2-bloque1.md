# Propuesta — C2 · Bloque 1 · Lectura server-side de `TX_CoordinacionVisita`

Fecha: 2026-08-21
Branch: `feat/coordinacion-ejecutiva`
Estado: 🟡 **PROPUESTA — pendiente de aprobación. Cero writes de código/schema.**
Fuente de diseño: `docs/_notas/plan-frente-C.md` (enfoque server-side). Schema verificado vía MCP hoy.

Seed de validación confirmada vía MCP (lectura): fila `recE7iW1JvR6ynIig` en `TX_CoordinacionVisita`
(`tblBwMErRxo57ML2r`) — filtro por `solicitud_record_id` = `["rec9qf3DchOY5Lk2N"]`,
`estado_coordinacion`=`confirmada`, `fecha_respuesta`=`2026-08-21T17:00:00.000Z`,
`fecha_visita_propuesta`=`2026-08-25`, `nota` poblada, sin `motivo`/`detalle` → rama confirmada.

---

## a. Ruta del Route Handler

`app/api/solicitudes/[id]/coordinacion/route.ts` — **GET**.

Vive bajo `app/api/solicitudes/**` (superficie IF-02), junto a los hermanos `eventos/`, `sla/`,
`decision-motor/`. **No** bajo `app/api/tasaciones/**` (eso es IF-03, escritura del tasador).

## b. Firma de entrada y forma de la respuesta

- **Entrada:** path param `id` = **record id de la solicitud** (`rec…`). Sin query params. El filtro de
  la tabla es el lookup `solicitud_record_id`, que devuelve record ids — por eso `id` es record id, no
  `codigo`. Ver DUDA-2.
- **Respuesta JSON** (200):

```jsonc
{
  "coordinacionVigente": "confirmada",   // EstadoCoordinacion | null
  "intentos": [                          // ordenados por fecha_respuesta DESC
    {
      "id": "recE7iW1JvR6ynIig",
      "solicitudId": "rec9qf3DchOY5Lk2N",
      "estado": "confirmada",
      "intentoNumero": 1,
      "fechaRespuesta": "2026-08-21T17:00:00.000Z",
      "fechaVisita": "2026-08-25",       // solo rama confirmada
      "nota": "Seed FRENTE-C…"           // opcional confirmada
      // "motivo","detalle" → solo rama rechazada
    }
  ]
}
```

- `coordinacionVigente = intentos[0]?.estado ?? null`.
- **0 filas → `{ coordinacionVigente: null, intentos: [] }`** (RO-34: ausencia ≠ neutro, no se inventa
  desenlace).
- Reutiliza los tipos ya existentes de P4-TAS: `CoordinacionVisita` y `EstadoCoordinacion` de
  `lib/tasaciones.ts` (import type, sin duplicar).

## c. field_ids que consume (de `lib/tasador/field-ids.ts`)

`TABLE_IDS.coordinacionVisita` ya está mapeada. **Faltan los FIELD_IDs de la tabla** → agregar un bloque
nuevo (verificados contra el schema real vía MCP hoy):

```ts
export const FIELD_IDS_COORDINACION_VISITA = Object.freeze({
  estadoCoordinacion:   'fldvnImj4jQttE2D9', // singleSelect confirmada·rechazada
  solicitud:            'fldO6qSVaZAWaozi1', // Link → TX_Solicitudes
  solicitudRecordId:    'fldCzrumbm9U135Zn', // lookup (filtro por record id)
  intentoNumero:        'fldNj1SdLE6pyWvfx', // number
  fechaRespuesta:       'fldAIuBPGiZ5ZDssj', // dateTime
  fechaVisitaPropuesta: 'fldRAuqHnIGTG7eBC', // date (rama confirmada)
  nota:                 'fldCIIUL8pd2wAPEE', // multilineText (rama confirmada)
  motivo:               'fld0rkrlg9Xo0fFVm', // singleSelect (rama rechazada)
  detalle:              'fldcVwI3w0I8WsCrx', // multilineText (rama rechazada)
} as const)
```

No consume `coordinacion_key`, `autor_clerk_id`, `email_*`, `email_thread_id` (irrelevantes para la
lectura de IF-02).

## d. Archivos a crear/modificar (lista cerrada del bloque)

| Acción | Archivo |
|---|---|
| CREAR | `app/api/solicitudes/[id]/coordinacion/route.ts` (GET) |
| CREAR | `lib/coordinacion-airtable.ts` — reader `fetchCoordinacionSolicitud(solicitudId)` → `{ coordinacionVigente, intentos }`; filtra por `solicitud_record_id`, ordena por `fecha_respuesta DESC`; usa `listRecords` de `@/lib/airtable-client` |
| MODIFICAR | `lib/tasador/field-ids.ts` — agregar `FIELD_IDS_COORDINACION_VISITA` |
| CREAR | `app/api/solicitudes/[id]/coordinacion/route.test.ts` |
| CREAR | `lib/coordinacion-airtable.test.ts` |

**NO toca** (R5 · territorio IF-02): `components/console/solicitud-detail.tsx`,
`lib/historial-airtable.ts`, `lib/console-data.ts`. La fusión en el timeline del Historial y el bloque de
DatosTab quedan para bloques posteriores (C4/C3) con autorización explícita.

## e. Tests (sobre baseline 415 verde)

`lib/coordinacion-airtable.test.ts` (`vi.mock` de `@/lib/airtable-client`):

1. **Caso seed `recE7iW1JvR6ynIig`**: mock devuelve la fila confirmada (intento 1, fecha_respuesta
   `2026-08-21T17:00:00.000Z`, fecha_visita `2026-08-25`) → asserts `coordinacionVigente === 'confirmada'`,
   `intentos[0].fechaVisita === '2026-08-25'`, `solicitudId === 'rec9qf3DchOY5Lk2N'`.
2. **0 filas** → `{ coordinacionVigente: null, intentos: [] }` (RO-34).
3. **Orden**: dos intentos con fechas distintas → `intentos` DESC y `coordinacionVigente` = el más reciente.
4. **Rama rechazada**: fila con `motivo`+`detalle`, sin `fechaVisita` → proyecta `motivo`/`detalle`,
   `fechaVisita` ausente.
5. **estado desconocido** (defensivo): un `estado_coordinacion` fuera de `confirmada·rechazada` → no
   rompe; ese intento no fija `coordinacionVigente` (mapea a null), mismo criterio que
   `coordinacionVigente()` en `lectura-tasacion.ts:243`.

`route.test.ts` (patrón `llamar()` + `params: Promise.resolve({ id })`, mock del reader): 200 con el
shape; propaga error del reader sin degradar a lista vacía (mismo criterio que `historial-airtable.ts`).

## f. Chequeo de reglas

- **RO-30** ✅ — lectura de producción por `listRecords`/`AIRTABLE_TOKEN` server-side dentro de
  `route.ts`. El MCP se usó solo para diseño/verificación del schema y la seed. Ninguna ruta compilada
  invoca MCP.
- **A-17** ✅ — no se hardcodea ningún catálogo. `estado`, `motivo` se leen passthrough desde Airtable;
  no se escribe ningún `singleSelect`, así que no hay enum atado al build.
- **RO-34** ✅ — 0 filas → `coordinacionVigente: null` (no un desenlace neutro inventado).
- **RO-35** ✅ — handler **GET**, lectura pura; ninguna escritura, ningún efecto de montaje. La fusión
  en UI (bloque posterior) también será lectura.

---

## DUDAS / ambigüedades (marcadas, no resueltas)

- **DUDA-1 · A-21 (pendiente Héctor):** dos motivos de `TX_CoordinacionVisita.motivo` duplican valores de
  `TX_ContactosVisita.estado_contacto`. Para una **lectura** no bloquea (pasamos el `name` tal cual), pero
  si A-21 cierra unificando catálogos, el campo `motivo` de la respuesta es el punto donde se notaría. No
  se resuelve acá.
- **DUDA-2 · Identidad del `[id]`:** el filtro natural de la tabla es el lookup `solicitud_record_id`
  (record ids), así que `[id]` = record id de la solicitud. Los hermanos IF-02 mezclan criterios
  (`A_Eventos` casa por `codigo`, `A_Cambios` por record id). Antes de cablear la UI (C4) hay que confirmar
  qué pasa `solicitud-detail.tsx` como `s.id`. Para este bloque el contrato es **record id**; queda
  explícito para no asumir de más.
- **Sin choques schema-vs-plan:** todos los campos del plan existen en Airtable con los IDs listados. No
  hay campo documentado que falte ni sobre.

---

## Próximo paso

Esperando aprobación. Con el OK: crear los 4 archivos + modificar `field-ids.ts`, un único
`pnpm tsc --noEmit` al final del bloque, reportar verde/rojo y parar.
