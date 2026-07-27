# Snapshot RF-04 · Fix de payload y submit

> **Fecha**: 27-jul-2026 · **Panel**: Enterprise Architect · Integrations Engineer · Next.js Engineer · QA Lead
> **Origen**: `docs/_notas/AUDIT-RF04-solicitud-incompleta_20260727.md`
> **Estado global**: Tandas A · B · C **completas y verificadas**. Tanda D **pendiente de ejecución manual**.
> **Sin commit** — Sergio commitea desde GitHub Desktop.

---

## 1. Qué se arregló

Dos cortes independientes que, juntos, hacían que **ninguna solicitud creada
desde IF-02 llegara a Airtable**:

1. **El formulario nunca llamaba al backend.** `onSubmit` era un
   `setTimeout(800)` que mostraba el toast verde y cerraba el sheet.
   `POST /api/webhooks/crear-solicitud` tenía **cero consumidores**. El mock
   incluso simulaba la validación de duplicados contra un `Set` en memoria, lo
   que hacía que la pantalla se sintiera funcional de punta a punta.
2. **Contrato de nombres desalineado.** El Route Handler emitía el `...spread`
   literal del zod (camelCase) y el módulo 7 de SC01 leía snake_case. Conectar
   el submit sin arreglar esto habría llevado ~15 campos de ~47.

**Decisión de contrato congelada**: el payload UI → Make es **snake_case sin
excepciones**. El zod permanece en camelCase; la traducción vive en una función
pura del Route Handler. Airtable ya era snake_case y no se tocó.

---

## 2. Estado de las 4 tandas

| Tanda | Alcance | Estado | Verificación |
|---|---|---|---|
| **A** | Blueprint SC01 local | ✅ completa · importada en Make.com | 46 refs al payload · 0 camelCase · JSON válido · diff 20+/11− sin reformateo |
| **B** | Route Handler + `toMakeSnakePayload()` | ✅ completa | `typecheck` limpio · `build` limpio · cruce mapper↔blueprint 42/42 |
| **C** | Submit real en el formulario | ✅ completa | `typecheck` limpio · `build` limpio · sin residuos del mock |
| **D** | Test manual end-to-end | ⏸ **pendiente** | `docs/_notas/TEST-RF04-fix_20260727.md` |

---

## 3. Archivos tocados

### Código

| Archivo | Cambio |
|---|---|
| `lib/mappers/crear-solicitud.ts` | **nuevo** — `toMakeSnakePayload()`, función pura camelCase → snake_case |
| `app/api/webhooks/crear-solicitud/route.ts` | traducción + pre-chequeo de duplicados (409) + `auth()` al inicio |
| `components/console/new-request-sheet.tsx` | `fetch` real, 3 estados, 409 en doble superficie, `Set` mock eliminado |
| `lib/validators/nueva-solicitud-interna.ts` | **sin tocar** — byte-idéntico, por decisión explícita |

### Artefactos Make

| Archivo | Cambio |
|---|---|
| `docs/_artefactos/make/SC01 - Crear solicitud.blueprint.json` | 5 renames + 1 mapping nuevo + interface actualizado |
| `docs/make/SC01_-_Crear_solicitud_blueprint.json` | **copia stale** — Sergio la elimina manualmente |

### Documentación

| Archivo | Cambio |
|---|---|
| `docs/_notas/DELTA-SC01_20260727.md` | **nuevo** — delta del blueprint, campo por campo |
| `docs/_notas/TEST-RF04-fix_20260727.md` | **nuevo** — checklist del test manual |
| `docs/_notas/SNAPSHOT-RF04-fix-payload-y-submit_20260727.md` | **nuevo** — este archivo |
| `docs/diseno.md` §6 | literal del toast de creación actualizado + razón |
| `docs/construccion.md` | criterio de aceptación alineado al literal nuevo |
| `CLAUDE.md` §6 | literal canónico actualizado |
| `docs/aprendizajes.md` | entrada de sesión |

---

## 4. Decisión sobre `banco_id` (A3)

**Veredicto: no se cambió. La hipótesis de bug era incorrecta.**

La sospecha era que `fldAgTlFXeXWfGTdI ← {{1.banco_id}}` debía leer `{{9.id}}`
(salida del Search `bancoFinancista`). **Son dos bancos distintos** y ambos
mappings ya eran correctos:

| Campo Airtable | Tipo | Semántica | Mapping | Veredicto |
|---|---|---|---|---|
| `banco` `fldAgTlFXeXWfGTdI` | text | Banco **originador** | `{{1.banco_id}}` | ✅ correcto |
| `banco_financista` `fldxcfdKRctHCgwmB` | link → `M_Bancos` | Banco **financista** | `{{9.id}}` | ✅ correcto |

Evidencia:

- `lib/console-data.ts:1010-1012` — *"Bancos originadores (M_BANCOS) para el
  campo «Banco» de ORIGEN DE LA SOLICITUD. El valor persistido en
  `TX_Solicitudes.banco` es el `id`."*
- `components/console/new-request-sheet.tsx` — el select de `banco_id` emite el
  slug de `M_BANCOS` (`banco_estado`, `santander`, …), no un nombre buscable ni
  un record ID.
- `docs/schema-airtable.md:189` — `banco_financista` *"Distinto de `.banco`
  (banco originador, texto libre)"*.

Cambiarlo a `{{9.id}}` habría escrito el record ID del **financista** dentro del
campo de texto del **originador**: un bug nuevo, no una corrección.

Deuda anotada (no se actúa): `docs/schema-airtable.md:421` marca `.banco` como
*deprecated en paralelo* hasta que se corte sobre un `banco_link`.

---

## 5. Hallazgos que el plan original no contemplaba

Los cinco se expusieron antes de ejecutar y Sergio los aprobó uno a uno.

| # | Hallazgo | Resolución |
|---|---|---|
| 1 | `banco_id` no era un bug | Sin cambio · documentado (§4) |
| 2 | `contactosVisita` era un **5º** mapping camelCase, con **3 referencias** | Renombrado en filtro Router + array Iterator + interface |
| 3 | `valor_uf` no tenía emisor: el rename era cosmético | Se alimenta desde `valorTotalUf` |
| 4 | `proyecto` se capturaba, el campo existía, nadie lo escribía | Mapping nuevo en mód. 7 (A5) |
| 5 | Nadie emitía 409: C3 y C4 se contradecían | Pre-chequeo read-only en el Route Handler |

**El más peligroso fue el 2.** El Router 16 filtra por `exist` sobre
`{{1.contactosVisita}}`. Renombrar sólo el Iterator habría dejado el filtro
evaluando una clave inexistente → rama descartada → **cero filas en
`TX_ContactosVisita` sin ningún error visible en Make**. Falla silenciosa.

---

## 6. Decisiones de implementación

| # | Decisión | Motivo |
|---|---|---|
| 1 | Montos normalizados con `numeroPlano()` antes de salir | `parseNumber()` de Make no entiende el separador de miles es-CL: `"4.200"` → `4` |
| 2 | Claves vacías se omiten del payload | `{{parseNumber(1.x)}}` sobre `""` puede escribir basura en un campo `number`. Al ser un *create*, omitir nunca pierde datos |
| 3 | `vendedor_tipo_persona` derivado (`nuevo`→`juridica`, `usado`→`natural`) | Era 🔵 en la auditoría; el mapping ya existía. Campo ganado por una línea |
| 4 | `auth()` movido al inicio del handler | Antes devolvía 400 antes que 401, revelando la forma del contrato a un llamador sin sesión |
| 5 | Pre-chequeo de duplicados con **tres** estados | `indeterminado` ≠ `libre`. Un fallo de Airtable no bloquea el alta, pero deja `console.warn` para auditar el bypass |
| 6 | Whitelist `CAMPOS_CONFLICTO` antes de `setError` | Un `campo` inesperado del backend no puede crear un error huérfano en una ruta que el formulario no tiene |
| 7 | El sheet no se cierra mientras `isSubmitting` | El POST ya salió; descartar el formulario ahí dejaría a la Ejecutiva sin saber si se creó |
| 8 | `numeroPlano()` **copiado**, no importado, desde `editar-solicitud.ts` | No tocar la ruta de edición, que ya está en producción. Unificar en fase 2 |

### Divergencia de §6 del Blueprint

El literal canónico era *"Solicitud creada con {n} documento(s) adjunto(s)."* Se
reemplazó por **"Solicitud creada · {codigo_ext}"** (fallback: *"Solicitud
creada"* si el código viene nulo).

Razón: **`documentos[]` no viaja en el alta** — el upload de adjuntos es una
fase posterior contra `/api/adjuntos/upload`. `n` sería siempre 0 y el mensaje
diría invariablemente "con 0 documento(s)". El `codigo_ext` sí es accionable.

La divergencia se resolvió **actualizando el spec**, no dejando el código fuera
de norma: `docs/diseno.md` §6, `docs/construccion.md` y `CLAUDE.md` §6 quedan
alineados con lo implementado.

---

## 7. Verificaciones ejecutadas

```
Blueprint
  referencias al payload (módulo 1) : 46
  camelCase restantes               : NINGUNA
  usadas en mappings, sin declarar  : []          (antes faltaba ejecutiva_clerk_id)
  campos en el record del módulo 7  : 47          (46 + proyecto_condominio)
  JSON válido                       : sí
  git diff                          : 20+ / 11−, sin reformateo

Código
  pnpm typecheck                    : limpio
  pnpm build                        : limpio
  residuos del mock                 : ninguno
  cruce mapper ↔ blueprint          : 42 coincidencias
                                      4 esperadas sin emisor (🔵 documentados)
                                      1 emitida sin uso (subido_por, inerte)
```

`pnpm lint` **no corre**: `sh: 1: eslint: not found`. Preexistente, ajeno a
RF-04. Anotado como deuda en `docs/aprendizajes.md`.

---

## 8. Fuera de alcance · entra en RF-04 fase 2

| Qué | Detalle |
|---|---|
| **Bloque Unidades** | `TX_Unidades` existe y `TX_Solicitudes` tiene el link `fldeKGmoB97e5J3yX`, pero **SC01 no tiene ningún módulo que cree unidades**. Requiere iterator + Create + subcampos RN-45/46 |
| **Ejec. Comercializador** | El spec lo pide separado del Formalizador; el campo no existe en Airtable |
| **Familia financiera duplicada** | `fin_*_uf` (8 campos huérfanos) vs `financiero_*_uf` |
| **Vendedor duplicado** | `vendedor_nombre` vs `vendedor_razon_social_o_nombre`: decidir cuál es canónico |
| **`vendedorCoincideComprador`** | Sin campo destino |
| **Claves sin emisor** | `modo_creacion` (recuperable barato) · `email_thread_id` · `correo_cliente_ref` |
| **Unificar `numeroPlano()`** | Hoy duplicado entre `crear-solicitud.ts` y `editar-solicitud.ts` |
| **`documentos` en el interface** | Única clave declarada sin mapping que la consuma. Inerte |

---

## 9. Restart prompt

> Si la sesión se corta antes de ejecutar el test D, arrancar con esto.

```
Contexto: RF-04 fix de payload y submit (VProperty · IF-02 · CU-002).
Lee en este orden:
  1. docs/_notas/SNAPSHOT-RF04-fix-payload-y-submit_20260727.md  (este archivo)
  2. docs/_notas/DELTA-SC01_20260727.md                          (qué cambió en SC01)
  3. docs/_notas/TEST-RF04-fix_20260727.md                       (el checklist)

Estado: Tandas A, B y C completas y verificadas (typecheck + build limpios).
Blueprint SC01 importado en Make.com y confirmado el 27-jul-2026.
Sin commit: los cambios están en el working tree.

Contrato congelado — NO revisitar:
  - Payload UI → Make: snake_case sin excepciones.
  - Zod: camelCase, intacto. La traducción vive en lib/mappers/crear-solicitud.ts.
  - Airtable: snake_case inmutable.
  - banco_id ≠ banco financista: son dos campos distintos, ambos correctos.

Pendiente único: ejecutar el test manual de docs/_notas/TEST-RF04-fix_20260727.md
y registrar el resultado en su §5.

Si el test falla, el orden de diagnóstico es:
  LogEscenarios (¿salió bien el payload?)
  → historial de ejecuciones de Make (¿falló un módulo?)
  → mapping del módulo 7 (¿apunta a la clave correcta?).

Fuera de alcance (RF-04 fase 2): bloque Unidades · deuda de schema
(Ejec. Comercializador, fin_*_uf vs financiero_*_uf, vendedor_nombre vs
vendedor_razon_social_o_nombre) · unificar numeroPlano().
```

---

*Sesión sin commit ni push. Sin cambios en el schema de Airtable. Los cambios en
Make.com se hicieron por importación manual del blueprint, ejecutada por Sergio.*
