# CIERRE — T-VP0067-LECTURA-FIX-20260929

> FASE 2 (ejecución) del diagnóstico `DIAGNOSTICO_lectura_VP0067_20260929.md`, según las
> decisiones de Sergio: pantalla honesta (b), inscripción del informe intacta (c), dos
> arreglos de fondo (d), rediseño de obligatorios para después (e).
> Rama: `feat/T-VP0067-LECTURA-FIX-20260929` (sin commit/push — los hace Sergio).

## Resultado por pieza

| Pieza | Estado | Evidencia |
|---|---|---|
| Bloque 0 · Snapshot/rollback | ✅ | `_evidencia/T-VP0067-LECTURA-FIX-20260929/rollback.md` + 2 JSON. El estado real coincidía con el diagnóstico |
| A · Cargar 5 datos del CBR (producción) | ⛔ **BLOQUEADA** | El gate de permisos de la sesión denegó dos veces el PATCH (y el MCP Airtable dio 403 — token de solo lectura). Producción quedó **intacta byte-a-byte** (auditor, criterio 1). Payload exacto listo en `patch-pendiente-A.md` — aplicarlo es pegar un JSON en un campo |
| B · Satisfacción por-carpeta en /lectura | ✅ | `app/api/tasaciones/[id]/lectura/route.ts:132-156` + 3 tests nuevos (21/21 verdes). Un obligatorio ausente ya no se reclama si otro adjunto de la carpeta lo tiene en `items[]`, **salvo códigos `fecha_*`** (dato del documento, no de la propiedad — conserva el naranjo honesto del TGR) |
| C · Veto de Word en la subida | ✅ | `app/api/adjuntos/upload/route.ts` — rechazo 400 por mime (`msword`/OOXML) o extensión `.doc/.docx`, antes de Dropbox/Make, con literal §6 «Este archivo está en Word y no podemos leerlo. Súbelo en PDF o como imagen (JPG o PNG).» + test co-ubicado nuevo (5/5) |
| Bloque 2 · Tests | ✅ | `pnpm build` limpio · suite completa 1028 passed · verificación data-driven contra producción (`tests.md`) |
| Bloque 3 · Auditor ciego | ✅ | `auditor.md` — OK en criterios 2-4; FAIL solo en 1 (la pieza bloqueada); su conteo independiente de naranjos coincide: 13 → 9 → 6 |
| Bloque 4 · Rollback condicional | ✅ (no-op) | El único FAIL es una pieza que nunca llegó a aplicarse: nada que revertir. Verificado record sin cambios (`ultima_modificacion` idéntica) |
| Smoke UI (lectura.png) | ⛔ no producible | `/lectura` está detrás de Clerk y no hay credenciales de usuario headless. Sustituto: simulación data-driven exacta del cálculo del server (`tests.md` §2) — verificación visual queda para Sergio post-deploy |

## Los naranjos, antes y después

- **Hoy en producción**: 13 (código viejo, datos sin patch).
- **Al desplegar el código nuevo** (commit+push de esta rama): **9** — la regla por-carpeta cura
  `avaluo_afecto_clp` y `contribucion_total_clp` del TGR y `nombre_propietario` y `comuna` del CBR.
- **Al aplicar además el patch A** (pendiente, 1 campo en Airtable): **6, todos honestos** —
  CBR: Notaría y nombre del CBR (cortados/no explícitos en el documento) · foto SII: material,
  año de construcción y superficie (sitio eriazo: la tabla de edificación está vacía) ·
  TGR: fecha de emisión (certificado recortado).

Esos 6 solo desaparecerían con la decisión (e) — obligatoriedad condicional del catálogo — que
Sergio dejó explícitamente para después.

## Pasos manuales pendientes (Sergio)

1. **Commit + push** de `feat/T-VP0067-LECTURA-FIX-20260929` → Railway despliega los dos arreglos.
2. **Aplicar el patch A**: pegar el JSON de `patch-pendiente-A.md` en `atributos_obtenidos` del
   adjunto CBR de VP-2026-0067 (o autorizar el PATCH en una sesión nueva de Claude Code).

## Deuda que esta tanda NO toca (por decisión)

- Terna del adjunto CBR ≠ terna del documento (13291/21565/2006 vs 3312/4663/2020): rasgo del
  expediente original, documentado en el diagnóstico §2 — se mantiene.
- Obligatorios de la foto SII / obligatoriedad condicional (decisión e).
- Conversión docx→PDF en Make (E2-B) y flujo "Reemplazar archivo" (E4).
