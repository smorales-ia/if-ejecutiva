# T-MC-P0 · Paquete de paste — pasos vinculantes para Sergio

> Orden ESTRICTO. No saltar pasos. Todo lo de este documento lo ejecuta Sergio
> (writes a Airtable Automations, config y records). Claude dejó el código fuente
> listo en la rama `feat/T-MC-P0` (sin commit).
>
> Base: `app9G7lLkIV3CpeLa`. Automations: AT03_Calculos = `wflSBI7cjLNc0rkV5` ·
> AT03-Ext = `wflQloTxAcjauDEZ9`.

## Precondición
- Commitear (o al menos no perder) el working tree de `feat/T-MC-P0`.
- Tener a mano los archivos fuente modificados:
  `docs/_artefactos/airtable/AT03_Calculos_DAG.js` y
  `docs/_artefactos/airtable/AT03-Ext_script.js`.

---

### 1. BACKUP del DAG actual
Copiar el script VIGENTE de la Automation **AT03_Calculos** (`wflSBI7cjLNc0rkV5`) a
`docs/_backups/AT03_Calculos_DAG_pre-T-MC-P0.js` antes de tocar nada.

### 2. BACKUP de AT03-Ext actual
Copiar el script VIGENTE de la Automation **AT03-Ext** (`wflQloTxAcjauDEZ9`) a
`docs/_backups/AT03-Ext_script_pre-T-MC-P0.js`.

### 3. PEGAR el DAG modificado (H3 lookup)
Pegar `docs/_artefactos/airtable/AT03_Calculos_DAG.js` en la Automation
**AT03_Calculos**. Cambios: handle `H_PreciosUF`, `fecha_visita` en el fetch de la
solicitud, y el guard H3 (lookup UF por `fecha_visita` → `valor_clp`; sin fila o sin
fecha → evento A_Eventos + `throw`; eliminado el `|| 38500`). Guardar y verificar
`deploymentStatus = deployed`.

### 4. PEGAR AT03-Ext modificado (guard origen_dato=tipeado)
Pegar `docs/_artefactos/airtable/AT03-Ext_script.js` en la Automation **AT03-Ext**
(`wflQloTxAcjauDEZ9`). Cambio: antes de escribir cualquier campo destino, si el
registro destino tiene `origen_dato = "tipeado"`, se hace SKIP y se loguea
`skip_origen_tipeado` en A_Eventos. Guardar y verificar `deploymentStatus = deployed`.

> ⚠ Los pasos 3 y 4 deben ir ANTES del 5: el repunte de enrutamiento sin el guard
> `origen_dato=tipeado` live abriría la ventana de contaminación SII.

### 5. REPUNTE de `D_TipoDocumentoAtributo` (3 filas)
Cambiar, en cada fila, **cardinalidad** (`fldWQZyPiU2f47RHm`) y **tabla destino**
(`fldNJh73ocKS3AIrR`):

| recId | atributo (`fldUhfgFj18G0caux`) | cardinalidad: de → a | tabla destino: de → a |
|---|---|---|---|
| `recHzaRLGLOueQWKY` | `foto_fuente_sii__anio_construccion` | una_por_unidad → **una_por_solicitud** | TX_Unidades → **TX_DatosTasacion** |
| `recYwrGMxW0PGqbxe` | `foto_fuente_sii__sup_terreno_m2` | una_por_unidad → **una_por_solicitud** | TX_Unidades → **TX_DatosTasacion** |
| `recycv6hnoK9krfxg` | `foto_fuente_sii__sup_m2` | una_por_unidad → **una_por_solicitud** | TX_Unidades → **TX_DatosTasacion** |

### 6. POBLAR `fecha_visita` en VP-2026-0066
En `TX_Solicitudes` (`recNiwM4s1ibr3sbO`), campo `fecha_visita` (`fldpTBzjfbAw5FSYI`,
ya existe): escribir la fecha REAL de visita. **Sergio decide y confirma esta fecha
antes de continuar** (de ella depende qué fila de `H_PreciosUF` se necesita).

### 7. CARGAR `H_PreciosUF` para esa fecha
En `H_PreciosUF` (`tblWPRuIYfzdlveHM`): nueva fila con `fecha` (`fld2K9OgCpWVXRLM0`) =
la fecha del paso 6, y `valor_clp` (`fldycskkXrywvvIR1`) = UF de ese día (fuente a
criterio de Sergio: sii.cl / mindicador.cl / Banco Central). Sin esta fila el guard H3
aborta el cálculo (comportamiento esperado).

### 8. VERIFICACIÓN pre-cálculo (VP-2026-0066)
Confirmar TODO antes de calcular:
- `fecha_visita` poblada en la solicitud.
- `H_PreciosUF` tiene fila para esa fecha con `valor_clp` > 0.
- 6 ítems en `TX_ItemsCuadroValoracion` con `uf_m2_unitario` **y** `factor_aplicado` poblados.
- 5 overrides de la Sección G capturados si aplica (los 2 nuevos: `valor_reposicion_override`, `valor_seguro_override`).

### 9. DISPARAR `/calcular` contra 0066
Ejecutar el cálculo (UI o corrida manual de la Automation) sobre `recNiwM4s1ibr3sbO`.

### 10. COMPARAR contra oráculo xlsm MET-6283 (±1 %)
Leer las 13 terminales de `TX_Calculos` y comparar con el oráculo (§4/§6 del
`PLAN_T-MC-P0.md`). Reportar tabla **Esperado / Obtenido / Delta%**. Referencias:
Valor Comercial 20 125,86 · Reposición 9 246,94 · Seguro 8 907,06 · Remate 13 081,81 ·
Liquidación 16 603,84 · Avalúo Fiscal 8 517,68. HECHO = 13/13 dentro de ±1 %.

### 11. ROLLBACK si falla
Si el paso 10 no cierra o algo se rompe:
1. Restaurar el DAG desde `docs/_backups/AT03_Calculos_DAG_pre-T-MC-P0.js` (paso 1).
2. Restaurar AT03-Ext desde `docs/_backups/AT03-Ext_script_pre-T-MC-P0.js` (paso 2).
3. Revertir las 3 filas de `D_TipoDocumentoAtributo` a `una_por_unidad` / `TX_Unidades`.
4. `fecha_visita` fue CREADO por decisión de Sergio (Opción A) y ya existía en el
   schema — **no** eliminarlo salvo que se quiera revertir la Opción A por completo;
   si se decide, borrar el campo `fldpTBzjfbAw5FSYI` (o dejarlo, es aditivo e inerte).
