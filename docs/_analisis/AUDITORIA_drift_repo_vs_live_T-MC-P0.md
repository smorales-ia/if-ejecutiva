# AUDITORÍA — DRIFT repo vs live · T-MC-P0

> Sesión 2026-09-23 · solo lectura en Airtable/Make. Retoma el STOP crítico
> pre-paste del 22-09. **Veredicto adelantado: NO hay drift real en el DAG.**
> El "DRIFT MASIVO" reportado anoche fue un artefacto de line endings (CRLF vs LF).

## Contexto

Anoche, al preparar el paste del paquete `docs/_paste/T-MC-P0_paste-instructions.md`,
el paso 2 (STOP crítico) comparó el DAG del repo contra la captura live y `diff`
devolvió `2,1362c70,1400` / `1,1365c1,1400` — el archivo entero marcado como
cambiado, más ~68 líneas de "header nuevo". Se interpretó como que el live había
divergido masivamente del repo y se abortó para no pisar cambios no versionados.

Esta sesión re-audita esa divergencia con line endings normalizados.

---

## § 1 · Resumen de la divergencia

**DAG AT03_Calculos (`wflSBI7cjLNc0rkV5`):**

| Métrica | Valor |
|---|---|
| repo `AT03_Calculos_DAG.js` | 1400 líneas · LF · 0 CR |
| live `AT03_Calculos_DAG_pre-T-MC-P0.js` | 1365 líneas · **CRLF** · 1361 CR |
| `diff` sin normalizar | `1,1365c1,1400` (archivo entero) — **FALSO** |
| `diff --strip-trailing-cr` | **5 hunks**: `1,4d0`, `85c81`, `95a92`, `625c622`, `989c986,1024` |
| Hunks de contenido real | **4** (el `1,4d0` es la cabecera de backup de 4 líneas) |

Los 4 hunks reales, verbatim:

1. `85c81` — `let … tItemsCuadro = null;` → `… tItemsCuadro = null, tPreciosUF = null;`
2. `95a92` — `+ try { tPreciosUF = base.getTable('H_PreciosUF'); } catch (e) {}`
3. `625c622` — `fields: ['estado', …]` → `fields: ['estado', 'fecha_visita', …]`
4. `989c986,1024` — reemplaza `const ufDiaVisita = … || 38500;` por el bloque guard
   H3 (39 líneas): lookup a `H_PreciosUF` por `fecha_visita`, y si falta la fecha o
   la fila de UF → evento en `A_Eventos` + `throw` (fail ruidoso, sin default 38500).

**Estos 4 hunks son, uno a uno, las 3 ediciones de T-MC-P0** descritas en el paso 3
del paquete de paste. No hay una sola línea de divergencia adicional.

**AT03-Ext (`wflQloTxAcjauDEZ9`):** no hay captura live en disco (no se salvó antes
del apagón; el MCP oficial no lee automations). Único baseline: backup del 11-09
(12 días viejo). Diff repo vs ese backup = 9 hunks, ambos LF. El guard T-MC-P0
(`origen_dato=tipeado` → skip + `skip_origen_tipeado`) está presente en el repo
(`AT03-Ext_script.js:333-344`), pero los 9 hunks mezclan esa edición con cambios
Sep11→Sep22 no relacionados; **no se puede afirmar ausencia de drift sin captura live**.

---

## § 2 · Naturaleza del drift

**No es drift.** Es la **suma de dos artefactos benignos** más las ediciones esperadas:

- **Artefacto A — line endings.** El archivo live se guardó CRLF (así lo entrega la
  captura MCP/editor en Windows); el repo es LF. `diff` compara línea a línea con el
  `\r` incluido, así que las 1365 líneas "difieren". El clásico `1,Nc1,M` que abarca
  el archivo entero es la firma inconfundible de esto.
- **Artefacto B — cabecera de backup.** El archivo live lleva 4 líneas de comentario
  al inicio (`// BACKUP AT03_Calculos … Capturado vía MCP … Restaurar … PASO 11`).
  Eso son las "~68 líneas de header nuevo" percibidas anoche (amplificadas por el
  ruido CRLF de todo lo que venía después).
- **Contenido real:** las 3 ediciones T-MC-P0, limpias.

No es merge sucio, no es reescritura estructural, no es una versión live más nueva ni
una versión repo abandonada. Es `live + parche T-MC-P0 = repo`, exactamente como se
diseñó.

---

## § 3 · Hipótesis de por qué "divergió" (y cuál resultó cierta)

- (a) cambios manuales en Airtable UI sin versionar → **descartada**: los 4 hunks son
  las ediciones nuestras, no hay huella de edición manual ajena.
- (b) el `.js` del repo era una versión de trabajo nunca subida → **descartada**: el
  repo es exactamente el live + los 3 parches.
- (c) alguien pasteó una versión distinta hace meses → **descartada**: sin evidencia.
- (d) **otra → CONFIRMADA: falso positivo de `diff` por CRLF vs LF** + cabecera de
  backup. La divergencia nunca existió a nivel de contenido.

---

## § 4 · Fuente de verdad

**El repo y el live coinciden**, así que no hay conflicto de fuente de verdad para el DAG:

- `AT03_Calculos_DAG.js` (repo) = live deployed 2026-09-23 **+ las 3 ediciones T-MC-P0**.
- El live (`…_pre-T-MC-P0.js`) es la base limpia previa a las ediciones.
- Evidencia: `deploymentStatus=deployed · configurationStatus=valid` en la cabecera de
  la captura; los 4 hunks son aditivos y auto-consistentes (declaración `tPreciosUF` →
  `getTable` → uso en el guard); no hay función que exista en live y falte en repo ni
  viceversa (fuera de las líneas del parche).

Para el **paste**, la fuente de verdad a desplegar es el **repo** (`AT03_Calculos_DAG.js`),
que ya contiene el live + el parche. Para el **rollback**, la fuente es el pre-T-MC-P0
(CRLF, byte-fiel al deployed previo).

Para **AT03-Ext**: fuente de verdad **no concluyente** hasta capturar el live. El repo
tiene el guard, pero falta confirmar que no arrastre otra divergencia respecto del deployed.

---

## § 5 · Impacto sobre las 3 ediciones T-MC-P0

Las 3 ediciones se aplicaron **sobre la base correcta** (el live deployed):

| Edición | Hunk | ¿Sobre versión correcta? |
|---|---|---|
| Handle `H_PreciosUF` | `85c81` + `95a92` | ✅ sí |
| Fetch `fecha_visita` en la solicitud | `625c622` | ✅ sí |
| Guard H3 (lookup UF + throw, sin `|| 38500`) | `989c986,1024` | ✅ sí |

No hay que re-aplicar nada. El diff limpio (4 hunks) ya ES el parche mínimo. La copia
LF del live (`AT03_Calculos_DAG_LIVE_20260923.js`) permite regenerar ese diff de 4 hunks
sin la trampa CRLF cuando se quiera verificar antes de pegar.

**Salvedad de datos (no de código):** el guard H3 exige que en Airtable exista (a) el
valor de `fecha_visita` en la solicitud objetivo y (b) la fila de `H_PreciosUF` para esa
fecha. Sin ellas, el motor **aborta a propósito** (fail ruidoso). Eso es comportamiento
correcto del guard, pero significa que los pasos 6-7 del paquete (poblar `fecha_visita`
y cargar `H_PreciosUF`) son **precondición dura** de cualquier cálculo post-deploy.

---

## § 6 · Estrategias de sincronización

- **Opción A — traer live al repo, re-aplicar las 3 ediciones, regenerar diff limpio.**
  Innecesaria: el repo YA es live + 3 ediciones y el diff limpio ya está generado
  (`DIFF_AT03_Calculos_repo_vs_live_20260923.txt`, 4 hunks). No aporta nada.
- **Opción B — descartar live y forzar repo.** No aplica: no hay conflicto que resolver.
- **Opción C — merge quirúrgico (aplicar las 3 ediciones al live en la UI).** Es,
  efectivamente, lo que el paquete de paste ya propone: pegar el repo (= live + parche)
  en la Automation. Dado que no hay divergencia, pegar el repo completo equivale a un
  merge quirúrgico y es seguro.

---

## § 7 · Recomendación

**Proceder con el paquete de paste tal como está para el DAG (equivale a Opción C).**
Racional en 3 líneas:
1. No hay drift: el repo es el live deployed + exactamente las 3 ediciones T-MC-P0, verificado con diff normalizado (4 hunks, cero divergencia ajena).
2. El bloqueo de anoche fue un falso positivo CRLF; ya está neutralizado con la copia LF del live y el diff limpio en disco.
3. Antes de pegar AT03-Ext, capturar su live y diffearlo (LF) para confirmar que el guard es la única diferencia; y recordar que el guard H3 exige poblar `fecha_visita` + `H_PreciosUF` (pasos 6-7) o el cálculo abortará por diseño.

---

## § 8 · Preguntas para Sergio antes de proceder

1. **AT03-Ext live:** ¿puedes copiar el script vigente de la Automation AT03-Ext
   (`wflQloTxAcjauDEZ9`) desde la UI de Airtable a
   `docs/_backups/AT03-Ext_script_pre-T-MC-P0.js`? Es el único artefacto que falta para
   cerrar la auditoría del segundo script (el MCP de esta sesión no lee automations).
2. **`fecha_visita` de VP-2026-0066 (`recNiwM4s1ibr3sbO`):** ¿qué fecha real de visita
   usamos? De ella depende qué fila de `H_PreciosUF` hay que cargar (pasos 6-7). Sin
   ambas, el guard H3 aborta el cálculo (comportamiento esperado, no bug).
3. **Deploy manual:** confirmado que `update_automation` por MCP sólo toca el draft.
   ¿Pegas y das "Update" tú en la UI para los pasos 3 y 4? (writes de automation los
   haces tú, no yo).
4. **Orden 3→4→5:** ¿mantenemos el orden del paquete (guards ANTES del repunte de
   `D_TipoDocumentoAtributo`) para no abrir la ventana de contaminación SII?
5. **OK explícito:** ¿autorizas ejecutar los pasos 3-11 del paquete, o quieres primero
   revisar esta auditoría y el diff limpio?

---

## Artefactos generados esta sesión (solo lectura en Airtable; writes sólo a docs/)

- `docs/_backups/AT03_Calculos_DAG_LIVE_20260923.js` — live deployed, normalizado a LF.
- `docs/_backups/DIFF_AT03_Calculos_repo_vs_live_20260923.txt` — diff limpio (4 hunks).
- `docs/_backups/DIFF_AT03-Ext_repo_vs_backup20260911_20260923.txt` — diff parcial (baseline viejo, no live).
- `docs/aprendizajes.md` — 3 lecciones (falso drift CRLF · MCP draft-only · baseline live faltante).
- Este documento.
