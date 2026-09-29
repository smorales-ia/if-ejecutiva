# Rollback — T-PDF-IDENTICO-20260927

> Estado original registrado ANTES de cada cambio. Fecha base: 28-sep-2026.
> Los agentes de ejecución agregan su sección ANTES de tocar cada pieza.

## Snapshots tomados en Bloque 0 (28-sep-2026, pre-cambios)

| Pieza | Snapshot | Rollback |
|---|---|---|
| VP-2026-0067 (`recmMzeu3eWGxyXsf`, estado `pdf_listo`) | `snap-VP0067-pre.json` | PATCH con los valores del snapshot |
| C_Formulas F_UFm2_promedio v3.2 (`recFcpOeKjXNunBlj`) | `snap-formula-promedio-pre.json` | restaurar campo expresión textual |
| C_Formulas F_DesviacionVsPromedio v1.0 (`recliyqVJAGatkDw0`) | `snap-formula-desviacion-pre.json` | restaurar campo expresión textual |
| Blueprint E2 (5750023, `E2_Carbone_Render v2.0`, inactivo) | `blueprint-pre-5750023-redacted.json` | PATCH blueprint (reinyectar Authorization Carbone + hook E3 desde credenciales) |
| Blueprint E3 (5791413, `E3_Carbone_Download_Dropbox v2.1`, inactivo) | `blueprint-pre-5791413-redacted.json` | PATCH blueprint (ídem) |
| `CARBONE_TEMPLATE_ID` actual | `070757d80034364c781d05184beea235c5a503b63f5037b761e375f9f182b54d` (template v1, sigue existiendo en Carbone) | re-apuntar `.env.local` + URL módulo 2 de E2 a este ID |
| Código app (lib/, app/, components/) | git — working tree limpio al inicio de la rama `feat/T-PDF-IDENTICO-20260927` | `git checkout` (lo ejecuta Sergio) |
| AT03 | Automation declarada OFF por Sergio (27-sep); script original `docs/_artefactos/airtable/AT03_Calculos_DAG.js` en git | git; AT03 queda OFF al cierre |

## Secciones por pieza (append de los agentes de Fase 2)

# Rollback B-DATA — T-PDF-IDENTICO-20260927 (28-sep-2026)

> Valores viejos registrados ANTES de cada PATCH. Restaurar = PATCH con `valor_viejo`.
> Filas creadas = DELETE. Complementa `rollback.md` (snapshots completos en `snap-*.json`).

## TX_Solicitudes · recmMzeu3eWGxyXsf (snapshot completo: snap-VP0067-pre.json)

| campo | valor_viejo | valor_nuevo |
|---|---|---|
| numero_solicitud | `METLIFE-6283-REAL` | `METLIFE -6283` |
| cliente_final_nombre | `FRANCISCO JOSE VERGARA UNDURRAGA` | `FRANCISCO JOSÉ VERGARA UNDURRAGA` |
| direccion | `LOS EUCALIPTUS 2100` | `LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO` |
| rol_sii | `00882-00040` | `N°882-40` |
| vida_util_override | (ausente) | `70` |

⚠ `numero_solicitud` pierde el sufijo sandbox `-REAL` (aislamiento documentado en
`override_motivo`, que NO se toca). El nombre de archivo que E3 sube a Dropbox cambia en
consecuencia. Reversible con el valor viejo.

El Link `tasador` (recJPSCLckxLuf9nV · "Nelcy Jaimes") **NO se cambia**: el guard RF-09
(`clerk_user_id === tasador`) dejaría de autorizar la corrida real. El nombre impreso
"Maria Eugenia Soto" va por overrides.

## TX_DatosTasacion · recy8q3Tq9omjdNUf

| campo | valor_viejo | valor_nuevo |
|---|---|---|
| anio_construccion | `2020` | `2024` |
| propietario_nombre | `FRANCISCO JOSE VERGARA UNDURRAGA` | `FRANCISCO JOSÉ VERGARA UNDURRAGA` |

Intentados y **rechazados por Airtable (campos computed, sin cambio)**:
`avaluo_fiscal_uf` (formula; hoy muestra el CLP 339809429 — el UF correcto 8517.68 ya
viaja por `TX_Calculos`/terminales) y `sup_construida_total` (formula; queda 0 — el
impreso usa `sup_construccion_m2 = 249.91`).

## TX_DocumentosLegales · rec7t4cD2zjuJKpXq

| campo | valor_viejo | valor_nuevo |
|---|---|---|
| permiso_edificacion_numero | `319-2020` | `N°319  09/09/2020` (doble espacio, forma impresa XLSM) |
| recepcion_final_numero | `210-2024` | `N°210  18/07/2024` (ídem) |

(`permiso_edificacion_fecha`/`recepcion_final_fecha` date quedan intactos.)

## TX_Comparables (7 filas de VP-0067)

| record_id | campo | valor_viejo | valor_nuevo |
|---|---|---|---|
| rec2aFg7XPsbSjufp · recXGxAeVg2ThVUfQ · recKGLWdMaK0lrXCh · recUAawogrtK3AJ59 · recniOUZHto7ZaA1E · recmizO68egY2SUiR · recD9eZEG2Ilpm2lx | comuna_comparable | (vacío en las 7) | `Colina` |

`uf_m2_terreno_f`, `oo_cc_uf`, `fecha_publicacion`, `telefono_contacto` ya estaban
correctos (verificado contra el XLSM) — sin cambios.

## TX_HabitacionesPorNivel (normalización a los rótulos del XLSM)

| record_id | campo | valor_viejo | valor_nuevo |
|---|---|---|---|
| recL3B487noW4qrsL | tipo_recinto | `Sala` | `Estar` |
| recKBxWV8flOICDTY | tipo_recinto | `Otro` | `Hall` |
| recGj1VoH6b2PboOr | tipo_recinto | `Lavadero` | `Loggia` |
| rec5LRrxMRYeXImUW | tipo_recinto | `Bano` (cantidad 1) | `1/2 Baño` |
| recfd0RTx4q3xqrSc | tipo_recinto | `Bano` (cantidad 3) | `Baños` |
| **rec2FJTUr70MkIhCe** (fila creada) | — | — | `{nivel: Piso1, tipo_recinto: "B.Servicio", cantidad: 1}` → rollback = **DELETE rec2FJTUr70MkIhCe** |

## H_PreciosUF

Sin escrituras: la fila del 13-04-2026 (`recbnHFtlFHQnyEM9`) YA tiene `valor_clp
39894.61` y `tipo_cambio_usd 890.33`. El dólar no llegaba al payload por el filtro
`{fecha}="2026-04-13"` del ensamblador (campo dateTime — 0 matches); la fórmula que sí
matchea es `DATETIME_FORMAT({fecha},'YYYY-MM-DD')="2026-04-13"` (verificado por REST).
Fix en código = dominio B-CODE.

## C_Formulas / AT03

**Sin escrituras en esta sesión** (pendiente confirmación de Sergio AT03 OFF — ver
`fix-motor-preparado.md`). Expresiones actuales respaldadas en
`snap-formula-promedio-pre.json` y `snap-formula-desviacion-pre.json`.

# Rollback — pieza PLANTILLA v2 (B-TEMPLATE)

Registrado ANTES de re-apuntar. Fecha: 28-sep-2026.

| Qué | Valor original (pre-cambio) | Rollback |
|---|---|---|
| `CARBONE_TEMPLATE_ID` en `.env.local` | `070757d80034364c781d05184beea235c5a503b63f5037b761e375f9f182b54d` (PLANTILLA_MET_v1 — sigue existiendo en Carbone, no se borra) | restaurar esa línea en `.env.local` |
| URL módulo 2 del scenario E2 (5750023) | `https://api.carbone.io/render/070757d8…b54d` (blueprint completo en `blueprint-pre-5750023-redacted.json`) | PATCH blueprint con la URL vieja (reinyectar Authorization Carbone desde `<CARBONE_PROD>` — en Make el valor vigente se conserva si no se toca el header) |
| Plantilla nueva publicada | `PLANTILLA_MET_v2.docx` → templateId `517ddc620992eb71a97a8f3b34d33d54bfc3cdea3c2573ead868f2650c14434d` | `DELETE /template/{id}` si se descarta |
| Templates de prueba intermedios | `b4790018c7591cb8…` y `2b68f1f870cb5e73…` (iteraciones 1-2) | borrados al publicar (DELETE) — no requieren rollback |

Estado E2 al momento del PATCH: **inactivo** (isActive=false). El PATCH lo deja detenido;
el GO-LIVE (`POST /scenarios/5750023/start`) es del orquestador de la tanda.


## Saneo TX_DocumentosGenerados post-corrida (28-sep, Bloque 2)

| Acción | Registro | Estado previo | Rollback |
|---|---|---|---|
| DELETE | `recRSTiml7mTN1uUS` (duplicado por reproceso de bundle viejo al re-encender E3; mismo render_id `MTAuMjAuMjEuNDMg…`, plantilla v1, vigente True) | duplicado exacto de `recWP8Ex4XuPoNIfG` | re-crear con esos campos (no hace falta: era espurio) |
| PATCH | `recWP8Ex4XuPoNIfG` | `es_vigente: True` | `es_vigente: true` |
| PATCH | `rec2iw3c9ft5d1TXR` (fila de la corrida v2) | `plantilla_version: "PLANTILLA_MET_v1"` (hardcode de E3) | restaurar ese valor |
| PATCH blueprint E3 (5791413) | `plantilla_version` hardcodeado "PLANTILLA_MET_v1" en el módulo create DocGen | blueprint pre en `blueprint-pre-5791413-redacted.json` | re-PATCH con el blueprint pre |
