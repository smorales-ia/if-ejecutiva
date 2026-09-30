# ROLLBACK — T-VP0067-LECTURA-FIX-B-20260929

> Snapshot tomado ANTES del write autorizado. Fecha: 2026-09-30 (madrugada, hora Chile).

## Fila objetivo (verificada en Bloque 0)

- Base `app9G7lLkIV3CpeLa` · Tabla `TX_Adjuntos` (`tblur71x1oItbmKZc`) · Record **`rec7t6MPxKu10WniF`**
- `nombre_archivo`: `inscripcion_dominio_cbr_Met6283.docx` · `solicitud`: `recmMzeu3eWGxyXsf` (VP-2026-0067)
- `ultima_modificacion` pre-write: `2026-09-29T23:04:55.000Z`
- **Cotejo con `patch-pendiente-A.md`**: el valor actual de `atributos_obtenidos` coincide
  con el "valor viejo" registrado allí, **byte a byte** (comparación de string exacta = True).
  Nadie lo tocó entre tandas → autorizado a proceder.

## Valor ORIGINAL de `atributos_obtenidos` (para revertir, copiar tal cual)

```json
{"items": [{"codigo_atributo": "foja_cbr", "valor": "13291", "confianza": 1, "fila": 1}, {"codigo_atributo": "numero_cbr", "valor": "21565", "confianza": 1, "fila": 1}, {"codigo_atributo": "ano_inscripcion_cbr", "valor": 2006, "confianza": 1, "fila": 1}], "no_extraidos": ["vendedor", "nombre_propietario", "notaria", "comprador", "superficie_servidumbre_m2", "fecha_inscripcion", "nombre_cbr", "repertorio", "comuna"]}
```

Revertir = PATCH del campo `atributos_obtenidos` (`fldeCH15RrL8f4TZk`) de ese record con el
JSON de arriba serializado como string (o pegarlo a mano en Airtable).
