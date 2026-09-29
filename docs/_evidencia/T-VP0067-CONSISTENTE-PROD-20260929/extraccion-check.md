# extraccion-check.md — Estado de extracción RF-09 · VP-2026-0067

> Tanda T-VP0067-CONSISTENTE-PROD-20260929 · FASE 2 · BLOQUE 2a (verificador).
> Captura 2026-09-29 ~23:10 UTC vía `curl` GET (solo lectura). Criterio plan §6.3 + fix D2:
> 8/8 `estado_extraccion=listo`, `atributos_obtenidos` poblado y parseable como JSON, y para
> `rec7t6MPxKu10WniF` (CBR) la terna dominio 13291 / 21565 / 2006. Además, cascada hacia
> TX_DocumentosLegales.

## 1 · Por adjunto

Parseo: `json.loads()` sobre el string `atributos_obtenidos` de cada record. Estructura en
los 8: objeto `{"items": [...], "no_extraidos": [...]}` con `codigo_atributo`/`valor`/`confianza` por ítem.

| # | Record | clave_adjunto | estado_extraccion | atributos_obtenidos | JSON parseable | Resultado |
|---|---|---|---|---|---|---|
| 1 | rec95X1HPJB7ZUo5G | permiso_edificacion | listo | poblado (1070 chars · 10 items) | Sí | PASS |
| 2 | recWdb4FAphNaTE0I | foto_fuente_sii | listo | poblado (1130 chars) | Sí | PASS |
| 3 | rectcojWwOIonkQRA | foto_ofertas_comparables | listo | poblado (6023 chars — las 7 filas de comparables) | Sí | PASS |
| 4 | rechQjmqpb3HMWyeb | certificado_deuda_tgr | listo | poblado (593 chars) | Sí | PASS |
| 5 | rectCtwDMT2mwN4GO | certificado_recepcion_final | listo | poblado (933 chars · 9 items) | Sí | PASS |
| 6 | reckRZ0e9mwtR6xCC | consulta_antecedentes_bien_raiz | listo | poblado (1038 chars) | Sí | PASS |
| 7 | recpI0wPyESJ0Etvs | informe_no_expropiacion_serviu | listo | poblado (572 chars) | Sí | PASS |
| 8 | rec7t6MPxKu10WniF | inscripcion_dominio_cbr | **listo** (era `extrayendo` colgado desde 22-sep — fix D2) | poblado (419 chars · 3 items) | Sí | PASS |

`estado_extraccion=listo`: **8/8** → V2 (lectura) puede llegar a 8/8 ✓.

## 2 · Terna dominio en rec7t6MPxKu10WniF (CBR)

`atributos_obtenidos.items` del adjunto CBR (literal):

| codigo_atributo | valor | confianza | Esperado | Resultado |
|---|---|---|---|---|
| `foja_cbr` | "13291" | 1 | 13291 | PASS |
| `numero_cbr` | "21565" | 1 | 21565 | PASS |
| `ano_inscripcion_cbr` | 2006 | 1 | 2006 | PASS |

(`no_extraidos` declara vendedor, notaria, comprador, etc. — honesto, no inventa.)

## 3 · Cascada → TX_DocumentosLegales `rec7t4cD2zjuJKpXq`

| Dato extraído (TX_Adjuntos.atributos_obtenidos) | Campo en TX_DocumentosLegales | Valor actual | Coherente | Resultado |
|---|---|---|---|---|
| CBR `foja_cbr` = 13291 | `fojas` | 13291 | Sí | PASS |
| CBR `numero_cbr` = 21565 | `numero_inscripcion` | 21565 | Sí | PASS |
| CBR `ano_inscripcion_cbr` = 2006 | `ano_inscripcion` | 2006 | Sí | PASS |
| Permiso `numero_permiso` = "319-2020" · `fecha_permiso` = 2020-09-09 | `permiso_edificacion_numero` / `_fecha` | `N°319  09/09/2020` / 2020-09-09 | Sí | PASS |
| Recepción `numero_recepcion` = "210-2024" · `fecha_recepcion` = 2024-07-18 | `recepcion_final_numero` / `_fecha` | `N°210  18/07/2024` / 2024-07-18 | Sí | PASS |

Cascada adicional verificada de paso: las 7 filas de TX_Comparables linkean `adjunto_origen`
→ `rectcojWwOIonkQRA` (foto_comparables), coherente con su extracción de 7 filas.

## Totales

| Bloque | PASS | FAIL |
|---|---|---|
| 1 estado + atributos parseables (8 adjuntos × 2 criterios) | 16 | 0 |
| 2 Terna dominio CBR | 3 | 0 |
| 3 Cascada TX_DocumentosLegales | 5 | 0 |
| **TOTAL** | **24** | **0** |
