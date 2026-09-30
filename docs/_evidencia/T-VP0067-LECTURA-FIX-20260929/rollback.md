# ROLLBACK — T-VP0067-LECTURA-FIX-20260929

> Snapshot tomado ANTES de cualquier cambio. Fecha: 2026-09-29 (hora local Chile).
> Estado real verificado contra el diagnóstico `docs/_analisis/DIAGNOSTICO_lectura_VP0067_20260929.md`: **coincide** (terna 13291/21565/2006 en `items[]`, 9 códigos en `no_extraidos`).

## 1 · Dato en producción — adjunto CBR de VP-2026-0067

- Base: `app9G7lLkIV3CpeLa` · Tabla: `TX_Adjuntos` (`tblur71x1oItbmKZc`) · Record: **`rec7t6MPxKu10WniF`**
- `nombre_archivo`: `inscripcion_dominio_cbr_Met6283.docx` · `clave_adjunto`: `inscripcion_dominio_cbr`
- `estado_extraccion`: `listo` · `ultima_modificacion`: `2026-09-29T23:04:55.000Z`
- Snapshot completo del record: [`snap-cbr-pre.json`](snap-cbr-pre.json)
- Snapshot de los 8 adjuntos de la solicitud: [`snap-adjuntos-todos-pre.json`](snap-adjuntos-todos-pre.json)

### Valor ORIGINAL de `atributos_obtenidos` (`fldeCH15RrL8f4TZk`) — copiar tal cual para revertir

```json
{"items": [{"codigo_atributo": "foja_cbr", "valor": "13291", "confianza": 1, "fila": 1}, {"codigo_atributo": "numero_cbr", "valor": "21565", "confianza": 1, "fila": 1}, {"codigo_atributo": "ano_inscripcion_cbr", "valor": 2006, "confianza": 1, "fila": 1}], "no_extraidos": ["vendedor", "nombre_propietario", "notaria", "comprador", "superficie_servidumbre_m2", "fecha_inscripcion", "nombre_cbr", "repertorio", "comuna"]}
```

### Cómo revertir el dato

`PATCH https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblur71x1oItbmKZc/rec7t6MPxKu10WniF` con
`{"fields": {"atributos_obtenidos": "<el JSON de arriba, serializado como string>"}}` usando `AIRTABLE_TOKEN` de `.env.local`.

## 2 · Código — estado original

Los dos archivos a tocar están intactos en el commit **`b2c8f7bd5294a2208f95e3fa2925ab4316496015`**
(punta de `plan/T-VP0067-LECTURA-DIAG-20260929`, de donde nace `feat/T-VP0067-LECTURA-FIX-20260929`):

- `app/api/tasaciones/[id]/lectura/route.ts` (arreglo 1 · satisfacción por-carpeta)
- `app/api/adjuntos/upload/route.ts` (arreglo 2 · veto de Word en la subida)
- y sus tests co-ubicados.

### Cómo revertir el código

```bash
git checkout b2c8f7bd5294a2208f95e3fa2925ab4316496015 -- "app/api/tasaciones/[id]/lectura/route.ts" "app/api/tasaciones/[id]/lectura/route.test.ts" app/api/adjuntos/upload/route.ts
```

## 3 · Qué NO se toca (referencia para el auditor)

- La terna del informe en `items[]` del CBR: `foja_cbr=13291`, `numero_cbr=21565`, `ano_inscripcion_cbr=2006` — **queda intacta** (decisión c de Sergio).
- Los otros 7 adjuntos de VP-0067 (ningún write fuera de `rec7t6MPxKu10WniF`).
- El catálogo `D_TipoDocumentoAtributo` (decisión e = después).
- Informe / cadena PDF de VP-0067.
