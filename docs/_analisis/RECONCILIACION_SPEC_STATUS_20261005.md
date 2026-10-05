# Reconciliación Spec-vs-Realidad — Status previo a la réplica de Casos 2–5

**Tanda:** T-RECONCILIA-SPEC-STATUS-20261005
**Fecha:** 2026-10-05
**Modo:** SOLO LECTURA · cruce de los hallazgos del descubrimiento contra el SPEC MAESTRO + verificación de lo ya construido
**Equipo:** 6 agentes en paralelo (params/overrides · AT04/control · comparables · plantilla/fotos · consolidador spec · hard-rules) + consolidación
**Insumo:** `docs/_analisis/DESCUBRIMIENTO_REGLAS_PLANTILLAS_COMPARABLES_20261005.md`

**Spec maestro usado (fuente única de verdad):**
- `docs/_md/VProperty_Especificacion_Proyecto_v1_9_17.md`
- `docs/_md/VProperty_Motor_Calculo_AT01_AT10_v2_7.md`
- `docs/_md/VProperty_Origen_Datos_Informe_v1.7.md` *(el prompt citaba v1.2; el repo tiene v1.7 — se usó la más nueva)*
- `docs/_md/VProperty_SLA_Negocio_v1.4.md`

**Leyenda de clasificación:** **(A)** ya decidido en spec · **(B)** ya construido en app/Airtable · **(C)** falta construir · **(D)** decisión real de Héctor aún abierta.

---

## §1 Resumen

**El descubrimiento sobre-estimó lo que faltaba decidir.** Al cruzar sus 10 "decisiones para Héctor" contra el spec maestro y el código, la mayoría **ya estaba decidida en spec o construida en la app**. Conteo:

| Clasificación | Nº ítems | Ejemplos |
|---|---|---|
| **(A) Ya decidido en spec** | 8 | factor_garantia/tasa/seguro como default de cliente (RF-34/RN-08/11/12); override 5,5% Las Rejas = NRB-01; AT04 fuera de scope (RF-27); comparables read-only (§2.8/A-13); avalúo "NO REGISTRA" (RN-37); re-foto REEMPLAZA (Héctor 28-ago) |
| **(B) Ya construido** | 9 | campos M_Clientes + motor los lee (AT03:785-826); 5 overrides CU-007 (seccion-overrides.tsx); override persiste y se audita en A_Cambios (auditoria.ts); desviación vs muestra se muestra (ensamblador.ts:439); pipeline comparables-foto vivo (GET-only + test); cap 16 fotos (imagenes.ts:132) |
| **(C) Falta construir** | 4 | purga A-45 (en escenario Make); afinar PLANTILLA_MET_v5 (11→8); backfill `adjunto_origen` de 6 seeds Caso 1; UI de alta de cliente IF-11 (otro CU) |
| **(D) Decisión real de Héctor abierta** | 1 (+2 ratificaciones menores) | **UF/m² final: ¿basta el control blando o se reactiva AT04?** Menores: lista TBD-04 (clientes ≠0.8) · redondeo entero `K9=13` |

**Titular:** de los 10 ítems que el descubrimiento marcó como "para Héctor", **4 ya están resueltos en spec, 2 ya son ambigüedades anotadas (A-35/A-44, no bloqueantes, plazo 31-oct-2026), 1 es tarea de datos y 1 está decidido-pendiente-de-ejecución (A-45)**. Queda **1 decisión de negocio genuina** (control del UF/m²) y 2 ratificaciones de catálogo/borde. **El camino para replicar los Casos 2–5 está despejado.**

---

## §2 Tabla por ítem

| # | Ítem | Clase | Evidencia |
|---|---|---|---|
| 1 | M_Clientes define `factor_garantia`, `tasa_cap_rate`, `factor_seguro_incendio` como DEFAULT por cliente | **A** | Spec §5.4/RF-34 (L4564-4578); RN-08/RN-11/RN-12 (L6814-6826); RF-36 variables sensibles versionadas; Origen v1.7 L1222-1227 (Lookup) |
| 2 | Esos campos EXISTEN en M_Clientes (Airtable) | **B** | `tblpK7AcYBMH93apK`: `factor_garantia`(fldbv6nAdOsR9rCQQ), `tasa_cap_rate`(fldT6zd1COvckWgqq), `factor_seguro_incendio`(fldS1GpxuH5BnCpqg) + `factor_seguro`(fldjC67OGZOfIRMEc), `redondeo_decimales`(fldoFQQCsBpZ7yS9L) |
| 3 | El motor LEE esos defaults, con guard fail-ruidoso si faltan | **B** | `AT03_Calculos_DAG.js:785-826` (lee `factor_garantia`/`tasa_cap_rate`/`factor_seguro`; guards H5/H6 → A_Eventos + throw, sin default silencioso) |
| 4 | `factor_garantia` default 0.8; lista de clientes ≠0.8 | **A** (default) · **D menor** (lista) | Default 0.8 en Spec L7232-7233 + RN-12; la lista exacta de clientes ≠0.8 = **TBD-04** (Spec L7421-7422) |
| 5 | Tasa exigida como dato maestro (4,5%/6,0%) | **A/B** | `M_Clientes.tasa_cap_rate` RB-52 (Motor L983-991; estándar 4,5%, Agencia Hab. 6,0%); Origen L1222. Extensión del catálogo = menor (análogo a TBD-04) |
| 6 | 5,5% del Caso 3 (Las Rejas) → override por solicitud, no default | **A** | Motor **NRB-01** L781-784 cita literal *"Las Rejas: 5,5% en lugar de 4,5% · Auditado en A_Cambios"*; Origen L1222 "(o override)". Entra por `tasa_cap_rate_override` en TX_Solicitudes |
| 7 | 5 overrides CU-007 en la UI | **B** | `components/tasador/form-sections/seccion-overrides.tsx:44-73` (tasa cap rate, vida útil, valor sugerido, valor reposición, seguro incendio) |
| 8 | Motivo del override OBLIGATORIO (≥20 chars) | **B** (con caveat) | `seccion-overrides.tsx:11,25-28` `MIN_MOTIVO=20`, `overridesValidos()`, label "(obligatorio)". ⚠ **Enforcement solo client-side**: el validador de `app/api/tasaciones/[id]/datos/route.ts` trata `motivoOverride` como `optional` sin cross-refine |
| 9 | El override REEMPLAZA el valor del motor | **B** | Motor AT03:688/817/1217 (`tasa_cap_rate_efectivo = override>0 ? override : cliente`); lectura `lib/tasador/lectura-informe.ts:371` (cascada `*_override ?? default`) |
| 10 | El motivo del override se AUDITA en A_Cambios | **B** | `datos/route.ts:337-350` → `derivarCambios`→`auditar()` de `lib/tasador/auditoria.ts` (escribe A_Cambios por `tabla_origen`+`registro_id`, CI-011). Patrón NRB-01/NRB-05/RN-23 |
| 11 | AT04 "Validar Rangos de Valor" (gate numérico duro) | **A** (fuera de scope) · NO implementado (correcto) | Spec RF-27 L4778-4788 "⛔ FUERA DE SCOPE IF-03 · decisión 27-ago-2026"; Motor L855-857 (repetido 7×). Grep de `rango_min/max_uf_m2`/`flag_revision` en app/lib/components = **cero**. Existe draft `AT04_Validar_Rangos.js` fuera del runtime |
| 12 | Desviación "TASACIÓN v/s PROMEDIO DE LA MUESTRA" se MUESTRA | **B** (display, no gate) | Origen v1.7 L1114-1116; `lib/informe/ensamblador.ts:439` (`tasacionVsPct`); render UI `seccion-comparables.tsx:171-177`. No bloquea ni alerta por umbral |
| 13 | Control del UF/m² final (acotar/alertar vs muestra) | **D — ABIERTA** | Spec sólo lo *muestra* (L2669); único umbral afín = **TBD-07** (dispara `flag_revision` de AT04, fuera de scope). No hay acotamiento especificado |
| 14 | Comparables SÓLO LECTURA desde foto; re-foto = única corrección | **A** | Spec §2.8 L2661-2670 (A-13 cerrada 23-ago: "sin posibilidad de modificarlos", "no hay botón Agregar ni eliminar"); RF-12 L2847; R-COMP-1 (Origen L1021/1060/1108) |
| 15 | Pipeline comparables-foto VIVO (escritor + lectura + UI read-only) | **B** | Escritor `AT03-Ext_script.js:548-745`; lectura `lib/tasador/lectura-datos.ts:168`; UI `seccion-comparables.tsx` Server Component puro; ruta `comparables/route.ts` **GET-only** + test candado `route.test.ts:93-101` |
| 16 | El "[ROTO]" de AT03-Ext:263-266 era falsa alarma | **B — confirmado** | Líneas 260-268 = comentario del docblock de cardinalidades; no hay código roto; cardinalidad honrada (`:609-620` guard, `:666-745` agrupación) |
| 17 | Re-fotografiar REEMPLAZA el conjunto anterior (P0-3) | **A — decidido** · **C — ejecución** | **Héctor 28-ago-2026, opción (a): REEMPLAZA** (`docs/_ambiguedades.md:1845-1851`). Purga pendiente en el **escenario Make**, no en el Route Handler (A-13 lo dejó read-only). `AT03-Ext_script.js:652-657` TODO(A-45) |
| 18 | Backfill `adjunto_origen` de los 6 seeds del Caso 1 | **C** | Tarea de datos derivada de #17; los 6 seeds no tienen `adjunto_origen` → no purgables en cascada. No es decisión de Héctor |
| 19 | Plantilla ÚNICA genérica + 8 páginas canónicas | **B** | Doctrina del repo (commits `87293a4`, `612db08`); `generar_plantilla_met_v2.py:main()` arma portada+Hoja1-5+Anexo1-2 = 8. El spec no dice "una plantilla por cliente" (grep vacío) |
| 20 | 11-vs-8 del Caso 1 | **B+C** | Overflow de maquetado: firma fuera de Hoja N°1 (+1) + 18 fotos reales vs 16 ranuras (+2). Se afina `PLANTILLA_MET_v5.docx`, no se separa por cliente |
| 21 | Tope de fotos | **B** (cap 16 construido) · máximo NO normado en spec | `lib/informe/imagenes.ts:132` `MAX_FOTOS_GRILLA=16` (+ warn/slice L228-234). Spec fija sólo **mínimos** (`M_TiposPropiedad.num_fotos_minimas`: Casa 8/Depto 10/Terreno 6, Origen L869-872); no hay máximo → es presentación/ingeniería, no decisión de Héctor |
| 22 | UI de alta de cliente (IF-11) que cargue los defaults | **A** (decidido RF-34) · **C** (fuera de este repo) | RF-34 lo exige; IF-11 es otro CU; hoy la carga en M_Clientes es manual en Airtable |
| 23 | Divergencia `factor_seguro` vs `factor_seguro_incendio` | **C — a confirmar** | Spec nombra `factor_seguro_incendio` (existe), pero el motor lee `factor_seguro` (existe). Capa Datos v2.6.5 L8054-8058: `factor_seguro` "reemplaza factor_seguro_incendio nivel 2". Dos columnas coexisten → confirmar cuál es la fuente viva antes de cargar clientes |
| 24 | Avalúo "NO REGISTRA" (Caso 4) | **A** | RN-37 (Spec L416-429), **validado contra HEV-3183**: → null + flag `avaluo_no_registra` + `avaluo_total_raw` |
| 25 | Redondeo entero por cliente (`K9=13`) | **D menor** | No aparece en ningún spec maestro. Ratificación menor |
| 26 | Factores D.F./F.M. del cuadro (default 1) | **ya anotado = A-35** (D-22) | Spec L2679, L7605-7619. No bloqueante · plazo 31-oct-2026 |
| 27 | 3 factores de homogeneización D-21 ausentes del cuadro | **ya anotado = A-44** (D-23) | Spec L2677, L7621-7633. No bloqueante · plazo 31-oct-2026 |
| 28 | Guard anti-merge de comparables (item sin `fila` anula el lote) | **C — técnica** | `AT03-Ext_script.js:609-620,711-716`. No está en spec; decisión técnica fina, no de negocio |

---

## §3 Lista REAL de decisiones de Héctor (destilada)

Tras el cruce, lo genuinamente abierto se reduce a **una decisión de negocio** + **dos ratificaciones menores**:

1. **[P0 · única real] Control del valor UF/m² final.** El tasador puede fijar el valor por m² por debajo del promedio de la muestra (Caso 1: −30%). Hoy hay **control blando ya construido**: motivo obligatorio ≥20 chars + auditoría en A_Cambios + desviación visible en pantalla. El **gate numérico duro (AT04)** está deliberadamente **fuera de scope IF-03 desde el 27-ago-2026**.
   **Pregunta:** ¿basta el control blando actual, o Héctor quiere **reactivar AT04** (alerta/corte automático + `flag_revision`/escalada al visador cuando el valor cae X% fuera del rango por comuna) sobre el valor ya con override? Reactivar AT04 = revertir la decisión del 27-ago y levantar `AT04_Validar_Rangos.js` del draft → tanda nueva, no fix.

2. **[Menor · catálogo] TBD-04 — lista de clientes.** El *mecanismo* (factor_garantia/tasa por cliente) ya está decidido y construido; falta **poblar el catálogo**: qué clientes tienen `factor_garantia`≠0.8 y qué clientes llevan tasa 6,0%/5,5% además de los observados. Es carga de datos, no arquitectura.

3. **[Menor · borde] Redondeo entero por cliente (`K9=13`).** No especificado en el spec maestro; ratificar comportamiento.

> **No reabrir** (ya resueltos): override 5,5% Las Rejas (NRB-01), tasa 6,0% como dato maestro (RB-52), factor garantía default 0.8 (RN-12), avalúo "NO REGISTRA" (RN-37), re-foto reemplaza (Héctor 28-ago), comparables read-only (A-13). **Ya anotadas, no bloqueantes:** A-35 y A-44 (plazo 31-oct-2026).

---

## §4 Qué falta CONSTRUIR de verdad para replicar los Casos 2–5

La arquitectura está completa; la réplica **recalculando** (no copiando) necesita:

| Prioridad | Qué | Dónde | ¿Bloquea la réplica? |
|---|---|---|---|
| **P0** | Poblar `M_Clientes` de los 5 clientes con `factor_garantia`, `tasa_cap_rate`, `factor_seguro` (resolviendo antes la divergencia #23 sobre cuál columna de seguro es la viva) | Airtable M_Clientes (manual o seed) | **SÍ** — el motor hace fail-ruidoso (H5/H6) si faltan; sin esto no recalcula |
| **P0** | Confirmar divergencia `factor_seguro` vs `factor_seguro_incendio` (cuál lee el motor en runtime) | AT03 + Capa Datos | **SÍ** — para cargar en la columna correcta |
| **P1** | Afinar `PLANTILLA_MET_v5.docx` → v6 (firma keep-together en Hoja N°1 + grilla de fotos a 16 ranuras) para que el informe salga en 8 páginas | `docs/_artefactos/carbone/` | No bloquea la validación de datos; sí la paridad de maquetado |
| **P2** | Purga A-45 en el escenario Make + backfill `adjunto_origen` de los 6 seeds Caso 1 | Make (no Route Handler) | No bloquea réplica con fotos frescas; sólo el re-fotografiado limpio |

**Nada de esto requiere escribir fórmulas nuevas ni plantillas nuevas ni tocar el pipeline de comparables.** Es carga de datos maestros + un ajuste de maquetado.

---

## §5 PROMPT SUGERIDO — Tanda de réplica de los Casos 2–5 (listo para pegar, SIN ejecutar)

```
Arrancamos TANDA T-TASADOR-E2E-CASOS-2a5-REPLICA-20261006 — replicar los Casos 2 a 5
RECALCULANDO con el motor (no copiando valores del Excel), validando cada informe contra su
PDF oráculo, en PARALELO (un caso por carril; un fallo no frena a los demás).

CONTEXTO (ya establecido por T-REGLAS-PLANTILLAS-COMPARABLES y T-RECONCILIA-SPEC-STATUS):
- 1 sola fórmula de cálculo (motor AT03 + C_Formulas); 2 parámetros por cliente YA decididos
  en spec y construidos: factor_garantia (default 0.8) y tasa_cap_rate, en M_Clientes, leídos
  por el motor con guard fail-ruidoso H5/H6.
- 1 sola plantilla genérica (PLANTILLA_MET, 8 páginas). Comparables = foto, sólo lectura.
- Los 5 casos y su material (Excel + PDF) están en docs/_referencias/5tasaciones/ y mapeados en
  docs/_analisis/DESCUBRIMIENTO_REGLAS_PLANTILLAS_COMPARABLES_20261005.md §5:
  C2=Agencia Habitacional VP-2026-0004 (rec19zYDt8muMQ9G4) · C3=Austral Leasing VP-2026-0005
  (recPx0yiK9k4oPG4V) · C4=Hip. Security VP-2026-0007 (reclC1CE5VHLTisKD) · C5=Hip. Evoluciona
  VP-2026-0006 (reci06q1kySVg43KG). C1=MetLife VP-2026-0073 ya validado 30/30.

PRE-REQUISITOS (hacer ANTES de recalcular, en una sub-fase 0):
1. Confirmar en runtime qué columna de seguro lee el motor: factor_seguro vs factor_seguro_incendio
   (divergencia #23 de la reconciliación). Cargar el valor en la columna viva.
2. Poblar M_Clientes de los 5 clientes con factor_garantia, tasa_cap_rate y factor_seguro según
   el Excel de cada caso (C1 MetLife ×0.8; C2 Agencia ×1.0 + tasa 6,0%; C3 Security ×0.8 + tasa
   5,5% COMO override de solicitud, no default; C4 Evoluciona ×0.8; C5 Austral ×1.0). Sin esto el
   motor hace fail-ruidoso.
3. (Recomendado, no bloqueante) Afinar PLANTILLA_MET_v5 → v6 para que el PDF salga en 8 páginas
   (firma keep-together + grilla de fotos a 16 ranuras).

POR CASO (C2..C5), en paralelo:
- Sembrar la solicitud con los INPUTS del Excel (no los resultados): superficies, UF del día,
  avalúo, arriendo, D.F./F.M. (default 1 salvo que el Excel diga otra cosa · A-35), y el override
  de tasa donde corresponda (C3 5,5% vía tasa_cap_rate_override con motivo auditado).
- Subir las fotos del caso (incluida la foto del cuadro de comparables → pipeline RF-09/AT03-Ext).
- Dejar que el MOTOR calcule valor comercial, seguro/garantía, reposición, remate, liquidación.
- Generar el informe y el PDF; comparar dato-por-dato contra el PDF oráculo del caso.

AUTORIZACIÓN: se permite WRITE acotado a sembrar las 4 solicitudes de prueba y cargar M_Clientes;
NO tocar código de IF-02/IF-03 ni la plantilla salvo el ajuste de maquetado autorizado; NO
commit/push; evidencia por caso en docs/_evidencia/T-TASADOR-E2E-CASOS-2a5-REPLICA-20261006/.

ENTREGABLE: tabla de validación por caso (igualdad N/N vs oráculo) + cierre con los casos que
pasan y los que requieren decisión (p.ej. si el UF/m² de algún caso dispara el debate del control
blando vs AT04). Si la decisión P0 de Héctor sobre el control del UF/m² sigue abierta, replicar
igual con control blando (como el Caso 1) y marcarlo.
```

---

## §6 Nota de reconciliación entre agentes

- **P0-3 (purga/reemplazo):** el Agente 5 lo marcó "abierto" porque buscó sólo en los 3 docs maestros + `aprendizajes.md`; el Agente 3 encontró la **resolución explícita de Héctor (28-ago-2026, opción a: REEMPLAZA)** en `docs/_ambiguedades.md:1845-1851`. Prevalece el Agente 3: **decidido, ejecución pendiente** (purga en el escenario Make).
- **Caveat de enforcement:** el motivo obligatorio del override (≥20 chars) se valida **sólo client-side**; el validador del Route Handler lo trata como opcional. No bloquea la réplica, pero conviene registrarlo como deuda si el control blando va a ser la única barrera (relevante para la decisión P0 de Héctor).

---

*Entregable único de esta tanda: este `.md`. Tanda SOLO LECTURA — sin writes a Airtable/Make/código/plantilla, sin commit/push.*
