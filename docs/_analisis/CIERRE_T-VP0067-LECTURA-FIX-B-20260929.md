# CIERRE — T-VP0067-LECTURA-FIX-B-20260929

> Aplicación del único paso que quedó manual en T-VP0067-LECTURA-FIX-20260929: cargar por API
> los 5 datos del CBR en `atributos_obtenidos` del adjunto de VP-2026-0067. Write autorizado
> explícitamente por Sergio en el mandato de esta tanda.

## Resultado

| Bloque | Estado | Evidencia |
|---|---|---|
| 0 · Snapshot y cotejo | ✅ | El valor vivo coincidía **byte a byte** con el "valor viejo" de `patch-pendiente-A.md` (nadie lo tocó entre tandas) → `_evidencia/T-VP0067-LECTURA-FIX-B-20260929/rollback.md` |
| 1 · Write (el único autorizado) | ✅ | PATCH → HTTP 200. El JSON se leyó del bloque ```json de `patch-pendiente-A.md` sin retipear; la respuesta devolvió el string idéntico |
| 2 · Verificación | ✅ | Relectura: 8 items (terna 13291/21565/2006 **intacta** + los 5 verbatim); en la fila solo cambió el campo autorizado (+`ultima_modificacion`, computado); otras 7 filas intactas → `verificacion.md` + `snap-adjuntos-todos-post.json` |
| 3 · Auditor ciego | ✅ **OK global (4/4)** | Independiente, solo GETs: JSON byte-idéntico al prometido; cobertura TOTAL de TX_Adjuntos (33 records: el único modificado post-snapshot es el CBR); terna intacta; conteo propio de naranjos coincidente → `auditor.md` |
| 4 · Rollback condicional | ✅ (no-op) | Sin FAIL, nada que revertir |

## Naranjos de /lectura de VP-0067 — estado final

- **Hoy en producción** (código viejo en `origin/main`): **8** — CBR: Notaría, CBR ·
  foto SII: Material, Año de Construcción, Superficie · TGR: Fecha Emisión, Avalúo Afecto,
  Contribución. Los 5 del CBR **ya no reclaman**.
- **Al desplegar la rama** `feat/T-VP0067-LECTURA-FIX-20260929` (regla por-carpeta): **6** —
  se curan Avalúo Afecto y Contribución del TGR (la Consulta SII de la carpeta ya los tiene).
  Todos honestos: la notaría y el nombre del conservador salen cortados en el documento, el
  sitio es eriazo (sin edificación en la foto SII) y el TGR está recortado (sin fecha visible).

Hallazgo del auditor para la decisión (e): `anio_construccion` (foto SII) vs `ano_construccion`
(permiso de edificación) son códigos distintos para el mismo concepto — por eso la regla
por-carpeta no lo cura. Deuda de catálogo, no bug del código.

## Estado del código de la tanda anterior

`7aba30a` (satisfacción por-carpeta + veto docx) está commiteado y **publicado en
`origin/feat/T-VP0067-LECTURA-FIX-20260929`, pero NO mergeado a `main`** (punta de
`origin/main`: `c55ca67`). Railway sigue sirviendo el código viejo hasta el merge.

## Paso manual restante (Sergio)

1. Merge de `feat/T-VP0067-LECTURA-FIX-20260929` a `main` (+push) → Railway despliega y los
   naranjos bajan de 8 a 6.
