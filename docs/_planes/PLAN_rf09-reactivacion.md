# PLAN_rf09-reactivacion · Dejar RF-09 vivo end-to-end en producción

> **Tanda RF09-REACTIVACION · FASE 1 (planificación).** Consolidado de 5 agentes en paralelo
> (Arquitecto, Auditor blueprint, Auditor CI-002, Seguridad, QA). Rama `plan/rf09-reactivacion`.
> Read-only: NO autoriza ejecución. FASE 2 tras OK Gate (§12). Fecha: 21-09-2026.

---

## § 1 · Resumen ejecutivo

**El diagnóstico previo (3 bloqueos) resultó en gran parte OBSOLETO.** El blueprint `SC-RF09` ya es
**v2.1** con todas las tablas/campos VIVOS (no hay TABLE_IDs deprecados), y el webhook **hoy dispara y
da HTTP 200** (LogEscenarios sep 9–11). El residual real es mucho menor: (1) pegar la API key Anthropic
en el módulo 10 en Make, (2) volver el escenario asíncrono para matar los HTTP 408 intermitentes, (3)
confirmar la automation gemela `recordUpdated` y `AT03-Ext v3` desplegadas. Reactivar RF-09 es
mayormente **config en Make (Sergio)** + actualización de docs stale (Claude-Code), no una reconstrucción.

---

## § 2 · Alcance — qué se reconstruye, qué NO se toca

**Se hace (FASE 2, tras OK Gate):**
- Config Make (Sergio): pegar key en módulo 10, volver el escenario asíncrono, alinear Secrets, verificar connections.
- Verificar despliegue de la gemela `AT-RF09-Trigger` (recordUpdated) y de `AT03-Ext v3`.
- Claude-Code: actualizar docs stale (schema-airtable.md, ficha CI-002); opcional editar el JSON del blueprint (timeout/async) para reimport; escribir/ejecutar tests.
- Prueba E2E con 1 doc real y luego los 8 de `Met_6283/`.

**NO se toca:** código de app IF-02/03/04 (R5) salvo docs; catálogo del motor; records de cartera real;
commit/push (R12 · Sergio). **No se rota la key** (D1) — con la salvedad de seguridad de §6.

---

## § 3 · Diseño técnico (Agente 1)

**Flujo E2E y estado por salto:**
1. `TX_Adjuntos` alta con `clave_adjunto` — ✅ OK (upload/route.ts:242 + fotos/route.ts:276-284 server-side).
2. `AT-RF09-Trigger` (recordCreated) **+ gemela `-Update`** (recordUpdated, vigila `clave_adjunto`) — ⚠ verificar despliegue de la gemela (hueco de sep-2026).
3. Webhook → `SC-RF09-ExtraccionClaude v2.1` — ⚠ config (key + async), no roto.
4. Parsing respuesta Claude (router 3 ramas: éxito/delegado/error) — ✅ OK en blueprint.
5. Escritura en tablas satélite — **la hace `AT03-Ext`** (Airtable script, trigger sobre `atributos_obtenidos`), **NO** este blueprint (sus únicos CreateRecord son a LogEscenarios). ⚠ `AT03-Ext v3` "escrito, nunca probado" — confirmar despliegue.

**Grafo de reconstrucción (precedencia dura):** connections Dropbox(7553318)/Airtable(8847431) vivas →
reimportar blueprint v2.1 → pegar API key en módulo 10 → obtener hook URL → cargar Secrets de la
Automation (`MAKE_WEBHOOK_URL_RF09` + `MAKE_RF09_HMAC_SECRET`) → verificar ambas automations (created +
updated) → verificar `AT03-Ext v3` → prueba E2E con archivo de hash nuevo.

**Puntos de falla (prob × impacto):** (1) módulo 10 sin key; (2) gemela recordUpdated no desplegada o
vigilando el campo equivocado; (3) Secrets desalineados con el hook; (4) HMAC (ver §5 — el hook NO
verifica firma, así que es cosmético); (5) `AT03-Ext` no probado; (6) connections Make caducadas; (7)
dedup por hash_md5 da falso negativo si se reusa el mismo archivo; (8) schema-airtable.md desinforma.

---

## § 4 · Remapping TABLE_IDs (Agente 2)

Blueprint **v2.1 · 24 módulos**. Verificado en vivo (REST meta, `AIRTABLE_TOKEN`): **todas las 5 tablas
referenciadas están VIVAS**, cero referencias rotas:

| TABLE_ID | Tabla | Módulos |
|---|---|---|
| `tblur71x1oItbmKZc` | TX_Adjuntos | 2,8,13,15,18,22 |
| `tblkPhBnpdDmUWOl3` | D_TipoDocumento | 3 |
| `tbldI86ieVKpjpL7E` | D_TipoDocumentoAtributo | 4 |
| `tblR4VWpUHw1CSyIS` | LogEscenarios | 16,20,23 |
| `tblaHTyMHYfmy7Fg6` | TX_Solicitudes | 19 |

**Tablas deprecadas (`tblOI0Su3ogySNeHm` D_Atributo · `tble0Na4Neon7Vz3z` D_TipoDato): NO referenciadas.**
El riesgo del snapshot viejo ya no existe. Mappers usan **nombres de campo** (todos existentes; frágil a
renombres — recomendación menor: migrar a FIELD_IDs con `useColumnId`).

**Hardcodes:** H-1 módulo 10 L1287 `x-api-key = "PEGA-AQUI-LA-API-KEY-NUEVA-EN-MAKE"` (placeholder,
**bloqueante** — pegar key en Make); H-2 `"model":"claude-sonnet-4-6"` (**válido**, sin acción); el prompt
es dinámico `[{{7.text}}]` — **NO existe** "Atributos esperados: 7" (grep negativo). El defecto de
`schema-airtable.md:712/723` (13 módulos, tablas EAV, prompt "7") describe una versión **superada** →
**deuda documental a corregir**.

---

## § 5 · Fix CI-002 webhook (Agente 3)

**La ficha CI-002 está obsoleta.** Evidencia en vivo (LogEscenarios, `Escenario='SC-RF09-ExtraccionClaude'`):
las 20 filas recientes (sep 9–11) son **mayoría `✓ OK · HTTP 200`** con la cadena completa (extracción +
`AT03-Ext`). Las 2 filas originales de la ficha (ago 6, `VP-2026-0053`) son de la era del fallo sistemático.

**Descartadas como causa:** URL (viene del Secret `MAKE_WEBHOOK_URL_RF09`, resuelve → hay 200s); firma
HMAC (script L94-200 = HMAC-SHA256 hex igual que `lib/make-client.ts:182`, **y** el hook `CustomWebHook`
**no verifica firma** → cosmético); content-type/payload (6 campos planos, Make los consume); Secrets de
Railway (el script usa Secrets de la Automation, no Railway).

**Causa real: HTTP 408 intermitente** por diseño **síncrono** — el blueprint responde con
`WebhookRespond` **al final** (L2750/4910/5720), tras Dropbox `getFile` + Claude (`timeout:""` L1298); cuando
excede el techo del `fetch` de Airtable Scripts, el trigger recibe 408 y marca `error`. Patrón OK/408
intercalado sobre fechas contiguas → latencia variable, no config determinista. `[INFERIDO]` — confirmable
sólo abriendo una ejecución 408 en la UI de Make (Sergio).

**Fix:** **Sergio-manual (Make)** — volver el escenario **asíncrono**: mover `WebhookRespond (200)` al
**inicio**, tras el hook y antes de Dropbox/Claude; el `estado_extraccion` final ya lo escriben los
UpdateRecords internos, no el cuerpo HTTP. Mínimo alternativo: fijar `timeout` explícito en el módulo Claude
(L1298). **Claude-Code (doc):** reclasificar CI-002 de "disparo falla" a "408 intermitente por respuesta
síncrona". **No se toca `AT-RF09-Trigger_script.js`** (su construcción es correcta y está probada por los 200s).

---

## § 6 · Connection Make con key actual + scrub (Agente 4)

**Estado de la key en el blueprint:** módulo 10 = `http:ActionSendData` (HTTP crudo), key por header inline
`x-api-key` (placeholder en git). ⚠ **`http:ActionSendData` NO admite connection/keychain en Make** — el
intento v2.1 de `*ApiKeyAuth` se revirtió ("Module Not Found", aprendizajes 2490-2514). **Conclusión: el
objetivo D1 ("que quede como connection, no hardcodeada") NO es alcanzable con este módulo.** El patrón
real seguro es: **placeholder en git + key pegada en el campo header en la UI de Make** (no versionada). Una
connection de verdad exigiría rehacer el módulo 10 con la app nativa "Anthropic Claude" de Make (fuera de scope).

**HEAD/árbol de trabajo: LIMPIOS** (`grep sk-ant` en HEAD = 0). `.env.local` (key viva) y `.env.example`
NO trackeados y gitignored (`.env*`) — correcto, sin acción.

**⚠ Salvedad de seguridad (para que "no rotar" sea decisión informada):** la key viva de hoy
(`.env.local`) **está en claro en el history de git** (commits `1ff31fe`, `692bbcd`, `4705a05`, `bd0cb51`;
purgada de HEAD en `317d73d`/`35c6cfc`). Mientras no se rote, esa key sigue válida y expuesta en el history.
- Scrub sin rotar = reescribir history del path del blueprint (`git filter-repo`/BFG) reemplazando los
  literales por el placeholder + `push --force-with-lease`. **Riesgos:** cambia todos los SHAs (force-push;
  GitHub Desktop no expone filter-repo → terminal deliberada); GitHub puede cachear commits huérfanos.
- **Purgar el history NO revoca la exposición pasada** — sólo rotar lo haría. Si el repo fue **privado y sin
  clones externos**, riesgo residual bajo y el rewrite es opcional; si fue **público alguna vez**, la
  exposición ya ocurrió y la mitigación completa exigiría rotar (que Sergio decidió no hacer). → **OK Gate Q4.**

---

## § 7 · Plan de ejecución paso a paso (Sergio-manual vs Claude-Code)

| Paso | Acción | Quién | Modo |
|---|---|---|---|
| 0 | Resolver OK Gate §12 (AT02, doc de prueba, key-history) | Sergio | GATE |
| 1 | Verificar connections Dropbox(7553318)/Airtable(8847431) vivas en Make | Sergio | SECUENCIAL |
| 2 | (Opcional) editar JSON del blueprint: `WebhookRespond` al inicio (async) + timeout Claude | Claude-Code | SECUENCIAL |
| 3 | Reimportar blueprint v2.1 en Make | Sergio | SECUENCIAL (tras 2) |
| 4 | Pegar la API key Anthropic en el header del módulo 10 (UI Make) | Sergio | SECUENCIAL |
| 5 | Obtener el hook URL del escenario reimportado | Sergio | SECUENCIAL |
| 6 | Cargar Secrets de la Automation: `MAKE_WEBHOOK_URL_RF09`(=hook) + `MAKE_RF09_HMAC_SECRET` | Sergio | SECUENCIAL |
| 7 | Verificar/desplegar AMBAS automations: recordCreated + recordUpdated(clave_adjunto) | Sergio | SECUENCIAL |
| 8 | Verificar `AT03-Ext v3` desplegada (propaga a TX_* satélite) | Sergio | SECUENCIAL |
| 9 | Decidir AT02: apagar durante tests o aislar por estado ≠ creada (Q1) | Sergio | SECUENCIAL |
| 10 | Prueba E2E: 1 doc de hash nuevo → idle→extrayendo→listo → tabla destino | Claude-Code verifica (REST) | SECUENCIAL |
| 11 | Batería completa 21 tests (§8) sobre los 8 docs de Met_6283 | Claude-Code verifica | **PARALELO** en verificación; subidas secuenciales |
| 12 | Actualizar docs stale: schema-airtable.md:712/723 + ficha CI-002 | Claude-Code | SECUENCIAL |

**Paralelizable:** solo la **verificación** de los 8 docs (paso 11); las **subidas** deben ser secuenciales
(evitar carrera del trigger `recordCreated` y rate-limit). Todo el setup Make (1–9) es secuencial.
**Sergio-manual: pasos 1,3,4,5,6,7,8,9.** **Claude-Code: pasos 2,10,11,12.**

---

## § 8 · Batería de tests (Agente 5) — 21 tests

| Grupo | Tests | Qué valida |
|---|---|---|
| (a) Transición estado | A1,A2,A3 | idle→extrayendo→listo; `/lectura` avanza; LogEscenarios `✓ OK` sin "error al disparar webhook" |
| (b) Campos destino | B1,B2,B3,B4 | permiso→DocumentosLegales; foto_sii→DatosTasacion(`avaluo_fiscal_clp`,`rol_sii`); comparables→≥3 filas; no-op→skipped |
| (c) 8 docs enrutados | C1–C8 (+C-global) | 3 pueblan tabla (`listo`), 5 no-op (`skipped`), 0 error; `/lectura` total=8, hayError=false |
| (d) Negativo | D1,D2,D3 | doc corrupto→`error` (no cuelga) y NO impide que el sano llegue a `listo` (`puedeContinuar=true`) |
| (e) AT02 sin side-effects | E1,E2,E3 | `tasador`/`estado` inalterados; sin 409 espurio; A_Eventos sin asignación AT02 |
| **TOTAL** | **21** | 6 requieren LogEscenarios · 17 requieren estado final TX_* |

**Criterio HECHO (RF-09 vivo):** CI-002 sin `✗ Error` de webhook · ≥1 doc completa idle→listo · los 3
docs con destino pueblan su campo correcto · los 8 terminan en su estado terminal esperado · el corrupto
no cuelga ni bloquea al sano · AT02 sin efectos. **Pre-flight:** confirmar `AT03-Ext v3`; preferir alta
limpia sobre reemplazo (cada reemplazo re-consume Claude API); `reused` (mismo hash) no dispara extracción.

**⚠ Corrección de enrutamiento (A5, contra el oráculo PROD-MET6283):** de los 8 docs solo **3 pueblan
tablas** (permiso, foto_fuente_sii, foto_comparables); los 5 restantes son **no-op → skipped**.
`avaluo_total` **no** viene de `consulta_antecedentes` (no-op) sino de `certificado_avaluo_fiscal`→
`TX_Unidades`, que **no está entre los 8 docs**; el bloque SII enruta a `avaluo_fiscal_clp` en TX_DatosTasacion.

---

## § 9 · Rollback por paso

| Paso que falla | Rollback |
|---|---|
| 3 Reimport | Reimportar la versión previa del escenario; el anterior queda en el historial de versiones de Make |
| 4 Key | Corregir el header; ninguna escritura de datos ocurrió aún |
| 6 Secrets | Restaurar los valores previos de los Secrets de la Automation |
| 7 Gemela | Desactivar la automation recién tocada; volver al estado desplegado previo |
| 10–11 Prueba | Borrar el/los `TX_Adjuntos` de prueba desde la UI (cascade `adjuntos-cascade.ts` limpia lo poblado); usar solicitud sandbox aislada, nunca cartera real |
| 12 Docs | `git checkout` del doc (cambio local; sin commit) |

**Regla:** la prueba corre sobre solicitud sandbox aislada; ante fallo, se borra el adjunto de prueba y se
revierte config Make por versión. Sin tocar records reales.

---

## § 10 · Prompt sugerido para FASE 2

```markdown
TANDA RF09-REACTIVACION — FASE 2: EJECUCIÓN.
Ejecutar docs/_planes/PLAN_rf09-reactivacion.md. Precondiciones OK Gate §12 respondidas: [Q1–Q4].
Sergio-manual (Make): connections vivas → reimport blueprint v2.1 → pegar API key módulo 10 →
  volver escenario asíncrono (WebhookRespond al inicio) → hook URL → Secrets Automation
  (MAKE_WEBHOOK_URL_RF09 + MAKE_RF09_HMAC_SECRET) → verificar automations created+updated →
  verificar AT03-Ext v3 → decidir AT02.
Claude-Code: (opcional) editar JSON blueprint async/timeout; verificar E2E por REST; correr los 21
  tests (§8) sobre los 8 docs de Met_6283; actualizar docs stale (schema-airtable.md:712/723 + CI-002).
Criterio HECHO = §8. Rollback §9. NO rotar key (decisión D1; ver salvedad §6). NO commit/push (Sergio).
Reportar tabla de 21 tests + estado de LogEscenarios. Cierre en claude-out.txt.
```

---

## § 11 · Conflictos entre agentes y resolución

| # | Conflicto | Resolución |
|---|---|---|
| **K-1** | Diagnóstico "3 bloqueos" (tablas deprecadas, CI-002 disparo falla, key hardcodeada) vs realidad | **Los 3 están stale.** A2: blueprint v2.1, tablas vivas. A3: webhook da 200, residual = 408 timeout. A4: key = placeholder en HEAD. El trabajo real es config Make + docs, no reconstrucción. Actualizar `schema-airtable.md:712/723` y ficha CI-002. |
| **K-2** | D1 "key como connection en Make (no hardcodeada)" vs módulo HTTP crudo | **No alcanzable** con `http:ActionSendData` (A4). Pegar la key en el header en la UI (placeholder en git). Connection real exigiría rehacer módulo 10 con app nativa Anthropic — decisión de Sergio (Q3). |
| **K-3** | "No rotar" (D1) vs key viva en history de git (A4) | Riesgo residual: la key sigue expuesta en 4 commits. Scrub-sin-rotar reduce exposición futura pero no la pasada. → **Q4**. |
| **K-4** | Enrutamiento: oráculo PROD-MET6283 decía `consulta_antecedentes`→`avaluo_total`; A5 dice no-op y `avaluo_total`←`certificado_avaluo_fiscal`→`TX_Unidades` (no está entre los 8) | **Gana A5** (verificado contra schema §28). Corregir el oráculo PROD-MET6283 §4: de los 8 solo 3 pueblan tabla; el bloque SII va a `avaluo_fiscal_clp`. |
| **K-5** | `AT03-Ext v3` — "escrito nunca probado" (A1) es prerequisito de que (b)/(c) puebla tablas | No es conflicto, es dependencia: verificar despliegue de `AT03-Ext v3` antes de correr (b)/(c), o esos tests dan xfail por causa conocida, no por CI-002. |

---

## § 12 · OK Gate — preguntas para Sergio

1. **Q1 · AT02 durante tests.** ¿Apagás AT02 durante la batería, o corremos toda la prueba sobre
   solicitudes en `estado ≠ creada` (para que AT02 no las reclame) salvo el test E2 que provoca el borde?
2. **Q2 · Doc de prueba único.** ¿Qué documento usamos para la prueba mínima (a)? Recomendado:
   `permiso_edificacion_Met6283.pdf` (enruta a tabla, resultado verificable) o `foto_fuente_sii` (dos
   destinos). Los 5 no-op no sirven como prueba de "puebla tabla".
3. **Q3 · Módulo 10 key.** ¿Aceptás pegar la key en el header del módulo HTTP crudo (placeholder en git), o
   querés que rehagamos el módulo 10 con la app nativa "Anthropic Claude" de Make para tener connection real?
4. **Q4 · Key en history.** La key viva está en claro en 4 commits del history. Con "no rotar": ¿el repo fue
   **privado siempre** (riesgo bajo, scrub opcional) o **público alguna vez** (la exposición ya ocurrió;
   mitigación completa exigiría rotar)? ¿Autorizás un `filter-repo` + force-push para scrub, o lo dejamos?
5. **Q5 · AT03-Ext v3.** ¿Confirmás que `AT03-Ext v3` está desplegada en Airtable? Sin ella, la extracción
   corre pero no propaga a `TX_DocumentosLegales`/`TX_DatosTasacion` (b)/(c) darían xfail.
6. **Q6 · Async del escenario.** ¿Preferís que editemos el JSON del blueprint (WebhookRespond al inicio) para
   que lo reimportes, o lo movés a mano en la UI de Make?

**FASE 2 no arranca hasta Q1–Q6.**
