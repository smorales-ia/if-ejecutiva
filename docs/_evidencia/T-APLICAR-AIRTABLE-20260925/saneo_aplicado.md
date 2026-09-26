# SANEO APLICADO — T-APLICAR-AIRTABLE-20260925

> Ejecución del **punto 3 (saneo de datos)** de
> `docs/_analisis/CIERRE_T-ARREGLOS-DOCS-20260925.md` §3 (pasos 7-10).
> Base `app9G7lLkIV3CpeLa`. Aplicado 2026-09-25 vía REST API con `AIRTABLE_TOKEN`
> server-side (fallback RO-30 — el OAuth del MCP no se pudo completar en la sesión).
> Todos los cambios verificados releyendo el registro. Estado original en `rollback.md`.
>
> **Fuera de esta tanda (por diseño):** paste de scripts (UF/AT03), edición de
> `C_Formulas`, Test/activar automations, Make, decisión A4. Van en
> `docs/_analisis/PASOS_UI_UF_MOTOR_20260925.md` (pasos manuales de Sergio).

---

## A · Modificaciones (PATCH) — §3 pasos 7, 8

| # | Tabla / record | Campo | Antes | Después |
|---|---|---|---|---|
| A1 | C_AutomationsAirtable `recqlVivdf6evD7SB` (AT02) | `estado` | `Activo` | `Undeployed` |
| A2 | C_AutomationsAirtable `recqvXu6hZ9SGL2ZZ` (AT04) | `estado` | `Activo` | `Undeployed` |
| A3 | C_AutomationsAirtable `recxWkj3x8tzqzHmo` (AT08) | `notas` | *(vacío)* | "Draft undeployed · script pendiente de paste…" (estado se **mantiene** `Inventariado`) |
| A4 | A_DecisionesMotor `rec8lxTwMAqXyncex` | `solicitud_codigo` | `VP-NaN-0066` | `VP-2026-0066` |
| A5 | Z_EscenariosMake `rec9Y9qpxNcptaivi` (SC01_Airtable_Make) | `notas` | *(vacío)* | Aclaración alias E1 (5748459 ≠ SC01 real 6483077) |

**A1/A2 · sobre `Undeployed`.** El campo `estado` es `singleSelect` con opciones
originales `[Inventariado, Activo, Pendiente, Inactivo]` — **no existía "undeployed"**.
El doc §3 pide reflejar el estado real "undeployed". Se creó la opción `Undeployed`
usando `typecast:true` (autorizado por la tanda), fiel al literal del doc. A cada fila
se le agregó nota explicando el motivo (draft, nunca deployed; MCP `list_automations`).

**A3 · AT08.** El doc §3 solo pide "actualizar nota" para AT08 (no el estado). Su
`estado` era `Inventariado` y se mantuvo intacto; solo se pobló `notas`.

## B · Borrado (DELETE) — §3 paso 9

| # | Tabla / record | Resultado |
|---|---|---|
| B1 | TX_DocumentosGenerados `recrsrf5lfLBqxNDk` (seed demo CI-024, Link `solicitud` vacío) | `{deleted:true}` · verificado (GET posterior → 403/no encontrado) |

Contenido completo pre-borrado guardado en `rollback.md` §B1 (recreable).

## C · Filas nuevas (POST)

### C1 · C_AutomationsAirtable (`tblYYtKEaPgH7GfY0`) — §3 paso 7 · 4 filas
| codigo | record id nuevo | estado | workflow |
|---|---|---|---|
| AT03-Ext | `recsLNEmbyAEevEJp` | Activo | `wflQloTxAcjauDEZ9` |
| AT-RF09-Trigger | `recZT9hVTtL1JTW7B` | Activo | `wflIEucD1MxxcNXH8` |
| AT-RF09-Trigger-Update | `recHLLCLxFfI4S0LI` | Activo | `wfl7O0QDAtma54ceO` |
| CRON_UF_Diaria | `recp4s6rqUbFTcoTd` | Pendiente | `wflQ9NC7dHcuY6Hh0` |

Total C_AutomationsAirtable: 10 → **14 filas**.

### C2 · Z_EscenariosMake (`tblYfmDoaq7Z3Vh6P`) — §3 paso 10 · 5 filas
| nombre | record id nuevo | scenario | estado |
|---|---|---|---|
| SC-SLA-Envio | `recKcJzEih4gXP1Vs` | 7597712 | Inactivo |
| SC-Asignar | `reciHs6xVaBceKOPU` | 6681939 | Activo |
| SC-Edicion | `recsLBZgHmdJU4g4V` | 6682031 | Activo |
| SC-Adjuntos-Upload | `rec7USmm3jYzB8A7N` | 6839979 / 6527528 | Activo |
| SC-RF09 | `recZ62mHdRWjQgLZZ` | 6554321 | Activo |

Total Z_EscenariosMake: 11 → **16 filas**.
`SC-Adjuntos-Upload`: `make_scenario_id` numérico dejado vacío a propósito (dos
escenarios activos, ninguno canónico); ambos ids quedan en `scenario_id_make` (texto).

**Para revertir toda la tanda:** borrar los 9 record ids de C1/C2, recrear B1 con el
JSON de `rollback.md`, y volver A1–A5 a sus valores originales (`rollback.md` §A).

---

## D · Desvíos reportados (regla "detener y reportar")

1. **`Undeployed` no era opción del select.** El doc §3 dice "→ real undeployed" pero
   `estado` no tenía ese valor. Resuelto con `typecast:true` (autorizado) creando la
   opción `Undeployed`. No se stopeó porque el estado ORIGINAL sí coincidía con el doc
   (`Activo`) y typecast estaba explícitamente permitido para este caso.

2. **"Actualizar la descripción de CRON_UF_Diaria (dice 'PENDIENTE placeholder')" (§3
   paso 7) — parcialmente fuera del alcance de escritura.** No existía ninguna fila
   `CRON_UF_Diaria` en C_AutomationsAirtable (se creó ahora, con descripción correcta,
   sin placeholder). El texto "PENDIENTE placeholder" vive en la **descripción de la
   propia Automation en la UI de Airtable** (creada como shell vía MCP), que **no es
   editable por REST API** (nodo read-only). Queda como paso manual de Sergio al pegar
   el script (anotado en `PASOS_UI_UF_MOTOR_20260925.md`).

3. **SC01_Airtable_Make — corrección mínima.** Su `descripcion` ya decía correctamente
   "desde Tally F1" (o sea, ya describía E1, no estaba confundida). La única acción
   necesaria era documentar el alias en `notas` (5748459 = E1 ≠ SC01 real 6483077). No
   se tocó `nombre`/`estado`/`descripcion`. Nota lateral: su `estado` sigue
   `En_construccion` (el doc §3 no pidió cambiarlo; CLAUDE.md marca E1 inactivo — se deja
   como observación, sin tocar).

4. **Vía de escritura.** Todo el saneo se aplicó por REST API porque el OAuth del MCP
   Airtable devolvió `error=invalid_request` (PKCE) en el callback y no pudo completarse.
   El `AIRTABLE_TOKEN` server-side es el mismo de producción; RO-30 lo admite como
   fallback declarando el motivo.

5. **La fila vacía huérfana `recrQdCDkJvGgxClK` de H_PreciosUF NO se tocó.** No es parte
   del punto 3 (el CIERRE la deja como paso manual de Sergio tras el deploy del cron, que
   ya la ignora). Anotada en los pasos UI.
