# ROLLBACK — T-APLICAR-AIRTABLE-20260925

> Estado ORIGINAL de cada registro que esta tanda modifica, borra o crea en
> Airtable (base `app9G7lLkIV3CpeLa`), capturado vía REST API **antes** de
> aplicar el saneo del punto 3 de `docs/_analisis/CIERRE_T-ARREGLOS-DOCS-20260925.md`.
> Con esta información se puede deshacer o recrear cualquier cambio.
>
> **Vía de escritura:** REST API con `AIRTABLE_TOKEN` server-side (fallback RO-30).
> Motivo del fallback: el OAuth del MCP Airtable no pudo completarse en esta sesión
> (el callback volvió con `error=invalid_request`). El token es el mismo que usa la
> app en producción.
>
> Captura: 2026-09-25.

---

## A · Registros que se MODIFICAN (PATCH) — valores originales

### A1 · C_AutomationsAirtable `recqlVivdf6evD7SB` (AT02_Asignar_Tasador)
Tabla `tblYYtKEaPgH7GfY0`. Campos que se tocan: `estado`, `notas`.
- `estado` ORIGINAL = `"Activo"`
- `notas` ORIGINAL = *(vacío / sin valor)*
- Otros campos (no se tocan): `codigo="AT02"`, `nombre_automation="AT02_Asignar_Tasador"`, `tipo="Script"`, `disparador="TX_Solicitudes.estado = creada (post AT01)"`, `descripcion="Filtra M_Tasadores por zona+carga, asigna el de menor carga, registra en A_Eventos"`.
- **Para deshacer:** `PATCH` `estado="Activo"` y `notas=""` (o quitar el campo).

### A2 · C_AutomationsAirtable `recqvXu6hZ9SGL2ZZ` (AT04_Validar_Rangos)
Tabla `tblYYtKEaPgH7GfY0`. Campos que se tocan: `estado`, `notas`.
- `estado` ORIGINAL = `"Activo"`
- `notas` ORIGINAL = *(vacío / sin valor)*
- Otros (no se tocan): `codigo="AT04"`, `tipo="Script"`, `disparador="TX_Calculos insert"`, `descripcion="Formula+Automation: flag revision si valor fuera de rango comunal"`.
- **Para deshacer:** `PATCH` `estado="Activo"` y `notas=""`.

### A3 · C_AutomationsAirtable `recxWkj3x8tzqzHmo` (AT08_alertas_sla)
Tabla `tblYYtKEaPgH7GfY0`. Campo que se toca: `notas` (el `estado` NO se toca).
- `estado` ORIGINAL = `"Inventariado"` (se mantiene)
- `notas` ORIGINAL = *(vacío / sin valor)*
- **Para deshacer:** `PATCH` `notas=""`.

### A4 · A_DecisionesMotor `rec8lxTwMAqXyncex`
Tabla `tbluQQtXUI0Zd8jiN`. Campo que se toca: `solicitud_codigo`.
- `solicitud_codigo` ORIGINAL = `"VP-NaN-0066"`
- (El Link `solicitud` apunta a `recNiwM4s1ibr3sbO` — no se toca.)
- **Para deshacer:** `PATCH` `solicitud_codigo="VP-NaN-0066"`.

### A5 · Z_EscenariosMake `rec9Y9qpxNcptaivi` (SC01_Airtable_Make)
Tabla `tblYfmDoaq7Z3Vh6P`. Campo que se toca: `notas` (solo se agrega la aclaración del alias; nada más se toca).
- `notas` ORIGINAL = *(vacío / sin valor)*
- Otros (no se tocan): `make_scenario_id=5748459`, `nombre="SC01_Airtable_Make"`, `estado="En_construccion"`, `codigo_escenario="SC01"`, `trigger_tipo="Webhook"`, `descripcion="Valida nueva solicitud externa desde Tally F1. Crea TX_Solicitudes."`, `webhook_url`/`url_webhook="https://hook.eu1.make.com/m4amqs7a72eebvsityd9ec7wkn9hb3rw"`, `scenario_id_make="5748459"`.
- **Para deshacer:** `PATCH` `notas=""`.

---

## B · Registro que se BORRA (DELETE) — contenido completo para recrear

### B1 · TX_DocumentosGenerados `recrsrf5lfLBqxNDk` (seed demo CI-024)
Tabla `tbl5sYnGPZXgYCBSY`. `createdTime` original: `2026-06-01T02:39:30.000Z`.
Contenido COMPLETO (para recrear idéntico si hiciera falta):
```json
{
  "clave_natural": "METLIFE-6283|doc|preliminar|v1",
  "plantilla_usada": ["recbC79jChtK5M9fX"],
  "url_pdf": "https://www.dropbox.com/scl/VProperty/Tasaciones/Vergara_METLIFE-6283.pdf",
  "version_doc": 1,
  "es_vigente": true,
  "fecha_creacion": "2026-06-01T02:39:30.000Z",
  "doc_id": 1,
  "generado_en": "2026-06-01T10:06:33.412Z"
}
```
- El campo Link `solicitud` estaba **vacío** (por eso es huérfana; motivo de borrado, §3 punto 9).
- **Para deshacer:** `POST` a `tbl5sYnGPZXgYCBSY` con el JSON de arriba (Airtable asignará un `id` nuevo; `doc_id`/`fecha_creacion` son escribibles según su tipo — `doc_id` es número, `fecha_creacion` fecha).

---

## C · Registros que se CREAN (POST) — para deshacer, BORRARLOS

Estas filas no existían. La reversión es borrar los `id` que devuelva Airtable al
crearlas; esos `id` quedan listados en `saneo_aplicado.md` (sección C y D).

### C1 · C_AutomationsAirtable (`tblYYtKEaPgH7GfY0`) — 4 filas nuevas
- `AT03-Ext` (workflow `wflQloTxAcjauDEZ9`)
- `AT-RF09-Trigger` (workflow `wflIEucD1MxxcNXH8`)
- `AT-RF09-Trigger-Update` (workflow `wfl7O0QDAtma54ceO`)
- `CRON_UF_Diaria` (workflow `wflQ9NC7dHcuY6Hh0`)

### C2 · Z_EscenariosMake (`tblYfmDoaq7Z3Vh6P`) — 5 filas nuevas
- `SC-SLA-Envio` (scenario 7597712)
- `SC-Asignar` (scenario 6681939)
- `SC-Edicion` (scenario 6682031)
- `SC-Adjuntos-Upload` (scenarios 6839979 / 6527528)
- `SC-RF09` (scenario 6554321)

**Para deshacer toda la tanda:** revertir A1–A5 a sus valores ORIGINALES, recrear B1
con el JSON, y borrar los `id` nuevos de C1/C2 (listados en `saneo_aplicado.md`).
