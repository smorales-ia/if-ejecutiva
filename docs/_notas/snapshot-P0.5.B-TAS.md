# Snapshot · P0.5.B-TAS — Saneamiento de `M_TiposPropiedad`

> **Fecha** — 22-ago-2026. **Rama** — `feat/tasador-ui`. **Base** — `app9G7lLkIV3CpeLa`.
> **Tabla** — `M_TiposPropiedad` · `tbl8rxZA14xFIBGU6`.
> **Contrato** — 🔴 pausa-total extrema. Ocho pausas `s/n` más una manual, ninguna rechazada.
> **Estado** — ✅ **completa**. **A-37 cerrada.** El sembrado de `C_DefaultsAntecedentes` queda
> desbloqueado.

---

## El hallazgo que cambió la naturaleza del problema

A-37 se registró como "duplicados por capitalización". El conteo de links entrantes mostró algo
peor: **los duplicados no estaban solapados, y la línea de corte era la frontera
transacciones / configuración.**

| Fila | Solicitudes | Configuración |
|---|---|---|
| `CASA` | **6** | 0 |
| `Casa` | 0 | **32** |
| `DEPARTAMENTO` | **20** | 0 |
| `Departamento` | 0 | **1** |

Ninguna fila tenía los dos tipos de link. El mundo transaccional escribía en MAYÚSCULAS y el de
configuración en Title Case. La consecuencia: **ninguna de las 39 solicitudes con tipo de propiedad
poblado podía resolver su regla de negocio, su tramo de vida útil, su precio unitario ni su SLA por
ese eje** — la configuración colgaba de una fila que ninguna solicitud referenciaba.

No era deuda cosmética pendiente de sembrado: era una desconexión funcional viva en la base, que el
sembrado habría heredado. Los timestamps lo respaldan: las 15 filas se crearon el mismo día
(09-jun-2026), la configuración colgó del bloque inicial y las solicitudes reales de jul–ago-2026
fueron a las filas en mayúsculas.

---

## Foto antes / después

**Antes: 15 filas** (todas `activo = true`), 72 referencias vivas, dominio mezclado.

**Después: 15 filas** — 9 activas, 6 en baja lógica. Mismo total por coincidencia: se borraron 2 y
se dieron de alta 2.

| # | `nombre` | Record ID | Estado | Links |
|---|---|---|---|---|
| 1 | `Casa` | `recrXDAjlVCe59XBW` | activa | **38** |
| 2 | `Departamento` | `recf9hz8TbkQ6wsus` | activa | **21** |
| 3 | `Bodega` | `rechtTVCD9YbfD08T` | activa | **8** |
| 4 | `Oficina` | `rec3zizQ4VNa3VZBo` | activa | **5** |
| 5 | `Casa Piloto` | `recoCHaCWolPWtgeW` | activa · **nueva** | 0 |
| 6 | `Departamento Piloto` | `reck6cHbNAcmJPj8X` | activa · **nueva** | 0 |
| 7 | `Local Comercial` | `recPiUiPFgQblO4HQ` | activa | 0 |
| 8 | `Sitio` | `recuRG89tkR7srCS2` | activa | 0 |
| 9 | `Terreno` | `recuHxhPUhS5HxdHP` | activa | 0 |
| 10 | `EDIFICIO` | `rec9t6YyVzvRAUdHE` | **baja lógica** | 0 |
| 11 | `ESTACIONAMIENTO` | `rec1K8CFwYioHAdwE` | **baja lógica** | 0 |
| 12 | `GALPON` | `rec8eeyZUpXU8P6s5` | **baja lógica** | 0 |
| 13 | `INDUSTRIA` | `recloRBc7s99pLg7x` | **baja lógica** | 0 |
| 14 | `OTRO` | `reccoaabDUvg7O79h` | **baja lógica** | 0 |
| 15 | `PILOTO` | `recS12nTcW9HxAmMo` | **baja lógica** | 0 |
| — | ~~`CASA`~~ | ~~`rec5J0dPImsDm5Leb`~~ | **eliminada** | — |
| — | ~~`DEPARTAMENTO`~~ | ~~`recJ0OIjob9ywogr6`~~ | **eliminada** | — |

**Dominio activo = las 8 de `ListaTipoPropiedad` `[Excel: FICHA SOLIC!AD25:AD32]` más `Bodega`**,
que no está en el Excel pero tiene 8 solicitudes reales (**A-40**).

**Convención fijada: Title Case.** Las 6 filas en baja conservan mayúsculas a propósito — son
retiradas, no parte del dominio vigente, y la diferencia visual lo hace evidente en la grilla.

---

## Log de migraciones · Grupo A

| Tabla origen | Campo | Registros | De | A |
|---|---|---|---|---|
| `TX_Solicitudes` | `tipo_propiedad` (`fld701TB0LXovvQmt`) | **6** | `CASA` `rec5J0dPImsDm5Leb` | `Casa` `recrXDAjlVCe59XBW` |
| `TX_Solicitudes` | `tipo_propiedad` (`fld701TB0LXovvQmt`) | **20** | `DEPARTAMENTO` `recJ0OIjob9ywogr6` | `Departamento` `recf9hz8TbkQ6wsus` |

**26 links migrados**, ninguna otra tabla requirió migración: las once restantes no referenciaban
las filas eliminadas.

*Solicitudes migradas a `Casa`*: VP-2026-0027, 0034, 0039, 0043, 0059, 0060.
*Solicitudes migradas a `Departamento`*: VP-2026-0024, 0025, 0026, 0028, 0029, 0030, 0032, 0038,
0040, 0041, 0042, 0045, 0046, 0047, 0049, 0050, 0051, 0052, 0053, 0055.

**Riesgo descartado antes de ejecutar, no mitigado:** `update_records_for_table` sobre un Link
reemplaza el array completo. Se verificó que las 39 solicitudes tenían **exactamente un** elemento,
de modo que no había nada que perder al reescribir.

---

## Log de borrados y bajas

**Borrados (2)** — sólo tras verificar conteo 0 en las 12 tablas (R1):

| Fila | Record ID | Verificación previa |
|---|---|---|
| `CASA` | `rec5J0dPImsDm5Leb` | 0 links en las 12 tablas · confirmado por lectura |
| `DEPARTAMENTO` | `recJ0OIjob9ywogr6` | 0 links en las 12 tablas · confirmado por lectura |

**Bajas lógicas (6)** — `activo = false`, reversibles (R6): `ESTACIONAMIENTO`, `GALPON`,
`EDIFICIO`, `INDUSTRIA`, `OTRO`, `PILOTO`. Ninguna tenía links; se prefirió la baja al borrado
porque una fila con 0 links hoy pudo estar referenciada históricamente.

**Renombrados (5)** — preservan links, no son migración: `OFICINA`→`Oficina` (5 solicitudes
intactas), `BODEGA`→`Bodega` (8 intactas), `LOCAL COMERCIAL`→`Local Comercial`, `SITIO`→`Sitio`,
`TERRENO`→`Terreno`.

**Altas (2)**: `Casa Piloto` y `Departamento Piloto`, con `categoria = Habitacional` por analogía
con `Casa`, que es la única fila preexistente que la tenía poblada.

**Ningún `pendiente_ui_manual`.** Las ocho operaciones MCP pasaron a la primera.

---

## Verificación de dependencias sobre el primary field

`nombre` es el campo primario, y renombrarlo rompe cualquier comparación por literal. Dos
verificaciones antes del Grupo B:

**1. Grep sobre `lib/`, `app/` y `docs/_artefactos/make/` — cero coincidencias** de los literales
entrecomillados. Ningún módulo ni blueprint compara contra estos nombres.

La búsqueda ampliada encontró `'Departamento'` y `'Bodega'` en `lib/adjuntos-destino.test.ts`, pero
como `tipoBien` — el dominio de `M_TiposDeBien`, otra tabla. Sin impacto.

**2. Automations — verificadas manualmente por Sergio** en la UI de Airtable. El MCP no puede leer
el estado ni el código de una Automation (limitación conocida de `CLAUDE.md`), así que esta
verificación no era automatizable. Ninguna filtra por los nombres literales renombrados.

### `lib/catalogos.ts` — el saneamiento mejora el código existente

`lib/catalogos.ts:43-44` documenta un workaround para este mismo duplicado, y `claveDedupe()`
normaliza a mayúsculas conservando la primera fila que llega.

- **Antes**: cuál de las dos ganaba dependía del orden en que Airtable devolviera los registros. El
  nombre que viajaba a SC01 era **no determinista**.
- **Después**: con una sola fila, la deduplicación es un no-op y el nombre es estable.
- **Las 6 bajas lógicas desaparecen solas del dropdown de alta**, porque el módulo ya filtra por
  `{activo} = TRUE()`. No hizo falta tocar nada.

**Deuda registrada**: el comentario de `lib/catalogos.ts:43-44` queda factualmente desactualizado
—afirma que la tabla tiene `DEPARTAMENTO` y `Departamento`—. **No se corrigió** (R5: es código).
Anotado en **CI-049**.

---

## Qué desbloquea

**A-37 cerrada** → el sembrado de `C_DefaultsAntecedentes` (`tblOj7nXcjeouPy09`) puede arrancar.
Los defaults se cuelgan de `Casa` (`recrXDAjlVCe59XBW`) y `Departamento` (`recf9hz8TbkQ6wsus`), sin
ambigüedad de fila.

**Efecto colateral valioso, fuera del alcance de esta tanda**: las 39 solicitudes ahora resuelven su
configuración por tipo de propiedad. Reglas de negocio, vida útil, precios unitarios y SLA quedaron
conectados con las transacciones que los necesitan. **Conviene verificar el motor de cálculo sobre
una solicitud real** —no lo hace esta tanda, que es de schema— porque el comportamiento cambió.

## Ambigüedad nueva

**A-40** · `Bodega` y `ESTACIONAMIENTO` solapan conceptualmente con `M_TiposDeBien`. No bloquea.
