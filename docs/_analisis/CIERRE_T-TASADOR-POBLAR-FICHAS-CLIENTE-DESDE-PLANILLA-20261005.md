# CIERRE · T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005

**Fecha:** 2026-10-05 · **Objetivo:** poblar en M_Clientes los parámetros reales por cliente (factor_garantia, factor_seguro, tasa_cap_rate, redondeo) desde la planilla maestra `NUEVA_VERSION_PLANILLA MARZO 2026.xlsm`.
**Resultado global:** **TANDA DETENIDA EN GATE (Bloque 0), por la regla prevista en el propio mandato: la fuente autorizada NO contiene parámetros por cliente. CERO escrituras en M_Clientes** (verificado por spot-check contra el backup: 3/3 idénticos). La detención quedó convertida en material accionable: la fuente real fue localizada, la tabla completa de 40 clientes extraída como propuesta, y las listas para Héctor armadas.

---

## 1 · Por qué se detuvo (la evidencia del Gate)

- La planilla maestra indicada es el **libro operativo de bandeja**: 33 hojas-log por cliente (solicitudes), `Honorarios`, `Variables` (tasadores/comunas/ejecutivos). Barrido exhaustivo: rótulos en las 33 hojas, celdas numéricas de `Variables`, 25 nombres definidos y los strings del VBA (349 KB) — **no existe `factor_garantia`, `factor_seguro`, `tasa_cap_rate` ni `redondeo` en ninguna forma**. Lo único por-cliente es el mapeo Empresa↔Hoja (`Variables!G2:H29`, 28 empresas). Detalle en `descubrimiento-planilla.md`.
- El mandato era explícito: "Si la planilla NO contiene parámetros por cliente → DETENER". La autorización de escritura era "con los valores de la planilla maestra"; escribir desde otra fuente excede lo autorizado.

## 2 · Dónde SÍ viven los parámetros (plan B, listo para autorizar)

En el **template de cálculo** `Formato-Informe-VProperty-Enero2026.xlsm` (fórmulas idénticas verificadas contra la instancia caspana):
- Lista numerada de **40 clientes** en `FICHA SOLIC!V25:X64` (ClienteN por VLOOKUP de nombre + prefijo).
- **Factor de seguro** como whitelist hardcodeada en `Portada!BO51`: ×1,0 si ClienteN ∈ {3,5,6,7,8,9,12,13,15,18,20,21,23,28,29,34,41,43,44,45,46} **o `tipoPropiedad="Casa"`**; ×0,8 el resto.
- **Tasa**: 6,0% para ULH/Concreces/Agencia/CrediHome/MásLeasing/Tessi; 4,5% el resto (rama "ICGE Gestión Empresa" muerta → ICGE queda 4,5%).
- **Controles del Gate: 4/4 ✅** — Agencia=1,0 · Austral=1,0 · Security=0,8 · **MetLife=base 0,8 con condición Casa→1,0** (el 1,0 "validado" venía del caso Casa 1951-MET; no aplanar).
- La tabla completa está extraída en `extraccion-planilla.json` y volcada por cliente en `mapeo.md`.

## 3 · Mapeo y listas (los entregables del cierre)

- **`mapeo.md` — 43 renglones**, todos OMITIDO (Gate): **20 [FUENTE-DETENIDA]** (propuesta clara, solo falta autorizar la fuente) · **17 [MATCH-DUDOSO]** (cruce nombre↔record ambiguo, c/u con su pregunta) · **3 [SIN-FUENTE]** · **2 [CONFLICTO]** (ICGE 4,5↔6,0% rama muerta · Leasing Urbano cap 0,06 vigente vs 0,045 template) · **1 [CONDICIONAL]** (MetLife).
- Discrepancias sistémicas confirmadas: los **37 records con fs=0,825 no pueden venir del formato** (el template jamás produce 0,825 — es el factor de liquidación, errata RB-53); el **fg=0,8 uniforme en 77 records** también queda cuestionado (BO51 es terminal único garantía/seguro → la whitelist implicaría fg=1,0 para esos clientes; el template NO define un factor_garantia separado).
- **`LISTA_FALTANTES.md`**: 3 sin fuente total · 12 records vacíos verificados (siguen vacíos; 11 con propuesta vía su grupo) · 17 records M_Clientes sin contraparte en ninguna fuente (BBVA, Itaú, VALÓN×2, …) · 17 dudosos con pregunta concreta · 2 conflictos · asimetría 40 (template) vs 28 (planilla) · redondeo sin fuente estable para todos.
- **`LISTA_DUPLICADOS.md`**: **25 grupos** (6 con ACTIVO claro por solicitudes vigentes y recomendación firme; 19 pares con candidato tentativo) + fila basura `recYGkxnFlATx7Nv5` (cabecera CSV con BOM) + 2 records SANDBOX (no tocar). La depuración es tanda propia.
- **`auditor.md`**: el auditor ciego no aplica (cero escrituras); la verificación de la tanda es el Gate mismo + spot-check 3/3 vs backup.
- **Respaldo listo e inusado**: `backup-mclientes.json` (92/92) + `rollback-restaurar.mjs` (dry-run verde).

## 4 · Decisiones pendientes (para relanzar la tanda)

1. **Confirmar con Héctor la fuente**: ¿la fuente verdadera de parámetros es el template `Formato-Informe-VProperty-Enero2026.xlsm`? (Todo indica que "todos tasan con el mismo Excel" se refiere a ESTE formato.) Con esa confirmación, 20 clientes se cargan de inmediato y los 17 dudosos se resuelven con sus preguntas puntuales.
2. **Modelar el factor condicional**: `factor_seguro` en M_Clientes es un escalar y la regla real es "base del cliente, pero 1,0 si Casa". Opciones: (a) guardar la base y agregar la excepción Casa a `F_SeguroIncendioUF` (consistente con el fix de la tanda anterior), o (b) mantener escalar y aceptar divergencia en Casas. Decisión de producto antes de poblar MetLife y los demás no-whitelist.
3. **Resolver los 2 conflictos** (ICGE, Leasing Urbano) y el estatus del prefijo BCH duplicado (Bice vs Banco de Chile).
4. **Depurar duplicados** (tanda propia, con LISTA_DUPLICADOS como insumo).

## 5 · Paralelismo real

Bloque 0 en 2 carriles paralelos (planilla ~9 min · backup/mapa ~5 min) + consolidador (~9 min). Piloto y fan-out no se ejecutaron (Gate). Nada que ahorrar en escrituras: no las hubo.

## 6 · Invariantes

Planilla y oráculos intactos (solo lectura) · M_Clientes intacto (cero PATCH, verificado) · ninguna otra tabla tocada · ninguna solicitud recalculada · sin commit/push · sin secretos impresos.
