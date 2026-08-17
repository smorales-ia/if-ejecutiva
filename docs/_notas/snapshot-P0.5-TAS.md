# Snapshot · P0.5-TAS — Schema Airtable IF-03

> **Fecha:** 2026-08-17 18:38 (-04) · **Rama:** `feat/tasador-ui` · **Base:** `app9G7lLkIV3CpeLa`
> **Plan:** `docs/_md/plan_ejecucion_UItasador_v1.0.md` §1.5
> **Contrato aplicado:** 🔴 pausa-total — cada acción sobre Airtable se consultó antes de emitirse.

---

## 1 · Tabla-resumen `{tabla, campo, acción}`

| Tabla | Campo | Acción |
|---|---|---|
| `TX_Solicitudes` | `observacion_rechazo_tasador` | **creado** · `fldAccib5yNYaOmJc` · multilineText |
| `TX_Solicitudes` | `fecha_real_visita` | **no creado** · ya existe como `fecha_visita` (`fldpTBzjfbAw5FSYI`) — ver §3 |
| `TX_Solicitudes` | `coordinacion_vigente` | **no creado** · cae con CI-012 |
| `TX_Solicitudes` | `horas_restantes` | **no creado** · retirado en v1.9.9 (CI-021) · confirmado ausente |
| `TX_Solicitudes` | `fecha_visita_programada` | **existía_ok** · `fldPUFd9YuQdkcrOI` · date |
| `TX_CoordinacionVisita` | (tabla · 13 campos) | **no creada** · **CI-012 cerrado** |
| `D_TipoDocumento` | `tipo_propiedad` | **existía_ok** · `fldIfdcjsr8KeNRCx` · dominio femenino · **P-5 confirmado** |
| `C_Plantillas` / `C_NotificacionesConfig` | 2 plantillas de coordinación | **no creadas** · caen con CI-012 |
| 14 tablas de captura e hijas | — | **existía_ok** · verificadas sin crear |
| `TX_Amenities` | — | ❌ **NO EXISTE** · reportada, no creada |

**Mutaciones de schema ejecutadas: 1.** Verificado por diff completo antes/después:
`TX_Solicitudes` 156 → 157 campos, **exactamente un cambio**, sin daño colateral.

---

## 2 · Cómo se ejecutó

**Vía: Airtable Meta API REST**, no MCP.

- El MCP de Airtable **no está autenticado** en esta sesión: sólo expone `authenticate` y
  `complete_authentication`, sin `create_field` ni `get_table_schema`.
- La preferencia operativa registrada del proyecto es schema desde `docs/` + REST server-side.
- Sergio eligió la vía REST y pidió verificar el scope antes de escribir.

**Sobre la verificación de scope.** Ningún endpoint de lectura de Airtable expone los scopes de un
PAT: `GET /v0/meta/whoami` devuelve sólo `{"id":"usrggRBjrmQZ2CDJg"}`, y
`GET /v0/meta/bases/{base}/tables` sólo prueba `schema.bases:read`. **El propio POST fue el test** —
sin `schema.bases:write` habría devuelto 403 sin crear nada. Devolvió **HTTP 200**, así que el PAT
tiene el scope.

```http
POST /v0/meta/bases/app9G7lLkIV3CpeLa/tables/tblaHTyMHYfmy7Fg6/fields
{"name":"observacion_rechazo_tasador","type":"multilineText","description":"…"}
→ 200 {"id":"fldAccib5yNYaOmJc", …}
```

---

## 3 · Hallazgo principal · `fecha_real_visita` ya existía

El plan §1.5.1 declara `fecha_real_visita` como alta nueva. **No lo es.** El dato ya está en la base
y en producción bajo el nombre `fecha_visita` (`fldpTBzjfbAw5FSYI`):

| Evidencia | Dónde |
|---|---|
| Documentado como *"Fecha real de la visita"* | `docs/schema-airtable.md:166` |
| IF-02 lo mapea a `fechaVisitaReal` | `lib/solicitudes.ts:802` |
| Fórmula viva `dias_desde_visita` | `DATETIME_DIFF(TODAY(), {fldpTBzjfbAw5FSYI}, 'days')` |
| Fórmula viva `fecha_limite_entrega` | `DATEADD({fldpTBzjfbAw5FSYI}, 2, 'days')` |
| 5 blueprints de Make lo mapean | SC01 · SC-Asignar · SC-Edicion · SC05 · SC-RF09 |

**Decisión de Sergio: reutilizarlo.** Crear un campo paralelo habría dejado las dos fórmulas y el
mapper de IF-02 leyendo el viejo mientras IF-03 escribía el nuevo — dos fuentes de verdad para el
mismo dato (**RO-05**).

**Regla T-B no necesita ningún campo nuevo.** Los dos ya existen y ya están separados:
`fecha_visita_programada` (`fldPUFd9YuQdkcrOI`, planificada, la escribe IF-02) y `fecha_visita`
(`fldpTBzjfbAw5FSYI`, real, la escribe IF-03).

⚠ **Deuda para P1-TAS:** el identificador TS debe ser `fechaVisitaReal`, **nunca** `fechaVisita`.

---

## 4 · ⚠ Consecuencias del cierre de CI-012 — replanificación pendiente

**La decisión «la coordinación se hace por teléfono, fuera del sistema» invalida bastante más que
esta tanda.** Ninguna se resolvió aquí; se listan para que Sergio decida cuándo alinear.

### 4.1 · Tandas del plan

| Tanda | Efecto |
|---|---|
| **P4-TAS · Pantalla 2 · Coordinar visita** | **Queda sin objeto.** Era la tanda completa de coordinación. |
| **P3-TAS · Cola personal** | El chip **"Por coordinar"** desaparece. Con "Hoy" ya en stub por A-12, quedaría **un solo chip usable** ("Todas"). CI-019 («tres chips») queda desalineada. |

### 4.2 · Código v0 que queda huérfano

| Archivo | Líneas |
|---|---|
| `components/tasador/coordinar-visita.tsx` | 512 |
| `app/tasaciones/[id]/coordinar/page.tsx` | 15 |

⚠ Esto reduce las **siete rutas de §2.13** a **seis**, lo que contradice CI-020 tal como está
redactada. **Decisión pendiente:** borrar ambos archivos o dejarlos inertes. No se tocó nada en esta
tanda — P0.5-TAS tiene prohibido cambiar código.

También cae **OV-13** del inventario (renombrar `fechaVisita` → `fechaPlanificadaVisita` en
`coordinar-visita.tsx:96`): si el archivo se borra, el override desaparece con él.

### 4.3 · Reglas y requisitos

- **Regla T-A** colapsa de tres variantes de botón a una. Desaparecen *"Coordinar visita"* y
  *"Ver coordinación" + badge "Esperando contacto de ejecutiva"*; queda sólo **"Abrir tasación"**.
  **El «gate de coordinación» deja de existir**: el tasador entra a la captura directamente.
- **RF-TAS-03, RF-TAS-04, RF-TAS-05, RF-TAS-12, RF-TAS-13** — a revisar/retirar en §2 de la spec.
- **A-17** (catálogo de motivos paramétrico vs fijo) — **se cierra por irrelevancia**.
- **R3 · la Automation de correo de coordinación** — no se construye. P4-TAS la declaraba.
- **§2.12 de la spec** (Delta de schema) queda desalineada: los 13 campos de
  `TX_CoordinacionVisita` no tienen realización y no la tendrán.

### 4.4 · Lo que sobrevive intacto

Regla T-B (con los campos de §3), Regla T-C, R3 para el resto de las escrituras, y las siete
pantallas menos la 2. **El grueso de IF-03 no depende de la coordinación.**

---

## 5 · Otros hallazgos

**`TX_Amenities` no existe.** §2.16 de la spec la nombra entre las hijas de captura. No se creó
(CLAUDE.md exige aprobación explícita). La sección E del formulario consume un tipo `Comodidades`;
**P7-TAS debe resolver dónde persiste**.

**`TX_ContactosVisita` sí existe** (`tblW3SSbKo6vRjwBJ`), pese a que el plan §1.5.1 la daba como
«verificar en la tanda».

**La divergencia `C_Plantillas` vs `C_NotificacionesConfig` queda sin resolver.** El plan la iba a
cerrar con evidencia al crear las plantillas de coordinación; al caer esas plantillas, nada la
forzó. Ambas tablas existen (`tblcYtNeJBD545hLw` y `tbluB662ulWDaxqUY`). Se reabrirá cuando alguna
tanda necesite una plantilla nueva.

---

## 6 · Criterios de aceptación §1.5.3

| Criterio | Estado |
|---|---|
| Compuerta CI-012 confirmada antes del primer `create_table` | ✅ **cerrada por Sergio antes de la tanda**: no se crea la tabla |
| `TX_CoordinacionVisita` con 13 campos + TABLE_ID | ⛔ **no aplica** — CI-012 cerrado en sentido negativo |
| 3 campos nuevos de `TX_Solicitudes` con FIELD_IDs | ⚠ **1 de 3**: uno creado, uno ya existía con otro nombre, uno cae con CI-012 |
| `coordinacion_vigente` verificada por valor emitido | ⛔ no aplica |
| `horas_restantes` **no** creado | ✅ confirmado ausente |
| `D_TipoDocumento.tipo_propiedad` confirmado, no re-creado; P-5 registrado | ✅ |
| Las 2 plantillas existen y se documenta dónde | ⛔ no aplica |
| **Ninguna Automation encendida** | ✅ ninguna |
| **Ninguna tabla nueva** | ✅ cero tablas creadas |
| Tabla-resumen impresa y en el snapshot | ✅ §1 |
| Archivo de aprendizajes creado | ✅ `docs/_archivo/aprendizajes-20260817-1838-P0.5-TAS.md` |
| **Cero cambios en código** — `git status` sólo bajo `docs/` | ✅ verificado |

---

## 7 · Siguiente tanda

**P1-TAS · Types TypeScript** · modo `auto mode on` · contrato 🟢 libre.

Insumos que deja esta tanda:

- `observacion_rechazo_tasador` = `fldAccib5yNYaOmJc`.
- **`fecha_visita` = `fldpTBzjfbAw5FSYI` es la fecha real** → tipar como `fechaVisitaReal`, nunca
  `fechaVisita`.
- `fecha_visita_programada` = `fldPUFd9YuQdkcrOI` es la planificada.
- **No tipar nada de coordinación**: `CoordinacionVisita`, `estado_coordinacion`, `motivo`,
  `intento_numero` no existen y no existirán. Si el v0 los pide, son código muerto.
- `Comodidades` (sección E) no tiene tabla destino conocida — ver §5.
- OV-4 del inventario sigue abierto: decidir entre `lib/tasador/types.ts` y reescribir los 26
  imports de `@/lib/tasaciones`. Recomendación vigente: **reescribir**.
