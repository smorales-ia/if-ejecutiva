# Mapeo cliente → M_Clientes → actual vs propuesto — TANDA DETENIDA EN GATE

**Tanda:** T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005 · CONSOLIDACIÓN
**Fecha:** 2026-10-05 · **Escrituras en Airtable:** NINGUNA (veredicto global: **OMITIDO — tanda detenida en Gate**)

## Por qué todos los renglones dicen OMITIDO

La fuente autorizada (`NUEVA_VERSION_PLANILLA MARZO 2026.xlsm`) **no contiene parámetros por
cliente** (evidencia: `descubrimiento-planilla.md` §1). Los valores "propuestos" de esta tabla
salen del **template de cálculo** `Formato-Informe-VProperty-Enero2026.xlsm` (Portada!BO51 ·
Portada!BJ41 · FICHA SOLIC!V25:X64), que **no era la fuente autorizada**. Nada se escribió en
`M_Clientes`; esta tabla existe para que Sergio y Héctor decidan.

## Cómo leer la tabla

- **Universo:** unión de los 40 clientes del template (N=1…40), las 28 empresas de la planilla
  maestra `Variables!G2:H29` (filas 2–29; el descubrimiento las cita como "29 filas" — son 28
  datos más la cabecera) y los records ACTIVOS de M_Clientes (los 6 con solicitudes vigentes
  según `mapa-registros.md`). Total: **43 renglones** (40 template + 3 solo-planilla).
- **record_id:** el ACTIVO del grupo si tiene solicitudes vigentes (**negrita**); si el grupo no
  tiene vigentes, el mejor candidato según `mapa-registros.md` (en cursiva la duda).
- **Actual / Propuesto:** `fg`=factor_garantia · `fs`=factor_seguro · `cap`=tasa_cap_rate ·
  `rd`=redondeo_decimales. **Propuesto `rd` = — para todos** (sin fuente estable; solo drift
  en instancias). ⚠ marca discrepancia actual↔propuesto.
- **NOTA GARANTÍA/SEGURO:** el template tiene **un solo terminal** (`Portada!BO51`, ratio en
  `DB51`) para garantía y seguro — **no define un `factor_garantia` separado**. El propuesto
  puebla el mismo valor en ambos campos; hoy Airtable tiene `fg=0,8` en los 77 records con
  valor, así que **todo cliente de whitelist (propuesto 1,0) discrepa también en `fg`**.
- **Condición Casa (transversal):** todo cliente con base 0,8 pasa a **1,0 si
  `tipoPropiedad="Casa"`**, sea cual sea el cliente. En la tabla, `0,8→1,0C` = base 0,8 con
  condición Casa. La condición vive en el motor, no en M_Clientes: si se poblara, se guardaría
  el factor-base.
- **Motivos:** `[FUENTE-DETENIDA]` el template lo trae claro (pero la tanda se detuvo en Gate) ·
  `[SIN-FUENTE]` no está ni en template ni en planilla · `[MATCH-DUDOSO]` cruce nombre↔record
  ambiguo · `[CONDICIONAL]` el factor depende del tipo de propiedad de forma que afecta el
  valor hoy almacenado · `[CONFLICTO]` el template contradice un valor vigente/validado.

## Tabla central (43 renglones · veredicto: OMITIDO en todos)

| N | Cliente (template / planilla) | record_id M_Clientes | Actual fg · fs · cap · rd | Propuesto fg · fs · cap | Δ | Veredicto · motivo |
|---|---|---|---|---|---|---|
| 1 | Hipotecaria Security S.A. (PRI) | **recVTKsZLNSDNInky** (ACTIVO, VP-0076) | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] · dup: recXVtuMT2wjIVzz2 (fs=0,8) y recSi2XsxHtByImuI SECURITY PRINCIPAL. Override manual observado: BJ41=5,5% en "Las Rejas Norte 65" |
| 2 | MetLife (MET) | **recIg8NtVhptXkEUJ** (ACTIVO, VP-0066/0067/0073) | 0,8 · 1 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs actual 1 = rama Casa, base template 0,8 | OMITIDO · **[CONDICIONAL]** · el 1,0 validado (Los Eucaliptus) viene de Casa, no del cliente; un depto MetLife usa 0,8 (La Marina 1176). No aplanar. Dup: recimE810cuyWIR9q (vacío), recwxQlPhJTXgig93 (único rd=2 de la base) |
| 3 | Unidad Leasing Habitacional (ULH) | *recXFlArdmTAJvvYl* "ULH (BICE) Leasing" (0 vigentes) | 0,8 · 1 · 0,06 · — | 1,0 · 1,0 · 0,06 | ⚠ fg 0,8→1,0 | OMITIDO · **[MATCH-DUDOSO]** · dos records (rec9AnivjtqivJcEB vacío / ULH (BICE)); relación con los 3 records BICE por confirmar |
| 4 | Hipotecaria Evoluciona (HEV) | **recPDwixzybwHlJaQ** (ACTIVO, VP-0077) | 0,8 · 0,8 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | = | OMITIDO · [FUENTE-DETENIDA] · legacy rec8QDoxN3LGvYLcm EVOLUCIONA (6 links, todas canceladas) |
| 5 | M&V (M&V) | *recH4CU7AI1eYPVM3* ó *reclREZKDnYh5BQTI* | 0,8·0,825·0,045 / 0,8·0,8·0,045 | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · **[MATCH-DUDOSO]** · par M&V / M&V (Munita y Vergara), 0 vigentes ambos |
| 6 | MásLeasing (MAS LEASING) | *recRC2WEkLfXkMO50* ó *recYY0ebDMrZ2Qu1c* | 0,8·0,825·0,045 / 0,8·0,8·0,06 | 1,0 · 1,0 · 0,06 | ⚠ fs, fg; cap del 06-04 difiere | OMITIDO · **[MATCH-DUDOSO]** · par MAS LEASING / Másleasing |
| 7 | Agencia Habitacional (AG) | **recX80z73mCtC4BBo** (ACTIVO, VP-0074) | 0,8 · 0,8 · 0,06 · — | 1,0 · 1,0 · 0,06 | ⚠ fs 0,8→1,0 y fg 0,8→1,0 | OMITIDO · [FUENTE-DETENIDA] · el Gate validó 1,0 (whitelist N=7); el fs=0,8 actual quedaría corto. Esqueleto rec8K5fUpTEoxD9yS AGENCIA |
| 8 | Administradora Andes S.A. (ANDES) | *recW7rw9EpxapRVFj* (1 link, cancelada) | 0,8 · 0,825 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · **[MATCH-DUDOSO]** · par ANDES (vacío) / Administradora Andes S.A. |
| 9 | Afianza (AFZ) | *rec9RA23ezRX6gi4o* (seed sin uso) | 0,8 · 0,825 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · [FUENTE-DETENIDA] · esqueleto rec6ulVTTtCUeD8QO AFIANZA (vacío, uso solo histórico) |
| 10 | Particular (PAR) | *recbrHmj9YUJ01BY5* "Particular" | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · **[MATCH-DUDOSO]** · par PARTICULARES (vacío) / Particular; además "Paris Crédito Hipotecario" usa el mismo código `PAR` |
| 11 | 4 LIFE (4LIFE) | **receWMWb6Qwe1gsnC** (ACTIVO, VP-0062 visitada) | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] · esqueleto recngf122DQ5Tevtu 4LIFE (vacío) |
| 12 | Chile Vivienda (CHILE VIVIENDA) | *recDhiwPgxjpEyX4d* "Chilevivienda" | 0,8 · 1 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fg 0,8→1,0 | OMITIDO · **[MATCH-DUDOSO]** · par CHILE VIVIENDA (vacío) / Chilevivienda |
| 13 | Concreces (CONCRECES) | *recWvXIiwahdV7otI* ó *recPSVC4X8ConYKi2* | 0,8·0,825·0,045 / 0,8·1·0,06 | 1,0 · 1,0 · 0,06 | ⚠ según record | OMITIDO · **[MATCH-DUDOSO]** · par CONCRECES / Concreces Leasing; solo el 06-08 trae cap=0,06 correcto |
| 14 | Bice Hipotecaria (BMU, ambiguo) | *recCveeu7mJ0Vl0Un* / recFZQQE4RIjyHbR6 / recb5h4CuyLp3D9c7 | 0,8·0,8·0,045 / 0,8·0,825·0,045 / 0,8·0,8·0,06 | 0,8 · 0,8→1,0C · 0,045 | ⚠ según record | OMITIDO · **[MATCH-DUDOSO]** · 3 records BICE (+ ULH (BICE)); **prefijo `BCH` duplicado con Banco de Chile en el template** |
| 15 | CrediHome (CREDIHOME) | *recwDkXSzFG1alEhr* "Credihome (CRD)" | 0,8 · 0,8 · 0,06 · — | 1,0 · 1,0 · 0,06 | ⚠ fs 0,8→1,0 y fg | OMITIDO · [FUENTE-DETENIDA] · esqueleto recb9KnrD9wYvCp22 CREDIHOME (vacío) |
| 16 | Banco de Chile (BCH) | *reciyPPDIgLcyIH07* "Banco de Chile" | 0,8 · 1 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs actual 1 vs base 0,8 | OMITIDO · **[MATCH-DUDOSO]** · prefijo `BCH` colisiona con Bice Hipotecaria; esqueleto recOfiHWwHEUzgPCw (vacío, 10 canceladas). ¿El fs=1 del seed es intencional o error? |
| 17 | ServiHabit (SERVIH) | *recAzjyjZW8RqzR6Z* "ServiHabit (SVH)" | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] · esqueleto reco6l8flOx08T4bg SERVIHABIT (vacío) |
| 18 | Credicasa Del Maule SPA (— sin hoja) | rec6yblMwRzyFLSsL | 0,8 · 0,825 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · [FUENTE-DETENIDA] |
| 19 | Copeuch (— sin hoja) | *recHXZHZsg33TpwoJ* "Coopeuch" (COR) | 0,8 · 0,8 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | = | OMITIDO · **[MATCH-DUDOSO]** · template dice "Copeuch", record dice "Coopeuch" y código COR vs COPE — probable mismo cliente, confirmar |
| 20 | Austral Leasing Habitacional (LEASING AUSTRAL) | **recU6gfHmmCWZN5Mm** (ACTIVO, VP-0075) | 0,8 · 0,8 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs 0,8→1,0 y fg | OMITIDO · [FUENTE-DETENIDA] · el Gate validó 1,0 (whitelist N=20); el fs=0,8 actual quedaría corto. Esqueleto recklwpIt0Cv4eqk1 |
| 21 | Tu Hipotecaria Chile (— sin hoja) | recM4Xm1IlKdnGvac | 0,8 · 0,825 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · [FUENTE-DETENIDA] |
| 22 | ICGE (hoja `ICGE␣` con espacio final) | *recucWvNTRDw8QISS* ó *recphwp4pgfkgNChn* | 0,8·0,825·0,045 / 0,8·1·0,06 | 0,8 · 0,8→1,0C · **0,045 (rama muerta 6,0%)** | ⚠ cap en disputa | OMITIDO · **[CONFLICTO]** · la rama `"ICGE Gestión Empresa"` de BJ41 nunca matchea `"ICGE"` → hoy rige 4,5% aunque la intención aparente era 6,0%; el record ICGE Internacional ya tiene 0,06. Decidir con Héctor. También MATCH-DUDOSO (par + espacio final) |
| 23 | Casa Pronta (— sin hoja) | recOxiYsVOTvoJPH7 | 0,8 · 0,825 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · [FUENTE-DETENIDA] |
| 24 | Leasing Urbano (— sin hoja) | recX0HLhhcn1bBAgx | 0,8 · 0,825 · **0,06** · — | 0,8 · 0,8→1,0C · **0,045** | ⚠ cap 0,06→0,045 y fs | OMITIDO · **[CONFLICTO]** · el template NO lo lista en 6,0% (BJ41) pero el record vigente tiene 0,06 — contradicción frontal, decidir con Héctor |
| 25 | Ohio National (— sin hoja) | recU3PLgeapmpkGcI | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] |
| 26 | Penta Hipotecario (Penta Hipotecario) | *rectvgirk94PmIUKm* ó *recYAAxUCRqhCDgyn* | 0,8·0,825·0,045 / 0,8·1·0,045 | 0,8 · 0,8→1,0C · 0,045 | ⚠ según record | OMITIDO · **[MATCH-DUDOSO]** · par Penta Hipotecario / Penta Hipotecaria (y Penta Vida es cliente distinto, N=30) |
| 27 | Banco Estado (— sin hoja) | rec5fsRjNbLt9VcFt (6 links, todas canceladas) | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] |
| 28 | Su Casa Hoy (— sin hoja) | recLf6tbUfqhKZOgN | 0,8 · 0,825 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · [FUENTE-DETENIDA] |
| 29 | Casa Nuestra (— sin hoja) | receE0qIASmpRtZLE | 0,8 · 0,825 · 0,045 · — | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · [FUENTE-DETENIDA] |
| 30 | Penta Vida (— sin hoja) | rec3fQVp2hbjpsyXb | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] |
| 31 | Valor Presente (VLP) | *recdldMS9TYs9sv39* "Valor Presente (VP)" | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] · esqueleto rec9UF0Fj4er7OVA0 VALOR PRESENTE (vacío) |
| 32 | Espacio Nuestro (— sin hoja) | rec4m95uIERRnUmwZ | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] |
| 33 | Nuevo Capital Mutuos Hipotecarios (hoja NCH; empresa `NUEVO CAPITAL␣` con espacio final) | *recfwJelCHYjuHWy4* | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · **[MATCH-DUDOSO]** · par NUEVO CAPITAL (vacío) / Nuevo Capital MH; espacio final en la planilla |
| 34 | Central Mutuos (CHI, inferido) | *rec0ztGhehWtblsr3* ó *recdnihNoqtvfmSQA* | 0,8 · 0,825 · 0,045 (ambos) | 1,0 · 1,0 · 0,045 | ⚠ fs y fg | OMITIDO · **[MATCH-DUDOSO]** · ¿CENTRAL HIPOTECARIA = Central Mutuos? Hoja CHI inferida por nombre |
| 35 | Tessi (TESSI) | *reckDh71r8Lm2Kv2s* ó *rec9emcQ2xagiCyzp* | 0,8·0,825·0,045 / 0,8·0,8·0,06 | 0,8 · 0,8→1,0C · **0,06** | ⚠ cap del 06-04 0,045→0,06 | OMITIDO · **[MATCH-DUDOSO]** · par TESSI / TESSI Servicios. Ojo: Tessi está en la lista 6,0% de BJ41 pero NO en la whitelist de BO51 (ejes independientes) |
| 36 | CrediTú (CREDITU) | *recBVAW5lqBLGqQmy* ó *recJExaBnlEVlyeuZ* | 0,8 · 0,825 · 0,045 (ambos) | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · **[MATCH-DUDOSO]** · par CREDITU / CrediTú |
| 37 | Banco Santander-Chile (— sin hoja) | *rec5QnUmnymAOcla9* "Santander Hipotecaria" (SAH) | 0,8 · 0,8 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | = | OMITIDO · **[MATCH-DUDOSO]** · ¿"Santander Hipotecaria" = "Banco Santander-Chile" (prefijo BSAN)? Sin record con ese nombre/prefijo |
| 38 | BCI (— sin hoja) | recF3UI4qlah44VrN "BCI Mutuos" (4 links, todas canceladas) | 0,8 · 0,8 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | = | OMITIDO · [FUENTE-DETENIDA] · nombre varía (BCI vs BCI Mutuos) pero código BCI coincide |
| 39 | Consorcio (— sin hoja) | recesePOB1AG4G6Jn | 0,8 · 0,825 · 0,045 · — | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs 0,825→0,8 | OMITIDO · [FUENTE-DETENIDA] |
| 40 | Scotiabank (— sin hoja) | *recyT7db4bylkygeS* "Scotiabank" ó *rec8VDwUnwuk9KZUw* "Scotia Crédito Hipotecario" | 0,8 · 1 · 0,045 (ambos) | 0,8 · 0,8→1,0C · 0,045 | ⚠ fs actual 1 vs base 0,8 | OMITIDO · **[MATCH-DUDOSO]** · dos records Scotia; prefijo template SCTB no existe en M_Clientes (SCB/SCO) |
| — | HIPOTECARIA LA CONSTRUCCION (solo planilla, hoja HLCO) | *recxEg7RiBxtqRCfY* ó *rec6ETMQtes5VR7Kh* | 0,8·0,825·0,045 / 0,8·1·0,045 | **sin propuesta** | — | OMITIDO · **[SIN-FUENTE]** · no es seleccionable en FICHA SOLIC!K8 del template; par HLCO / La Construcción Hipotecaria |
| — | EXTERIOR (solo planilla) | recnY3zdDK4G5z81i | 0,8 · 0,825 · 0,045 · — | **sin propuesta** | — | OMITIDO · **[SIN-FUENTE]** · hoja de la planilla sin cliente en el template |
| — | FINANCIERA Y HABITACIONAL (solo planilla) | recdchMPfjyGvKmak | 0,8 · 0,825 · 0,045 · — | **sin propuesta** | — | OMITIDO · **[SIN-FUENTE]** · hoja de la planilla sin cliente en el template |

## Resumen de motivos (43 renglones, todos OMITIDO)

| Motivo principal | Renglones | Clientes |
|---|---|---|
| [FUENTE-DETENIDA] | **20** | N=1, 4, 7, 9, 11, 15, 17, 18, 20, 21, 23, 25, 27, 28, 29, 30, 31, 32, 38, 39 |
| [MATCH-DUDOSO] | **17** | N=3, 5, 6, 8, 10, 12, 13, 14, 16, 19, 26, 33, 34, 35, 36, 37, 40 |
| [SIN-FUENTE] | **3** | HLCO · EXTERIOR · FINANCIERA Y HABITACIONAL |
| [CONFLICTO] | **2** | N=22 ICGE (tasa rama muerta) · N=24 Leasing Urbano (cap 0,06 vigente vs 0,045 template) |
| [CONDICIONAL] | **1** | N=2 MetLife (el fs=1 almacenado es la rama Casa, no el factor del cliente) |

## Discrepancias sistémicas actual↔propuesto (las que importan en volumen)

1. **`fs=0,825` en 37 records** (sospecha errata RB-53, `mapa-registros.md` §6): el template
   **no produce 0,825 jamás** — solo 0,8 o 1,0. Los 37 discrepan con cualquier lectura del
   template.
2. **`fg=0,8` en los 77 records con valor**: como BO51 es terminal único, los clientes de
   whitelist tendrían `fg=1,0`. Si se decide mantener dos campos en Airtable, hoy deberían
   valer lo mismo; cualquier divergencia fg≠fs sería invento.
3. **Default silencioso ×0,8** del template para cliente no listado (P0 ya levantado en
   `DESCUBRIMIENTO_REGLAS_PLANTILLAS_COMPARABLES_20261005.md`): afecta a cualquier cliente
   nuevo que se agregue sin tocar la fórmula.
4. **Herrumbre de la whitelist**: referencia ClienteN 41–46 inexistentes y N=8 duplicado —
   `ClienteN` no es clave estable; el cruce se hizo por nombre textual.

## Fuera del universo (constancia)

M_Clientes tiene además ~17 records sin contraparte en template ni planilla (Aseguradora
Continental, BBVA Hipotecaria, Banco Falabella, Banco Itaú, Banco Ripley, Citi Mutuos,
Eurocapital, HCS/Hipotecaria Compass, HLC Hipotecaria Continental, Mi Hipoteca, Mutuosa,
Paris Crédito Hipotecario, Sim Hipotecaria, VALÓN Hipotecaria ×2, Vivienda Plus, más la fila
basura y 2 SANDBOX). Detalle en `LISTA_FALTANTES.md` §3 y `LISTA_DUPLICADOS.md`.
