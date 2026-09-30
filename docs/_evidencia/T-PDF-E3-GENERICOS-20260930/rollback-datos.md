# Rollback datos — TRACK B-DATOS · T-PDF-E3-GENERICOS-20260930

> Estado PREVIO de todo lo que este track escribe en Airtable (base app9G7lLkIV3CpeLa).
> Registrado el 2026-09-30 ANTES de cada escritura. Un solo patch por record.

## 1. Campo `M_Tasadores.firma_url` (a crear)

- **NO EXISTÍA** al inicio (verificado vía meta API: schema M_Tasadores tblEi5jp18c1j00bQ sin campo `firma_url`).
- Rollback: eliminar el campo (o dejarlo, es aditivo). Field ID creado: _(se anota abajo al crearlo)_.

## 2. D_TipoDocumento (tblkPhBnpdDmUWOl3) — 5 registros a crear

- Códigos `esquema_superficies`, `cuadro_superficies`, `planta_emplazamiento`, `foto_aerea`, `mapa_sii`: **NO EXISTÍAN** (tabla tenía 20 registros; listado completo verificado vía REST el 2026-09-30).
- Rollback: DELETE de los record IDs creados _(se anotan abajo al crearlos)_.

## 3. M_Tasadores recTJcV3BIvdcG4em (tasador VP-0067) — patch de firma_url

Record completo ANTES del patch (firma_url no existía, por ende sin valor):

```json
{
  "id": "recTJcV3BIvdcG4em",
  "createdTime": "2026-09-23T16:49:55.000Z",
  "fields": {
    "activo": true,
    "clerk_user_id": "user_3GBF4JpAzPfJsJJWTRGp8sRi7gv",
    "ultima_modificacion": "2026-09-29T19:02:02.000Z",
    "TX_Solicitudes": [
      "recNiwM4s1ibr3sbO",
      "recmMzeu3eWGxyXsf"
    ],
    "tasador_id": 121,
    "nombre": "Sergio (nutricionsaludketo)",
    "email": "nutricionsaludketo@gmail.com"
  }
}
```

- Rollback: vaciar `firma_url` (o eliminar el campo).

## 4. TX_Adjuntos (tblur71x1oItbmKZc) — 5 filas existentes a patchear (solo thumbnail_url)

`thumbnail_url` estaba **VACÍO** en las 5. Record completo ANTES del patch:

### foto_fuente_sii · recWdb4FAphNaTE0I

```json
{
  "id": "recWdb4FAphNaTE0I",
  "createdTime": "2026-09-22T02:08:47.000Z",
  "fields": {
    "orden": 2,
    "tipo_adjunto": "otro",
    "estado_extraccion": "listo",
    "url_dropbox": "/VProperty/met-6283-real/foto_fuente_sii_Met6283.jpg",
    "subido_en": "2026-09-22T02:08:47.000Z",
    "tamanio_kb": 58,
    "tipo": "sii",
    "adjunto_id": 71,
    "solicitud": [
      "recmMzeu3eWGxyXsf"
    ],
    "clave_adjunto": "foto_fuente_sii",
    "atributos_esperados": "[{'codigo_atributo':'numero_dominio','nombre_atributo':'Numero (inscripcion de dominio)','tipo_dato':'text','obligatorio':'','etiqueta_local':'N inscripcion','ejemplo_atributo':'5678 (numero de la inscripcion de dominio en el CBR; puede venir en blanco)','uso_campo_destino':'numero_inscripcion','uso_tabla_destino':'TX_DocumentosLegales','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'tipo_material','nombre_atributo':'','tipo_dato':'text','obligatorio':'true','etiqueta_local':'Material Predominante','ejemplo_atributo':'albanileria (dominio: madera, albanileria, hormigon, mixto, perfiles_metalicos)','uso_campo_destino':'tipo_material','uso_tabla_destino':'TX_Unidades','usado_motor_calculo':'true','uso_campo_link_unidad':'TX_Unidades.rol_sii','uso_cardinalidad_destino':'una_por_unidad'},{'codigo_atributo':'g','nombre_atributo':'G - Galpones','tipo_dato':'text','obligatorio':'','etiqueta_local':'G - Galpones','ejemplo_atributo':'','uso_campo_destino':'g','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'oc','nombre_atributo':'OC - Obras Complementarias','tipo_dato':'text','obligatorio':'','etiqueta_local':'OC - Obras Complementarias','ejemplo_atributo':'','uso_campo_destino':'oc','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'cod_sii_manzana','nombre_atributo':'Codigo Manzana SII','tipo_dato':'text','obligatorio':'','etiqueta_local':'Codigo Manzana SII','ejemplo_atributo':'','uso_campo_destino':'cod_sii_manzana','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'calidad_sii','nombre_atributo':'Calidad SII','tipo_dato':'text','obligatorio':'','etiqueta_local':'Calidad SII','ejemplo_atributo':'','uso_campo_destino':'calidad_sii','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'true','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'anio_construccion','nombre_atributo':'','tipo_dato':'number','obligatorio':'true','etiqueta_local':'Anio de Construccion','ejemplo_atributo':'2004 (anio de la linea habitacional principal en el detalle del predio)','uso_campo_destino':'anio_construccion','uso_tabla_destino':'TX_Unidades','usado_motor_calculo':'true','uso_campo_link_unidad':'TX_Unidades.rol_sii','uso_cardinalidad_destino':'una_por_unidad'},{'codigo_atributo':'foja_dominio','nombre_atributo':'Foja (inscripcion de dominio)','tipo_dato':'text','obligatorio':'','etiqueta_local':'Foja','ejemplo_atributo':'1234 (foja de la inscripcion de dominio en el CBR; puede venir en blanco en la foto SII)','uso_campo_destino':'fojas','uso_tabla_destino':'TX_DocumentosLegales','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'avaluo_exento','nombre_atributo':'Avaluo Exento','tipo_dato':'number','obligatorio':'','etiqueta_local':'Avaluo Exento','ejemplo_atributo':'','uso_campo_destino':'avaluo_exento','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'cg','nombre_atributo':'CG - Construcciones Generales','tipo_dato':'text','obligatorio':'','etiqueta_local':'CG - Construcciones Generales','ejemplo_atributo':'','uso_campo_destino':'cg','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'ubicacion_urbano_rural','nombre_atributo':'Ubicacion (Urbano/Rural)','tipo_dato':'text','obligatorio':'','etiqueta_local':'Ubicacion (Urbano/Rural)','ejemplo_atributo':'urbano — dominio cerrado; responde EXACTAMENTE 'urbano' o 'rural' en minuscula (nunca 'zona urbana', 'urbana' ni 'U')','uso_campo_destino':'ubicacion_urbano_rural','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'ociv','nombre_atributo':'OCiv - Obras Civiles','tipo_dato':'text','obligatorio':'','etiqueta_local':'OCiv - Obras Civiles','ejemplo_atributo':'','uso_campo_destino':'ociv','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'rol_sii','nombre_atributo':'Rol SII','tipo_dato':'text','obligatorio':'','etiqueta_local':'Rol SII','ejemplo_atributo':'','uso_campo_destino':'rol_sii','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'anio_dominio','nombre_atributo':'Anio (inscripcion de dominio)','tipo_dato':'number','obligatorio':'','etiqueta_local':'Anio inscripcion','ejemplo_atributo':'2020 (anio de la inscripcion de dominio; puede venir en blanco)','uso_campo_destino':'ano_inscripcion','uso_tabla_destino':'TX_DocumentosLegales','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'sup_terreno_m2','nombre_atributo':'','tipo_dato':'number','obligatorio':'true','etiqueta_local':'Superficie Terreno','ejemplo_atributo':'503 (dato del avaluo catastral detallado por rol)','uso_campo_destino':'sup_terreno_m2','uso_tabla_destino':'TX_Unidades','usado_motor_calculo':'true','uso_campo_link_unidad':'TX_Unidades.rol_sii','uso_cardinalidad_destino':'una_por_unidad'},{'codigo_atributo':'contribucion_anual','nombre_atributo':'Contribucion (anual)','tipo_dato':'number','obligatorio':'','etiqueta_local':'Contribucion (anual)','ejemplo_atributo':'','uso_campo_destino':'contribucion_anual','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'cod_sii_comuna','nombre_atributo':'Codigo Comuna SII','tipo_dato':'text','obligatorio':'','etiqueta_local':'Codigo Comuna SII','ejemplo_atributo':'','uso_campo_destino':'cod_sii_comuna','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'destino_sii','nombre_atributo':'Destino Predominante','tipo_dato':'text','obligatorio':'','etiqueta_local':'Destino Predominante','ejemplo_atributo':'','uso_campo_destino':'destino_sii','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'cod_sii_predio','nombre_atributo':'Codigo Predio SII','tipo_dato':'text','obligatorio':'','etiqueta_local':'Codigo Predio SII','ejemplo_atributo':'','uso_campo_destino':'cod_sii_predio','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'avaluo_fiscal_clp','nombre_atributo':'Avaluo Fiscal','tipo_dato':'number','obligatorio':'','etiqueta_local':'Avaluo Fiscal','ejemplo_atributo':'','uso_campo_destino':'avaluo_fiscal_clp','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'true','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'sup_m2','nombre_atributo':'','tipo_dato':'number','obligatorio':'true','etiqueta_local':'Superficie Construida','ejemplo_atributo':'137 (dato del avaluo catastral detallado por rol)','uso_campo_destino':'sup_m2','uso_tabla_destino':'TX_Unidades','usado_motor_calculo':'true','uso_campo_link_unidad':'TX_Unidades.rol_sii','uso_cardinalidad_destino':'una_por_unidad'}]",
    "atributos_obtenidos": "{\"items\": [{\"codigo_atributo\": \"numero_dominio\", \"valor\": \"21565\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"cod_sii_manzana\", \"valor\": \"882\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"foja_dominio\", \"valor\": \"13291\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"avaluo_exento\", \"valor\": 0, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"ubicacion_urbano_rural\", \"valor\": \"rural\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"anio_dominio\", \"valor\": 2006, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"sup_terreno_m2\", \"valor\": 5024, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"contribucion_anual\", \"valor\": 0, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"cod_sii_comuna\", \"valor\": \"14201\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"destino_sii\", \"valor\": \"Sitio Eriazo\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"cod_sii_predio\", \"valor\": \"40\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"avaluo_fiscal_clp\", \"valor\": 120267353, \"confianza\": 1, \"fila\": 1}], \"no_extraidos\": [\"tipo_material\", \"g\", \"oc\", \"calidad_sii\", \"anio_construccion\", \"cg\", \"ociv\", \"rol_sii\", \"sup_m2\"]}",
    "nombre_archivo": "foto_fuente_sii_Met6283.jpg",
    "fecha_subida": "2026-09-22T02:08:47.000Z",
    "subido_por": "Sistema",
    "ultima_modificacion": "2026-09-29T23:04:55.000Z",
    "descripcion": "Foto fuente SII",
    "mime_type": "image/jpeg"
  }
}
```

### permiso_edificacion · rec95X1HPJB7ZUo5G

```json
{
  "id": "rec95X1HPJB7ZUo5G",
  "createdTime": "2026-09-22T02:08:47.000Z",
  "fields": {
    "orden": 1,
    "tipo_adjunto": "otro",
    "estado_extraccion": "listo",
    "url_dropbox": "/VProperty/met-6283-real/permiso_edificacion_Met6283.pdf",
    "subido_en": "2026-09-22T02:08:47.000Z",
    "tamanio_kb": 79,
    "tipo": "Permiso edificacion",
    "adjunto_id": 70,
    "solicitud": [
      "recmMzeu3eWGxyXsf"
    ],
    "clave_adjunto": "permiso_edificacion",
    "atributos_esperados": "[{'codigo_atributo':'direccion','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Direccion','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'arquitecto_responsable','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Arquitecto Responsable','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'tipo_obra','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Tipo de Obra','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'numero_subterraneos','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Numero de Subterraneos','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'superficie_construida_m2','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Superficie a Construir','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'tipo_agrupamiento','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Tipo de Agrupamiento','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'nombre_propietario','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Propietario','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'numero_pisos','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Numero de Pisos','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'fecha_permiso','nombre_atributo':'Fecha Permiso de Edificación','tipo_dato':'date','obligatorio':'true','etiqueta_local':'Fecha Permiso','ejemplo_atributo':'2020-09-09','uso_campo_destino':'permiso_edificacion_fecha','uso_tabla_destino':'TX_DocumentosLegales','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'tipo_propiedad','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Tipo de Propiedad','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'superficie_terreno_m2','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Superficie Terreno','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'ano_construccion','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Ano del Permiso','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'comuna','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Comuna','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'numero_permiso','nombre_atributo':'N° Permiso de Edificación','tipo_dato':'text','obligatorio':'true','etiqueta_local':'Numero Permiso','ejemplo_atributo':'319-2020','uso_campo_destino':'permiso_edificacion_numero','uso_tabla_destino':'TX_DocumentosLegales','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'}]",
    "atributos_obtenidos": "{\"items\": [{\"codigo_atributo\": \"direccion\", \"valor\": \"SERVIDUMBRE DE TRANSITO SIN NUMERO\", \"confianza\": 0.85, \"fila\": 1}, {\"codigo_atributo\": \"tipo_obra\", \"valor\": \"OBRA NUEVA\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"superficie_construida_m2\", \"valor\": 249.91, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"nombre_propietario\", \"valor\": \"FRANCISCO JOSE VERGARA UNDURRAGA / MARIA LUISA ORELLANA FERNANDEZ\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"numero_pisos\", \"valor\": 1, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"fecha_permiso\", \"valor\": \"2020-09-09\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"tipo_propiedad\", \"valor\": \"VIVIENDA UNIFAMILIAR\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"ano_construccion\", \"valor\": 2020, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"comuna\", \"valor\": \"COLINA\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"numero_permiso\", \"valor\": \"319-2020\", \"confianza\": 1, \"fila\": 1}], \"no_extraidos\": [\"arquitecto_responsable\", \"numero_subterraneos\", \"tipo_agrupamiento\", \"superficie_terreno_m2\"]}",
    "nombre_archivo": "permiso_edificacion_Met6283.pdf",
    "fecha_subida": "2026-09-22T02:08:47.000Z",
    "subido_por": "Sistema",
    "ultima_modificacion": "2026-09-29T23:04:55.000Z",
    "descripcion": "Permiso de edificación",
    "mime_type": "application/pdf"
  }
}
```

### informe_no_expropiacion_serviu · recpI0wPyESJ0Etvs

```json
{
  "id": "recpI0wPyESJ0Etvs",
  "createdTime": "2026-09-22T02:08:47.000Z",
  "fields": {
    "orden": 7,
    "tipo_adjunto": "cert_no_expropiacion",
    "estado_extraccion": "listo",
    "url_dropbox": "/VProperty/met-6283-real/informe_no_expropiacion_serviu_Met6283.pdf",
    "subido_en": "2026-09-22T02:08:47.000Z",
    "tamanio_kb": 62,
    "tipo": "Otro",
    "adjunto_id": 76,
    "solicitud": [
      "recmMzeu3eWGxyXsf"
    ],
    "clave_adjunto": "informe_no_expropiacion_serviu",
    "atributos_esperados": "[{'codigo_atributo':'fecha_emision','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Fecha de Emision','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'longitud','nombre_atributo':'Longitud','tipo_dato':'number','obligatorio':'','etiqueta_local':'Longitud','ejemplo_atributo':'','uso_campo_destino':'long','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'afecto_expropiacion','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Afecto a Expropiacin','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'direccion','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Direccion Inmueble','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'rol_sii','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Rol de Avaluo','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'numero_documento','nombre_atributo':'N° Certificado No Expropiación','tipo_dato':'text','obligatorio':'true','etiqueta_local':'Numero de Certificado','ejemplo_atributo':'3444743','uso_campo_destino':'n_cert_no_expropiacion','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'comuna','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Comuna','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'latitud','nombre_atributo':'Latitud','tipo_dato':'number','obligatorio':'','etiqueta_local':'Latitud','ejemplo_atributo':'','uso_campo_destino':'lat','uso_tabla_destino':'TX_DatosTasacion','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'}]",
    "atributos_obtenidos": "{\"items\": [{\"codigo_atributo\": \"fecha_emision\", \"valor\": \"2026-04-15\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"afecto_expropiacion\", \"valor\": false, \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"direccion\", \"valor\": \"LAS BRISAS 2 MZ A LT 40\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"rol_sii\", \"valor\": \"00882-00040\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"numero_documento\", \"valor\": \"3444743\", \"confianza\": 1, \"fila\": 1}, {\"codigo_atributo\": \"comuna\", \"valor\": \"COLINA\", \"confianza\": 1, \"fila\": 1}], \"no_extraidos\": [\"longitud\", \"latitud\"]}",
    "nombre_archivo": "informe_no_expropiacion_serviu_Met6283.pdf",
    "fecha_subida": "2026-09-22T02:08:47.000Z",
    "subido_por": "Sistema",
    "ultima_modificacion": "2026-09-29T23:04:55.000Z",
    "descripcion": "Informe de no expropiación SERVIU",
    "mime_type": "application/pdf"
  }
}
```

### certificado_recepcion_final · rectCtwDMT2mwN4GO

```json
{
  "id": "rectCtwDMT2mwN4GO",
  "createdTime": "2026-09-22T02:08:47.000Z",
  "fields": {
    "orden": 5,
    "tipo_adjunto": "otro",
    "estado_extraccion": "listo",
    "url_dropbox": "/VProperty/met-6283-real/certificado_recepcion_final_Met6283.pdf",
    "subido_en": "2026-09-22T02:08:47.000Z",
    "tamanio_kb": 81,
    "tipo": "Recepcion final",
    "adjunto_id": 74,
    "solicitud": [
      "recmMzeu3eWGxyXsf"
    ],
    "clave_adjunto": "certificado_recepcion_final",
    "atributos_esperados": "[{'codigo_atributo':'superficie_construida_m2','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Superficie Construida','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'direccion','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Direccion','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'tipo_propiedad','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Tipo de Propiedad','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'fecha_recepcion','nombre_atributo':'Fecha Recepción Final','tipo_dato':'date','obligatorio':'true','etiqueta_local':'Fecha de Recepcion','ejemplo_atributo':'18-07-2024','uso_campo_destino':'recepcion_final_fecha','uso_tabla_destino':'TX_DocumentosLegales','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'numero_permiso','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Numero Permiso Original','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'destino_sii','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Destino','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'numero_recepcion','nombre_atributo':'N° Recepción Final','tipo_dato':'text','obligatorio':'true','etiqueta_local':'Numero Certificado','ejemplo_atributo':'210-2024','uso_campo_destino':'recepcion_final_numero','uso_tabla_destino':'TX_DocumentosLegales','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':'una_por_solicitud'},{'codigo_atributo':'comuna','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Comuna','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'ano_construccion','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Ano de Construccion','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'rol_sii','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Rol SII','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''}]",
    "atributos_obtenidos": "{\"items\": [{\"codigo_atributo\": \"superficie_construida_m2\", \"valor\": 243.91, \"confianza\": 0.85, \"fila\": 1}, {\"codigo_atributo\": \"direccion\", \"valor\": \"SERVIDUMBRE DE TRANSITO SIN NUMERO LOTE B/A 49 LAS BRISAS DE CHICUREO\", \"confianza\": 0.9, \"fila\": 1}, {\"codigo_atributo\": \"tipo_propiedad\", \"valor\": \"VIVIENDA UNIFAMILIAR\", \"confianza\": 0.95, \"fila\": 1}, {\"codigo_atributo\": \"fecha_recepcion\", \"valor\": \"2024-07-18\", \"confianza\": 0.97, \"fila\": 1}, {\"codigo_atributo\": \"numero_permiso\", \"valor\": \"CRDON.0408/2024\", \"confianza\": 0.85, \"fila\": 1}, {\"codigo_atributo\": \"destino_sii\", \"valor\": \"VIVIENDA UNIFAMILIAR\", \"confianza\": 0.9, \"fila\": 1}, {\"codigo_atributo\": \"numero_recepcion\", \"valor\": \"210-2024\", \"confianza\": 0.97, \"fila\": 1}, {\"codigo_atributo\": \"comuna\", \"valor\": \"COLINA\", \"confianza\": 0.99, \"fila\": 1}, {\"codigo_atributo\": \"rol_sii\", \"valor\": \"882-40\", \"confianza\": 0.95, \"fila\": 1}], \"no_extraidos\": [\"ano_construccion\"]}",
    "nombre_archivo": "certificado_recepcion_final_Met6283.pdf",
    "fecha_subida": "2026-09-22T02:08:47.000Z",
    "subido_por": "Sistema",
    "ultima_modificacion": "2026-09-29T23:04:55.000Z",
    "descripcion": "Certificado de recepción final",
    "mime_type": "application/pdf"
  }
}
```

### certificado_deuda_tgr · rechQjmqpb3HMWyeb

```json
{
  "id": "rechQjmqpb3HMWyeb",
  "createdTime": "2026-09-22T02:08:47.000Z",
  "fields": {
    "orden": 4,
    "tipo_adjunto": "otro",
    "estado_extraccion": "listo",
    "url_dropbox": "/VProperty/met-6283-real/certificado_deuda_tgr_Met6283.pdf",
    "subido_en": "2026-09-22T02:08:47.000Z",
    "tamanio_kb": 57,
    "tipo": "Otro",
    "adjunto_id": 73,
    "solicitud": [
      "recmMzeu3eWGxyXsf"
    ],
    "clave_adjunto": "certificado_deuda_tgr",
    "atributos_esperados": "[{'codigo_atributo':'monto_deuda_clp','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Monto Deuda','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'rol_sii','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Rol SII','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'sobretasa_pct','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Sobretasa','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'contribucion_total_clp','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Contribucion Total','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'avaluo_afecto_clp','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Avaluo Afecto','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'comuna','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Comuna','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'nombre_propietario','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Nombre','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'tiene_deuda','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Registra Deuda','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'fecha_emision','nombre_atributo':'','tipo_dato':'','obligatorio':'true','etiqueta_local':'Fecha Emision','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''},{'codigo_atributo':'cuota_aseo_municipal_clp','nombre_atributo':'','tipo_dato':'','obligatorio':'','etiqueta_local':'Cuota Aseo Municipal','ejemplo_atributo':'','uso_campo_destino':'','uso_tabla_destino':'','usado_motor_calculo':'','uso_campo_link_unidad':'','uso_cardinalidad_destino':''}]",
    "atributos_obtenidos": "{\"items\": [{\"codigo_atributo\": \"monto_deuda_clp\", \"valor\": 1358324, \"confianza\": 0.99, \"fila\": 1}, {\"codigo_atributo\": \"rol_sii\", \"valor\": \"076-00882-040\", \"confianza\": 0.99, \"fila\": 1}, {\"codigo_atributo\": \"comuna\", \"valor\": \"COLINA\", \"confianza\": 0.99, \"fila\": 1}, {\"codigo_atributo\": \"nombre_propietario\", \"valor\": \"VERGARA UNDURRAGA FRANCISCO JOSE\", \"confianza\": 0.99, \"fila\": 1}, {\"codigo_atributo\": \"tiene_deuda\", \"valor\": true, \"confianza\": 0.99, \"fila\": 1}], \"no_extraidos\": [\"sobretasa_pct\", \"contribucion_total_clp\", \"avaluo_afecto_clp\", \"fecha_emision\", \"cuota_aseo_municipal_clp\"]}",
    "nombre_archivo": "certificado_deuda_tgr_Met6283.pdf",
    "fecha_subida": "2026-09-22T02:08:47.000Z",
    "subido_por": "Sistema",
    "ultima_modificacion": "2026-09-29T23:04:55.000Z",
    "descripcion": "Certificado de deuda TGR",
    "mime_type": "application/pdf"
  }
}
```

- Rollback: PATCH `thumbnail_url` a vacío (`null`) en cada una.

## 5. TX_Adjuntos — filas NUEVAS a crear (no existían)

Verificado el 2026-09-30: VP-0067 (recmMzeu3eWGxyXsf) tenía 24 filas en TX_Adjuntos; **ninguna** con:
- fotos `descripcion` = `mapa_referencias` ni `ofertas_comparables`;
- `clave_adjunto` = `foto_plano_cuadro_superficies`, `esquema_superficies`, `cuadro_superficies`, `planta_emplazamiento`, `foto_aerea`, `mapa_sii`, `certificado_avaluo_fiscal` ni `escritura_compraventa`.
- Rollback: DELETE de los record IDs creados _(se anotan abajo al crearlos)_.

## 6. IDs creados (se completan durante la ejecución)
Ejecutado el 2026-09-30 vía REST API (AIRTABLE_TOKEN server-side). Verificación post-escritura: 17/17 filas con thumbnail, `estado_extraccion` intacto (`listo`), 0 entradas AT-RF09 en LogEscenarios en la última hora, firma presente.

### Campo creado
- `M_Tasadores.firma_url` → **fldLDgfVvBD6huoqM** (multilineText)

### D_TipoDocumento creados (rollback = DELETE)
- recRP7WeMCTpBKGNK `esquema_superficies`
- rec4uCCVtUpAz2Yeb `cuadro_superficies`
- recKsDnW35AxORCTM `planta_emplazamiento`
- recO0rkERyk2Y52r5 `foto_aerea`
- recEgGc4ysrAAHVqZ `mapa_sii`

### TX_Adjuntos creados (rollback = DELETE) — todos link a recmMzeu3eWGxyXsf, estado_extraccion=listo
Fotos (forma del seed previo: tipo_adjunto=foto_interior, subido_por=Tasador, descripcion=categoría):
- recO1c5RxM4gAXfAa `mapa_referencias` orden 16 ← h2_mapa_referencias
- rec7KDUUpuPJ4ov06 `ofertas_comparables` orden 1 ← h2_ref1
- recGuGlyh2WDHHxjr `ofertas_comparables` orden 2 ← h2_ref2
- recSSA0wfHsb8V2CN `ofertas_comparables` orden 3 ← h2_ref3
Anexos documentales (forma de las filas Sistema: subido_por=Sistema, clave_adjunto, sin url_dropbox):
- recNktvt91eO41wo6 `foto_plano_cuadro_superficies` orden 9 ← anexo1_plano
- recaNIeSLo5c4GuRp `esquema_superficies` orden 10 ← anexo1_esquema_superficies
- recyWOZY3faaDPbUj `cuadro_superficies` orden 11 ← anexo1_cuadro_superficie
- recXsnwI5eLeWyrtw `planta_emplazamiento` orden 12 ← anexo1_emplazamiento
- rechuTt7dJgQzsu84 `foto_aerea` orden 13 ← anexo1_aerea
- recSIYEtTs7yJ6FI8 `mapa_sii` orden 14 ← anexo1_mapa_sii
- rec30QF4gVWxj3Cfk `certificado_avaluo_fiscal` orden 15 ← anexo2_rol_avaluo
- reccsOuryOiUsFAxL `escritura_compraventa` orden 16 ← anexo2_escritura_fojas

### TX_Adjuntos patcheados (UN patch por record, solo thumbnail_url; rollback = thumbnail_url→null)
- recWdb4FAphNaTE0I `foto_fuente_sii` ← anexo1_info_sii
- rec95X1HPJB7ZUo5G `permiso_edificacion` ← anexo2_permiso_edificacion
- recpI0wPyESJ0Etvs `informe_no_expropiacion_serviu` ← anexo2_no_expropiacion
- rectCtwDMT2mwN4GO `certificado_recepcion_final` ← anexo2_recepcion_final
- rechQjmqpb3HMWyeb `certificado_deuda_tgr` ← anexo2_tgr_deuda

### M_Tasadores patcheado (UN patch; rollback = firma_url→null)
- recTJcV3BIvdcG4em `firma_url` ← firma.jpg (data-URI 6.835 chars)

### No tocados (verificados con thumbnail previo renderizable)
- recM3pvhvf42qe3cb foto `mapa_ubicacion` (thumb 83.591 chars) — intacto
- recTMcPu6X5GqMLdP foto `fachada_exterior` orden 2 (thumb 86.203 chars) — intacto

### Nota anti-RF09 (paso 0a)
MCP `list_automations` devolvió 403 (token MCP sin ese permiso hoy); triggers verificados por
doble vía: script desplegado `docs/_artefactos/airtable/AT-RF09-Trigger_script.js` + catálogo
`C_AutomationsAirtable`. AT-RF09-Trigger (recordCreated) hace exit sin acción si
`estado_extraccion !== 'idle'` → todas las filas nuevas se crearon con `listo` (misma forma del
seed previo). AT-RF09-Trigger-Update vigila `clave_adjunto`/`estado_extraccion` y AT03-Ext vigila
`atributos_obtenidos` → los patches de solo `thumbnail_url` no los disparan. Confirmado post-hoc:
0 entradas AT-RF09 en LogEscenarios.
