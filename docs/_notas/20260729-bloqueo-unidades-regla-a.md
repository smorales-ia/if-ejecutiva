# Bloqueo · Regla A no se cierra sin poblar `TX_Unidades`

> Tanda D-02 · 29-jul-2026 · requiere una tanda de Make aparte

## Qué pasa

El botón **"Asignar Tasador"** aparece pero nunca se habilita, para **ninguna**
solicitud. D-02 encontró dos causas encadenadas y sólo pudo cerrar la primera.

`datosMinimosFaltantes` (`components/console/solicitud-detail.tsx`) evalúa RN-44
y exige tres cosas: dirección, al menos un contacto de visita con teléfono, y
**al menos una unidad con Rol SII** (o marcada "En trámite" si la propiedad es
nueva). Si falta cualquiera, `puedeAsignar` es `false` y el botón queda
deshabilitado con el tooltip de faltantes.

## Causa 1 — resuelta en D-02

`mapRecord` (`lib/solicitudes.ts`) devolvía `unidades: []` fijo, con un comentario
—hoy obsoleto— que decía que `TX_Unidades` no existía en Airtable. Sí existe
(`tbl2QDLvJDyy3Rg2I`, 27 campos). Como nadie las hidrataba, la condición de
unidades era `false` para toda solicitud real.

**Corregido**: nuevo `lib/unidades.ts` con `hydrateUnidades`, encadenado en
`app/(ejecutiva)/consola/page.tsx` junto a `hydrateContactos`. Filtra por
`codigo_solicitud` (primary field) siguiendo E-076/E-077.

## Causa 2 — BLOQUEADA, necesita Make

`TX_Unidades` está **vacía**: 0 filas para toda la serie VP-2026-0050 … 0054
(verificado vía MCP el 29-jul-2026).

Ningún escenario escribe esa tabla. Verificado por grep de `tbl2QDLvJDyy3Rg2I`
sobre los 5 blueprints del repo:

| Blueprint | Referencias a `TX_Unidades` |
|---|---|
| `SC01 - Crear solicitud` | 0 |
| `SC-Edicion` | 0 |
| `SC-Asignar` | 0 |
| `SC-Adjuntos-Upload` | 0 |
| `SC-RF09-ExtraccionClaude` | 0 |

Ya estaba anotado en el código, en la cabecera de `lib/mappers/crear-solicitud.ts:62`:

> `unidades[]` (16 subcampos c/u) — SC01 no tiene ningún módulo que cree unidades. RF-04 fase 2

El wizard de alta **sí** captura las unidades; el payload las descarta porque no
hay dónde ponerlas.

## Consecuencia práctica

Después de desplegar D-02, el botón **seguirá deshabilitado** en producción. No
es una regresión ni un fallo del fix: es la causa 2, que sigue abierta. El
tooltip dirá "Rol SII de cada unidad con rol".

## Cómo desbloquearlo — dos caminos

**A · Comprobar el fix de D-02 ya mismo, sin tocar Make.** Crear a mano en
Airtable 1 fila en `TX_Unidades` ligada a una solicitud de prueba, con
`numero_unidad`, `rol_sii` y `con_rol_o_uso_y_goce`. `hydrateUnidades` la
levantará y el botón debe habilitarse. Sirve para validar D-02; no resuelve el
flujo real.

**B · Cierre definitivo (tanda de Make).** Añadir a SC01 la creación de unidades,
con la misma topología que resolvió los contactos en E-092:

1. `lib/mappers/crear-solicitud.ts` emite `unidades_json` = `JSON.stringify(...)`
   — clave nueva y de tipo texto, para que el webhook no memorice estructura.
2. SC01: módulo `json:ParseJSON` sobre `{{1.unidades_json}}`, en su propia ruta
   del Router 16 (E-076: un módulo que emite N bundles multiplica lo de aguas
   abajo).
3. `Create Record` en `TX_Unidades` leyendo `{{<idPJ>.campo}}`, con el link
   `solicitud` = `{{7.id}}`.
4. **Sin Iterator**: `ParseJSON` con raíz array ya emite un bundle por elemento.

Campos de destino (`tbl2QDLvJDyy3Rg2I`), verificados vía MCP:

| Campo | fldXXX | Tipo |
|---|---|---|
| `solicitud` (link) | `fldmBd2bzOWjPX0eW` | multipleRecordLinks |
| `numero_unidad` | `fldJGXS8jGDKZDdWM` | singleLineText |
| `modelo` | `fldO0F8PoKiHAigyC` | singleLineText |
| `subtipo` | `fldNU8ee30AvvRWHZ` | singleSelect |
| `con_rol_o_uso_y_goce` | `fldcVpzYmK3FWscmD` | singleSelect |
| `rol_sii` | `fldC5yUYC2wTTLJBV` | singleLineText |
| `rol_sii_en_tramite` | `fldYhcLG96yoU10ID` | checkbox |
| `sup_m2` | `fldZLvJKuXuWhRV8P` | number |
| `superficie_terraza_m2` | `flduwWj51oYcLDVTo` | number |
| `sup_terreno_m2` | `fld6lgF0KxUh9oPCB` | number |
| `anio_construccion` | `fldM46x4ECE9B0pfM` | number |
| `tipo_material` | `fldnG1nEod0V1IkKZ` | singleSelect |
| `ampliacion_m2` | `fldTvKrBiaZmkQ2In` | number |
| `ampliacion_regularizable` | `flddSP96ivTrAdcXW` | singleSelect |
| `origen_superficie` | `fldbDPpHhkuWjOTvQ` | singleSelect |
| `detalle_item` | `fldPjiXCPgNTdG3vP` | multilineText |
| `orden` | `fld9iRM3hhCNNj4DJ` | number |

Conexión Airtable: `__IMTCONN__ 8847431`. Base `app9G7lLkIV3CpeLa`.

El lado de lectura ya está listo: `hydrateUnidades` mapea los 17 campos en
cuanto existan filas.
