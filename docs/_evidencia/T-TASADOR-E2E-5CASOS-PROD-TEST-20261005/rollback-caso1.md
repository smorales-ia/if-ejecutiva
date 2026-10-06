# ROLLBACK · Caso 1 · reczuns8NHdI45Owp — T-TASADOR-E2E-5CASOS-PROD-TEST-20261005

**Snapshot previo:** `snapshot-pre-tanda.json` → clave `caso1` (record completo, tomado 2026-10-05 antes de toda escritura de esta tanda).

## Estado previo (lo que hay que restaurar)
- `estado` = `calculada`
- `pdf_final_url` = VACÍO
- TX_Adjuntos previos: 18 filas (ids en el snapshot) — todo adjunto creado por esta tanda que NO esté en esa lista se elimina.
- TX_DocumentosGenerados previos: 0 filas — ídem: toda fila nueva se elimina.

## Procedimiento de reversión (un paso por tipo)
1. DELETE de los TX_Adjuntos creados por esta tanda (ids registrados en `escrituras-caso1.json` al momento de crearlos).
2. DELETE de los TX_DocumentosGenerados creados por esta tanda (ídem).
3. PATCH del record reczuns8NHdI45Owp reponiendo `estado`=calculada y `pdf_final_url` al valor previo (vacío).
4. Verificar contra `snapshot-pre-tanda.json` que el record quedó idéntico en los campos tocados.

Nada más de esta solicitud se toca en esta tanda (datos, cálculos, comparables y fotos ya existían y NO se modifican).
