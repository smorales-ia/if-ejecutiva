# Snapshot · P0.5-TAS — Schema Airtable IF-03 · tabla de defaults

> **Fecha** — 22-ago-2026. **Rama** — `feat/tasador-ui`. **Base** — `app9G7lLkIV3CpeLa`.
> **Tanda** — P0.5-TAS del plan `docs/_md/plan_ejecucion_UItasador_v1.2.md`.
> **Contrato** — 🔴 pausa-total en escrituras MCP. Ocho pausas `s/n`, ninguna rechazada.
> **Estado** — ✅ **completa**. Tabla creada y vacía; el sembrado es tanda aparte.
>
> ⚠ **No confundir con `snapshot-P0.5-TAS.md`** (17-ago-2026), que documenta la P0.5-TAS
> **original** — el schema general de IF-03, ejecutado vía Meta API REST porque el MCP no estaba
> autenticado entonces. Aquélla creó `observacion_rechazo_tasador` y verificó 14 tablas de
> captura; ésta crea la tabla de defaults, habilitada por el cierre de A-27. Dos tandas distintas
> bajo el mismo identificador de plan, con cinco días de diferencia.

---

## Qué se creó

**Tabla `C_DefaultsAntecedentes` · `tblOj7nXcjeouPy09`**

Aloja los valores por defecto de la hoja de antecedentes que el tasador recibe pre-llenados en la
sección E de la Pantalla 5 (spec v1.9.14 §2.8.1 · RF-TAS-23). Particionada por **tipo de propiedad
× estado de uso** (A-27, cerrada por Héctor el 22-ago-2026), con **un registro por (combinación,
`campo_destino`, `atributo`)**.

## Tabla-resumen

| Tabla | Campo | FIELD_ID | Acción |
|---|---|---|---|
| `C_DefaultsAntecedentes` | *(tabla)* | `tblOj7nXcjeouPy09` | **creado** |
| `C_DefaultsAntecedentes` | `clave` (primary) | `fldbKTZStDCrl5Utr` | **creado** |
| `C_DefaultsAntecedentes` | `tipo_propiedad` | `fldNZVhxeoIMGCMiZ` | **creado** |
| `C_DefaultsAntecedentes` | `estado_uso` | `fldnXKVSv2xbPWi2j` | **creado** |
| `C_DefaultsAntecedentes` | `bloque` | `fldUR8GDz3I0Xzc4D` | **creado** |
| `C_DefaultsAntecedentes` | `atributo` | `fld4kwnOUfGtFJx6I` | **creado** |
| `C_DefaultsAntecedentes` | `campo_destino` | `fldZajTzom9Lvxe0Y` | **creado** |
| `C_DefaultsAntecedentes` | `valor_default` | `fldQH8JTWRQMW4Mgx` | **creado** |
| `C_DefaultsAntecedentes` | `catalogo_ref` | `fld0NAJv7E1rLFWVX` | **creado** |
| `C_DefaultsAntecedentes` | `origen` | `fldp8lPwlMe6gKmx5` | **creado** |
| `C_DefaultsAntecedentes` | `activo` | `fldTRdqlHaNJeRrLi` | **creado** |
| `C_DefaultsAntecedentes` | `notas` | `fldHRmQCMEOpqGgbo` | **creado** |
| `M_TiposPropiedad` | *(campo inverso del Link)* | `fldN5ya6IA6j0nM0S` | **creado automáticamente** |
| `C_FactoresHomogeneizacion` | — | `tblep24N9gPMrDPIN` | **sólo lectura** · sin cambios |
| `TX_TerminacionesPorRecinto` | — | `tbleQ7pcLxYx9NbCi` | **sólo lectura** · no se reutiliza |

**Ningún campo quedó `pendiente_ui_manual`.** Los once `create_field` pasaron a la primera; el MCP
no falló en ninguna operación de esta tanda.

**Verificación post-creación.** `get_table_schema` confirma los 11 campos con sus tipos y dominios;
`list_records_for_table` devuelve `totalRecordCount: 0`.

## Lo que NO se hizo

- **No se sembró ninguna fila** (R5). La tabla queda vacía a propósito: los valores exactos se
  revisan antes de escribirlos, y **A-37 bloquea** el sembrado.
- **No se tocó `M_TiposPropiedad`** más allá del campo inverso que el Link genera solo.
- **No se tocó `C_FactoresHomogeneizacion`**: se leyó para dejar su foto (A-18) y nada más.
- **No se tocó código** (R2).

---

## ⚠ A-37 · BLOQUEA EL SEMBRADO — resolver primero

**`M_TiposPropiedad` (`tbl8rxZA14xFIBGU6`) tiene 15 filas y contiene duplicados por
capitalización.**

| Duplicado | Record ID | Observación |
|---|---|---|
| `CASA` | `rec5J0dPImsDm5Leb` | sin `categoria` |
| `Casa` | `recrXDAjlVCe59XBW` | **la única con `categoria = Habitacional`** |
| `DEPARTAMENTO` | `recJ0OIjob9ywogr6` | sin `categoria` |
| `Departamento` | `recf9hz8TbkQ6wsus` | sin `categoria` |

Las once restantes: `ESTACIONAMIENTO`, `OFICINA`, `GALPON`, `EDIFICIO`, `LOCAL COMERCIAL`,
`PILOTO`, `OTRO`, `BODEGA`, `INDUSTRIA`, `TERRENO`, `SITIO`.

El dominio **no coincide** con `ListaTipoPropiedad` del Excel `[Excel: FICHA SOLIC!AD25:AD32]`, que
tiene 8: Casa · Casa Piloto · Departamento · Departamento Piloto · Local Comercial · Oficina ·
Sitio · Terreno.

**Por qué bloquea.** El Link admite cualquiera de las 15 filas, así que crear la tabla no falla.
Pero si el default de "Departamento" se cuelga de `DEPARTAMENTO` y las solicitudes reales linkean
`Departamento`, **el lookup devuelve vacío sin error**: la sección E aparecería sin pre-llenar y
nadie sabría por qué. Es el mismo modo de fallo silencioso de **P-5**.

**Qué hay que decidir antes de sembrar:** contra qué fila se cuelga cada default, y si la maestra
se sanea primero (deduplicar y alinear con el dominio del Excel) o se siembra contra las filas
actuales dejando constancia. Sanear `M_TiposPropiedad` es **tanda propia**: tiene links entrantes
desde `TX_Solicitudes`, `C_PreciosUnitarios`, `C_VidaUtil`, `C_Factores`, `C_Formulas`, `C_SLA`,
`C_ReglasNegocio`, `C_FactoresHomogeneizacion`, `TX_Comparables`, `H_Comparables_Historico` y
`C_Plantillas`, y un merge mal hecho arrastra a todos.

## A-38 · Catálogos de valores admisibles — decidir en el sembrado

Hoy sólo se **referencian** por `catalogo_ref` (ej. `Antecedentes!CE45:CE63`). No se materializan
en esta tabla porque **no dependen de la combinación**: el catálogo de cubierta es el mismo para
departamento nuevo que para casa usada, y alojarlo acá lo duplicaría hasta 16 veces por campo.
Las opciones son tabla hermana `C_CatalogosAntecedentes`, o resolverlos server-side desde una
constante versionada. P7-TAS los necesita para poblar los selects.

## A-39 · Anexo de estado de conservación — fuera de esta tabla

Las 38 filas del anexo `[Excel: Estado Conservación!A7:W46]` llevan **todas** la misma terna
`Bueno` / `Ninguno` / `Funcionando` y **no ramifican por ninguno de los dos ejes**: son constantes.
Alojarlas en una tabla particionada significaría 114 filas idénticas por combinación, que es ruido
y no información. Por eso `bloque` tiene tres opciones y no cuatro.

Se resuelve más adelante con tabla hermana, o declarándolo constante de aplicación. Si se elige lo
primero, agregar la cuarta opción a `bloque` es un `update_field` trivial.

---

## Qué desbloquea esta tanda

**P7-TAS puede construir la sección E con precarga.** El punto de consumo tiene ahora tabla, clave
y tipos reales. Lo que la precarga devolverá hasta que se siembre es **vacío**, que es el
comportamiento correcto declarado en §2.8.1 —no un error—.

## Qué sigue bloqueado

**A-18**, sin relación con esta tanda: `C_FactoresHomogeneizacion.valor_referencia` sigue vacío en
sus 15 filas, de modo que `GET /api/tasaciones/config/defaults` sigue sin construirse. Foto
verificada hoy, sin cambios respecto del 17-ago-2026.
