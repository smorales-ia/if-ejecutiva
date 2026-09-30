# SUB-BLOQUE A BLOQUEADO — patch de datos del CBR pendiente de aplicar

> Estado: **NO APLICADO**. El gate de permisos de la sesión de Claude Code denegó dos veces
> el write en producción (curl y MCP Airtable devolvió 403 por token de solo lectura).
> Verificado post-denegación: el record quedó INTACTO (`ultima_modificacion` sigue en
> `2026-09-29T23:04:55.000Z`, items = solo la terna, no_extraidos = 9 códigos).

## Qué había que escribir (aprobado por Sergio, decisión b · diagnóstico §4-R1b)

- Record: `rec7t6MPxKu10WniF` · Tabla `TX_Adjuntos` (`tblur71x1oItbmKZc`) · Base `app9G7lLkIV3CpeLa`
- Campo: `atributos_obtenidos` (`fldeCH15RrL8f4TZk`)
- Los 5 valores son **verbatim del documento CBR real** — verificados en esta sesión leyendo la
  imagen embebida de `docs/_referencias/Met_6283/inscripcion_dominio_cbr_Met6283.docx`
  (coinciden con el diagnóstico §2; los nombres van completos, no abreviados; separador `/` y
  comuna en mayúsculas siguen la convención de los demás adjuntos de la carpeta; fecha en ISO).
- La terna del informe (13291/21565/2006) queda INTACTA (decisión c). `notaria` y `nombre_cbr`
  NO se cargan (el diagnóstico los marca ausentes/cortados en el documento — naranjos honestos).

## Valor NUEVO completo del campo (string JSON, copiar tal cual)

```json
{"items": [{"codigo_atributo": "foja_cbr", "valor": "13291", "confianza": 1, "fila": 1}, {"codigo_atributo": "numero_cbr", "valor": "21565", "confianza": 1, "fila": 1}, {"codigo_atributo": "ano_inscripcion_cbr", "valor": 2006, "confianza": 1, "fila": 1}, {"codigo_atributo": "vendedor", "valor": "RAUL FERNANDO VALENZUELA PEREZ", "confianza": 1, "fila": 1}, {"codigo_atributo": "comprador", "valor": "FRANCISCO JOSE VERGARA UNDURRAGA / MARIA LUISA ORELLANA FERNANDEZ", "confianza": 1, "fila": 1}, {"codigo_atributo": "nombre_propietario", "valor": "FRANCISCO JOSE VERGARA UNDURRAGA / MARIA LUISA ORELLANA FERNANDEZ", "confianza": 1, "fila": 1}, {"codigo_atributo": "fecha_inscripcion", "valor": "2020-01-13", "confianza": 1, "fila": 1}, {"codigo_atributo": "comuna", "valor": "COLINA", "confianza": 1, "fila": 1}], "no_extraidos": ["notaria", "superficie_servidumbre_m2", "nombre_cbr", "repertorio"]}
```

## Cómo aplicarlo (dos opciones)

**Opción 1 — pegar a mano en Airtable** (más simple): abrir `TX_Adjuntos`, fila del adjunto
`inscripcion_dominio_cbr_Met6283.docx` de VP-2026-0067, campo `atributos_obtenidos`, y
reemplazar todo el contenido por el JSON de arriba (una sola línea).

**Opción 2 — pedírselo a Claude Code en una sesión nueva** autorizando explícitamente el
comando de escritura cuando aparezca el prompt de permiso (el PATCH exacto está en el
historial de esta tanda y en este archivo).

## Rollback

El valor ORIGINAL está en [`rollback.md`](rollback.md) §1 — revertir es pegar ese JSON en el
mismo campo.
