# DELTA SC01 · Tanda E — catálogos reales y clave del banco financista

**Fecha:** 27-jul-2026
**Origen:** test de alta interna que produjo `VP-2026-0044` (`recPSdQR1jqK3QiPU`)
**Refs:** RF-04 · BUG A · BUG B · BUG C

---

## 0. Resumen del diagnóstico

El fix de payload snake_case (Tanda B, commit `8ecdeb9`) es correcto. Los tres
bugs observados en `VP-2026-0044` tienen dos causas distintas:

| Bug | Causa | Dónde se arregla |
|---|---|---|
| A · contactos no se crean | **El escenario desplegado en Make es el blueprint viejo** (`{{1.contactosVisita}}`) | Reimportar el blueprint |
| B · cliente/tipo informe/producto vacíos | Catálogos hardcodeados divergentes del maestro | Código (`lib/catalogos.ts`) |
| C · `banco` ambiguo | Clave del payload con nombre semánticamente colisionante | Código + blueprint |

---

## 1. BUG A — el escenario en Make está desactualizado

La condición del Router 16 en el repo **ya es correcta**:

```json
{"name": "contactos_visita existe",
 "conditions": [[{"a": "{{1.contactos_visita}}", "o": "exist"}]]}
```

No tiene ninguna condición extra sobre `estado_contacto`; el filtro es un
`exist` puro sobre la clave. La versión anterior del mismo archivo (commit
`28c797a`) leía `{{1.contactosVisita}}` en camelCase.

La prueba de que Make corre la versión vieja está en el propio registro creado.
Los tres mapeos que cambiaron entre ambas versiones fallaron; todos los demás
funcionaron:

| Mapeo | Blueprint viejo lee | Payload envía | `VP-2026-0044` |
|---|---|---|---|
| Search TipoInforme (mód. 3) | `{{1.tipoInforme}}` | `tipo_informe` | `tipo_informe` vacío |
| Search TipoPropiedad (mód. 4) | `{{1.tipoPropiedad}}` | `tipo_propiedad` | `tipo_propiedad` vacío |
| `monto_estimado_uf` (mód. 7) | `{{parseNumber(1.valorUf)}}` | `valor_uf` | **vacío** (las solicitudes 0040-0043 sí tienen 4200) |
| Filtro + Iterator (mód. 16/17) | `{{1.contactosVisita}}` | `contactos_visita` | filtro no pasa |
| `financiero_valor_total_uf` | `{{1.financiero_valor_total_uf}}` (igual en ambas) | idem | **4200 ✓** |
| `comuna`, `banco`, `banco_financista` | iguales en ambas | idem | ✓ |

`monto_estimado_uf` vacío es el discriminador limpio: la clave existe en el
payload y en el schema, y sólo falla porque el escenario la busca con otro
nombre.

> **Acción manual requerida: reimportar `docs/_artefactos/make/SC01 - Crear
> solicitud.blueprint.json` en Make.com.** Ningún cambio de código arregla el
> BUG A. Tras reimportar hay que revincular la conexión Airtable
> (`__IMTCONN__: 8847431`) y el webhook, y confirmar que
> `MAKE_WEBHOOK_URL_SC01` apunta al hook del escenario reimportado.

### 1.b Defecto secundario en el mismo camino (ya corregido en código)

Aunque el filtro pasara, los contactos se habrían creado mal. El módulo 18
escribe en dos `singleSelect`:

| Campo | Opciones reales | Lo que enviaba la consola |
|---|---|---|
| `rol` (`fldeTuIlU6uxDYwHY`) | `propietario` · `corredor` · `arrendatario` · `conserje` · `otro` | `Corredor` |
| `estado_contacto` (`fldMerAz4OCNhwn4X`) | `valido` · `no_contesta` · `telefono_erroneo` | `Válido` |

El módulo 18 tiene `typecast: true`, así que Airtable **no falla**: crea la
opción que falta. Ambos campos ya arrastran dos opciones basura con el JSON
completo de un contacto como nombre —`{"nombre":"Carolina Andrea Chandía
Muñoz",…}`— creadas por una corrida vieja que mapeaba el bundle entero del
Iterator en vez de `{{17.rol}}`.

Corregido en `lib/console-data.ts`: `ROLES_CONTACTO_VISITA` y
`ESTADOS_CONTACTO` pasan a `{ value, label }` con el slug real como `value`.

> **Pendiente de aprobación (schema)**: borrar las 4 opciones basura de `rol` y
> `estado_contacto`. No se toca sin visto bueno explícito.

---

## 2. BUG B — los catálogos no existían en las tablas maestras

Los selects cargaban desde listas hardcodeadas en `lib/console-data.ts`,
heredadas del mock v0 y nunca contrastadas contra Airtable. Verificado vía MCP:

| Select | Enviaba | `M_*` real |
|---|---|---|
| Cliente | `Banco Santander` | ❌ — `M_Clientes` (90 filas) tiene `Santander Hipotecaria`, `Banco Estado`, `Banco de Chile`, `Scotiabank`, `Banco Itaú`, `BCI Mutuos`… |
| Tipo de informe | `Tasación hipotecaria` | ❌ — `M_TiposInforme` (8): `Pericial`, `Compraventa`, `Mutuo Hipotecario`, `Comercial`, `Leasing Habitacional`, `Piloto`, `Refinanciamiento`, `Seguro`. **Cero coincidencias.** |
| Producto | `hipotecario` | ❌ — `M_Productos` (7): `Credito Hipotecario`, `Refinanciamiento`, `Refinanciamiento Hipotecario`, `Leasing Habitacional`, `Compraventa`, `Seguro Incendio`, `Pericial Judicial` |
| Tipo de propiedad | `Departamento` | ✅ — `M_TiposPropiedad` tiene `DEPARTAMENTO` y la fórmula usa `UPPER()`. **Falló por el BUG A, no por el catálogo.** |
| Banco financista | `BCI`, `Itaú`, `Scotiabank`, `Banco BICE` | ❌ — `M_Bancos` (14) tiene `Banco BCI`, `Banco Itau`, `Scotiabank Chile`, `BICE Hipotecaria` |

Los 5 módulos de Search usan `UPPER({nombre}) = UPPER("…")` con `maxRecords: 1`.
Cuando no encuentran nada Make **no falla**: devuelve cero bundles y el módulo 7
escribe el link vacío. De ahí que el alta se cree sin error visible.

### Fix

Los 5 catálogos se leen de Airtable en runtime:

```
lib/catalogos.ts  (server · filtra activo=TRUE · dedupe por UPPER · caché 5 min)
      ↓
app/api/catalogos/route.ts  (GET · detrás de Clerk)
      ↓
lib/use-catalogos.ts  (hook cliente · promesa compartida entre componentes)
      ↓
new-request-sheet.tsx · editar-solicitud-form.tsx · solicitud-list.tsx
```

Se mantiene el contrato por nombre (no por `recXXX`): SC01 resuelve con Search y
cambiar eso obliga a reescribir 5 módulos. Lo que se garantiza ahora es que el
nombre que viaja **existe** en la tabla.

### Lo que se eliminó a propósito

`TIPOS_INFORME_POR_CLIENTE` y `PRODUCTOS_POR_CLIENTE` desaparecen: ni
`M_TiposInforme` ni `M_Productos` tienen relación con `M_Clientes` en el schema
real (el link `M_Clientes.productos` está poblado en 1 de 90 filas). El filtrado
por cliente era una regla inventada por la UI, contra el principio rector. Los
dos selects dejan de depender de haber elegido cliente primero.

`PRODUCTOS_CON_BANCO` y `PRODUCTOS_VENDEDOR_COINCIDE` se rekeyaron a los nombres
reales; antes contenían slugs (`hipotecario`) que no existían en ninguna fila, o
sea que el campo "Banco financista" nunca se mostraba con datos reales.

---

## 3. BUG C — `banco` vs `banco_id`

El payload llevaba dos claves para dos bancos distintos:

- `banco_id` → banco **originador** (slug de `M_BANCOS` en la UI) → módulo 7 lo
  escribe en el campo de texto `banco` (`fldAgTlFXeXWfGTdI`).
- `banco` → banco **financista** (nombre visible) → módulo 9 lo resuelve al link
  `banco_financista` (`fldxcfdKRctHCgwmB`).

Funcionaba (en `VP-2026-0044`: `banco = "banco_estado"` y `banco_financista →
Banco Santander`), pero leer `{{1.banco}}` en el blueprint no deja ver cuál de
los dos bancos es.

`banco` → **`banco_financista_nombre`** en el mapper. El originador sigue en
`banco_id`. Requiere el cambio correlativo en el módulo 9, ya aplicado al
blueprint del repo:

```diff
- "formula": "UPPER({nombre}) = UPPER(\"{{1.banco}}\")"
+ "formula": "UPPER({nombre}) = UPPER(\"{{1.banco_financista_nombre}}\")"
```

> Este cambio **también exige la reimportación** del punto 1. No se puede
> desplegar el código sin reimportar: `banco_financista` quedaría vacío.

---

## 4. Orden de despliegue

1. Reimportar el blueprint en Make (cubre BUG A y BUG C).
2. Revincular conexión Airtable y webhook; verificar `MAKE_WEBHOOK_URL_SC01`.
3. Desplegar el código.
4. Alta de prueba y verificar en `TX_Solicitudes`: `cliente`, `tipo_informe`,
   `tipo_propiedad`, `producto`, `banco_financista`, `monto_estimado_uf` y filas
   en `TX_ContactosVisita`.
