# PASOS EN LA UI — Encender Robot UF y Motor (AT03)

> Para Sergio. Estos pasos **no** los puede hacer Claude: requieren pegar scripts,
> editar `C_Formulas` y correr **Test** + activar en la UI de Airtable (el MCP no puede).
> Fuente: `docs/_analisis/CIERRE_T-ARREGLOS-DOCS-20260925.md` §3, pasos 1-6.
> El saneo de datos (pasos 7-10) **ya quedó aplicado** por la tanda
> T-APLICAR-AIRTABLE-20260925 (ver `docs/_evidencia/T-APLICAR-AIRTABLE-20260925/`).

> ⚠ **ANTES de pegar cualquier script:** desactivá la **traducción automática del
> navegador** (Chrome suele traducir la página y corrompe el código al pegar). Botón
> derecho → "Mostrar siempre en el idioma original", o desactivá Google Translate en
> esta pestaña. Pegá el script tal cual, sin que el navegador lo toque.

---

## BLOQUE 1 · Robot UF (con dólar)

**Automation destino:** `CRON_UF_Diaria` (workflow `wflQ9NC7dHcuY6Hh0`).
**Script a pegar:** `docs/_artefactos/airtable/CRON_UF_Diaria.js` (contenido íntegro).

1. Airtable → **Automations** → abrir `CRON_UF_Diaria`.
2. (Trigger) Confirmar *At a scheduled time* → diario **08:00 America/Santiago**.
   No programarlo entre 21:00 y 00:00 hora chilena.
3. Acción **Run a script** → borrar lo que haya y **pegar el contenido completo** de
   `docs/_artefactos/airtable/CRON_UF_Diaria.js`.
   *(Aprovechá y corregí la descripción de la automation si aún dice "PENDIENTE
   placeholder" — poné algo como "Puebla H_PreciosUF con UF + dólar desde mindicador".)*
4. Botón **Test**. Esperar en el log:
   `UF-diaria: fin · nuevas=N · backfill_dolar=M · sin_dolar=K · fallidas_uf=0`
   y que `H_PreciosUF` tenga fila de hoy con `valor_clp` ~41.000, `tipo_cambio_usd`
   ~950-970, `fuente = mindicador`.
5. **Activar** la automation.
6. **Borrar la fila vacía huérfana** `recrQdCDkJvGgxClK` en `H_PreciosUF` si sigue ahí
   (el script ya la ignora, pero conviene limpiarla).
7. (Al día siguiente) Verificar: fila de hoy correcta; filas de fin de semana con nota
   de arrastre de dólar ("dolar de yyyy-mm-dd (ultimo habil disponible)").

---

## BLOQUE 2 · Motor (AT03) — fórmulas + script

> **Orden importa:** primero las 2 fórmulas de `C_Formulas`, después el script AT03,
> y recién ahí Test + activar. El script AT03 y las fórmulas son un par acoplado:
> pegá el script **después** de editar las fórmulas, en la misma sesión.

### Paso 2.1 · Editar la fórmula `F_UFm2_promedio`
Tabla `C_Formulas` (`tblNFa454fBbqRB3t`) · record `recFcpOeKjXNunBlj`.
Ya está linkeada a las 6 reglas activas — no toques los links.

| Campo | Valor ACTUAL (antes) | Valor NUEVO (después) |
|---|---|---|
| `expresion` | `uf_m2_promedio_residencial_comuna` | `n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna` |
| `variable_output` | `uf_m2_promedio` | `promedio_uf_m2_muestra` |
| `version` | `v3.1` | `v3.2` |

Copiá y pegá exacto la nueva `expresion`:
```
n_comparables > 0 ? promedio_uf_m2_muestra : uf_m2_promedio_residencial_comuna
```

### Paso 2.2 · Crear la fórmula nueva `F_DesviacionVsPromedio`
En `C_Formulas`, **New record**, con estos valores exactos:

| Campo | Valor |
|---|---|
| `nombre` | `F_DesviacionVsPromedio` |
| `variable_output` | `desviacion_vs_promedio_pct` |
| `expresion` | *(ver bloque de abajo)* |
| `orden_topologico` | `90` |
| `unidad_output` | `%` |
| `version` | `v1.0` |
| `activa` | ✅ (marcada) |

`expresion` (copiá exacto):
```
(n_comparables > 0 && promedio_uf_m2_muestra > 0 && sup_construccion_m2 > 0) ? ((valor_comercial_uf / sup_construccion_m2) / promedio_uf_m2_muestra - 1) * 100 : 0
```

Después de crearla, **linkeala a las mismas 6 reglas** que usa `F_UFm2_promedio`
(las mismas 6 reglas activas). No crear columnas en `TX_Calculos` — el DAG escribe
filas por fórmula, no columnas.

### Paso 2.3 · Pegar el script AT03 y activar
**Automation destino:** `AT03` (`AT03_Calculos_DAG`, record catálogo `recwf1aEvWPU0XglE`).
**Script a pegar:** `docs/_artefactos/airtable/AT03_Calculos_DAG.js` (v11.2.0_v32b1).

1. (Recordá desactivar la traducción del navegador.)
2. Airtable → Automations → `AT03` → acción **Run a script** → pegar el contenido
   completo de `docs/_artefactos/airtable/AT03_Calculos_DAG.js`.
3. Botón **Test** con una solicitud **CON comparables** (p.ej. `VP-2026-0067`).
   Esperar en el log: `COMPARABLES: filas=… promedio_uf_m2=…` y filas nuevas en
   `TX_Calculos`.
4. Probar además una solicitud **SIN comparables**: debe calcular igual (promedio 0,
   `n_comparables=0`, sin abortar).
5. **Activar** la automation.

---

## Recordatorio de dependencia (UF ↔ Motor)

El guard **H3** del AT03 aborta la tasación si no hay fila de `H_PreciosUF` para la
`fecha_visita`. Por eso conviene tener el **Robot UF activo y con datos** (Bloque 1)
**antes** de activar el AT03 (Bloque 2). Si hay visitas antiguas sin fila de UF, subí
temporalmente `LOOKBACK_DIAS` en `CRON_UF_Diaria.js` (p.ej. a 60), corré Test una vez,
y devolvelo a 7.

---

## Nota — qué NO hace falta que toques (ya aplicado)

El saneo de datos (correcciones de estado, filas de inventario, `VP-2026-0066`, borrado
del seed demo) ya está aplicado y verificado. Detalle en
`docs/_evidencia/T-APLICAR-AIRTABLE-20260925/saneo_aplicado.md`.
