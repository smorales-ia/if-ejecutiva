# Fórmula `semaforo_sla` — corrección manual en Airtable

> Deuda D-01 · ítems 5 y 8 · 29-jul-2026
> **Requiere edición a mano en la UI de Airtable.** El MCP no modifica fórmulas.

## Qué está mal hoy

Campo `semaforo_sla` · `fldW4oUq7LvQUZq7W` · tabla `TX_Solicitudes` (`tblaHTyMHYfmy7Fg6`).

Fórmula actual, tal como la devuelve `get_table_schema`:

```
IF({fecha_entrega}, '? Entregado', IF(DATETIME_DIFF(TODAY(),{fecha_visita},'days')>=3,'? VENCIDO',IF(DATETIME_DIFF(TODAY(),{fecha_visita},'days')>=2,'? EN RIESGO','? OK')))
```

Dos problemas:

1. **Los emoji están mangleados.** Los cuatro literales empiezan por `?` en vez
   del emoji que alguien escribió en su momento. No es un problema de lectura:
   el carácter almacenado ya está corrupto.
2. **`#ERROR` en toda alta nueva.** `DATETIME_DIFF` sobre `{fecha_visita}` vacía
   no da 0, da error. El campo hermano `fecha_limite_entrega`
   (`fldoT1LOSgVRo32TC` = `DATEADD({fecha_visita}, 2, 'days')`) hereda el mismo
   problema.

Consecuencia en la consola: la pestaña "SLA en riesgo" y el filtro de SLA
comparaban contra `"rojo"` / `"ámbar"` / `"verde"`, palabras que esta fórmula
**nunca emitió**, así que devolvían cero filas para toda la tabla. El código ya
se corrigió en la Tanda D-01 para buscar por subcadena (`VENCIDO`, `EN RIESGO`,
`OK`), de modo que **funciona con la fórmula actual y seguirá funcionando con la
corregida**. Esta edición es higiene, no un desbloqueo.

## Fórmula corregida — pegar tal cual

```
IF(
  {fecha_entrega},
  "Entregado",
  IF(
    NOT({fecha_visita}),
    "Sin visita",
    IF(
      DATETIME_DIFF(TODAY(), {fecha_visita}, 'days') >= 3,
      "VENCIDO",
      IF(
        DATETIME_DIFF(TODAY(), {fecha_visita}, 'days') >= 2,
        "EN RIESGO",
        "OK"
      )
    )
  )
)
```

Cambios respecto de la actual, y por qué:

- **Texto plano, sin emoji.** El emoji no aporta nada a una fórmula que se lee
  por código y se corrompe al copiarse entre clientes. Si querés el color, va en
  la vista de Airtable, no en el valor.
- **`NOT({fecha_visita})` → `"Sin visita"`.** Elimina el `#ERROR` y dice la
  verdad: la solicitud no tiene SLA todavía porque el reloj arranca en la
  visita. Es la opción (a) que aprobaste; **no** se re-basa a `fecha_solicitud`.
- Los tres literales operativos (`VENCIDO`, `EN RIESGO`, `OK`) se conservan
  exactamente, porque son los que busca `buildVistaFormula` en
  `lib/solicitudes.ts`. **No los cambies de nombre sin tocar también ese
  archivo.**

`"Sin visita"` no contiene ninguna de las tres palabras, así que esas
solicitudes no caen en "SLA en riesgo" ni en el filtro verde. Es lo correcto: no
tienen SLA que evaluar.

## Pasos

1. Abrí la base **VProperty** (`app9G7lLkIV3CpeLa`) → tabla **`TX_Solicitudes`**.
2. Buscá la columna **`semaforo_sla`**. Clic en el encabezado → **Edit field**.
3. Reemplazá **todo** el contenido del editor por el bloque de arriba.
4. Verificá que el preview no muestre error y guardá con **Save**.
5. Comprobación rápida en la propia grilla:
   - Una solicitud recién creada (`VP-2026-0054`) → **"Sin visita"**.
   - `VP-2026-0004` o `VP-2026-0038` → **"VENCIDO"** (hoy dicen `? VENCIDO`).
6. En la consola, la pestaña **"SLA en riesgo"** debe seguir mostrando las
   mismas ~7 solicitudes que antes de la edición. Si pasa a 0, algún literal se
   escribió distinto: revisá mayúsculas y tildes.

## Opcional, misma sesión: `fecha_limite_entrega`

Si querés eliminar también el `#ERROR` de `fecha_limite_entrega`
(`fldoT1LOSgVRo32TC`), la fórmula equivalente a prueba de vacío es:

```
IF({fecha_visita}, DATEADD({fecha_visita}, 2, 'days'), BLANK())
```

No es urgente: la consola ya **dejó de ordenar por ese campo** en la Tanda D-01,
así que el `#ERROR` no afecta a ninguna superficie. Es cosmético.

## Lo que NO se hizo, y sigue pendiente de decisión de negocio

Ver `20260729-modelo-sla-pendiente.md`. Resumen: el SLA se mide **desde la
visita**, no desde el ingreso, así que una solicitud puede estar semanas sin SLA.
Si el negocio espera un reloj que arranque al crear, eso es un cambio de modelo
—no de fórmula— y hay que decidirlo con Héctor y Óscar.
