# T-SANEO-ZONIFICACION-20261014 · Plan de saneo de `M_Zonificacion`

**Estado: PROPUESTO — sin escrituras en Airtable.** Ninguna fila se toca hasta la aprobación
explícita de Sergio, decisión por decisión (§4).

*14-oct-2026, más tarde:* respaldo re-verificado vigente (`scripts/vigencia.py`: 0 diferencias en
las dos tablas). Dos intentos de `aplicar.py --link-grupos AB --activo true` fueron bloqueados por
el clasificador de permisos de la sesión; **nada se escribió**. El filtro de
`lib/tasador/zonificacion.ts` ya lee `OR(Link, clave_zona)`, que con el Link vacío da los mismos
conteos que antes (`scripts/formula.py`).

*15-oct-2026 · APLICADO.* Sergio corrió `aplicar.py --link-grupos AB --activo true` (1.634 filas,
164 lotes, `aplicar-log.json`). Verificación en `M_Zonificacion-despues.json` (`scripts/verificar.py`):
0 errores, 1.579 Links como el plan, `activo = true` en A+B+C+D, ningún otro campo tocado. Sólo
cambian las listas de Coyhaique (16), Llay-Llay (9), Pedro Aguirre Cerda (9) y María Pinto (1)
(`scripts/todas.py`).

Lecturas por API REST con `AIRTABLE_TOKEN` (conector MCP de Airtable sin autorizar en esta
sesión · RO-30), 14-oct-2026.

## 1. Respaldo previo (esta carpeta)

| Archivo | Contenido |
|---|---|
| `M_Zonificacion-antes.json` | Las 1.636 filas, todos los campos, tal como las devuelve la REST |
| `M_Comunas-antes.json` | Las 356 filas de `M_Comunas` |
| `schema-antes.json` | Schema (meta API) de las dos tablas |
| `plan-escrituras.json` | Clasificación fila por fila y el Link propuesto — es lo que leería el script de escritura |
| `_analisis-resolucion.json` | Primera pasada de la clasificación (intermedio) |

## 2. Diagnóstico

Prefijo = `clave_zona` menos el sufijo `zona` (`[Excel: Zonificacion!AE = B & C]`). Se cumple que
`clave_zona` termina en `zona` en **todas** las filas con zona.

| Grupo | Filas | Prefijos | Qué es | Propuesta |
|---|---:|---:|---|---|
| **A** | 1.554 | 143 | El prefijo es el nombre de una comuna de `M_Comunas` | Poblar el Link |
| **B** | 25 | 2 | Variante ortográfica de la comuna: `Coihaique`→Coyhaique (16), `Llaillay`→Llay-Llay (9) | Poblar el Link |
| **C** | 52 | 11 | Localidad dentro de una comuna (detalle abajo) | **No** poblar (ver §3) |
| **D** | 3 | 3 | `Limari`, `Cachapoal` (provincias) y `Lagunillas` (ambigua: San José de Maipo o Casablanca) | No poblar |
| **H** | 1 | — | Encabezado del CSV (`recMlkFlMhbG6yWVy`, `clave_zona = "﻿clave_zona"`) | Decisión 3 |
| **X** | 1 | — | `Colina-Rural` (`recCHWxedHHxWddwO`), cargada a mano, sin `zona`, Link ya poblado | No se toca |

**Grupo A, cómo coincide:** 1.543 idénticas · 1 sólo en mayúsculas (`Calera de tango`) · 1 sólo en
tildes (`Maria Pinto`) · **9 con espacio duro U+00A0** (`Pedro Aguirre Cerda`). El filtro actual de
`lib/tasador/zonificacion.ts` (`LOWER` en los dos lados) encuentra 1.544: **Pedro Aguirre Cerda y
María Pinto hoy salen sin lista**, igual que Coyhaique y Llay-Llay.

**Colina** (41 filas del grupo A) va a `recKT9mUJkeq3YuBu`, la que tiene región, 7 tasadores,
comparables y ya está enlazada a `Colina-Rural`. La otra, `recNgsqC5V7Ayeg3M`, sólo tiene `nombre`
y el autonumber `comuna_id = 60`: ningún Link, ninguna región.

**Grupo C:**

| Prefijo | Filas | Comuna real | Observación |
|---|---:|---|---|
| `Ventanas` · `Maitencillo` · `Horcon` + `Horcón` | 15 · 15 · 14 + 1 | Puchuncaví | Son **copias** de las 15 zonas de Puchuncaví (mismo código y mismos atributos), salvo `Horcón Z1` (altura 7 vs 14). `Horcon`/`Horcón` es la misma localidad con y sin tilde |
| `Dichato` | 1 (`OGUC`) | Tomé | Tomé no tiene filas propias |
| `Malloco` | 1 (`OGUC`) | Peñaflor | Peñaflor tiene `PRMS` |
| `Alto Jahuel` · `Linderos` | 1 (`PRMS`) · 1 (`OGUC`) | Buin | Buin ya tiene `PRMS` |
| `Champa` | 1 (`OGUC`) | Paine | Paine ya tiene `OGUC` |
| `Ensenada` | 1 (`OGUC`) | Puerto Varas | Puerto Varas no tiene filas propias |
| `Monte` | 1 (`OGUC`) | El Monte (probable) | El Monte tiene `PRMS` |

**Otros hallazgos:**

- `activo = false` en las 1.636 filas.
- 3 `clave_zona` repetidas: `Cerro NaviaEI` (altura 18 vs 22, `porc_ocup` 50 vs 80), `Las CondesE-Aa+cm`
  (altura 52 vs 21, `coef_const` 3 vs 2,5) y `CarahueOGUC` (idénticas). En la planilla un `BUSCARV`
  toma la primera; aquí no hay forma segura de saber cuál era la primera.
- `zona_compuesta = {comuna} & {clave_zona}` no tiene consumidores en el repo. Con el Link poblado
  pasará a repetir la comuna («ColinaColinaA1»): inocuo, se anota.
- `M_Comunas` tiene otro par homónimo: `Ñuñoa` (`recX1OpI66nVAjbPy`, 7 tasadores, 3 solicitudes) y
  `Nunoa` (`recejBIZUOI1NQepO`, 1 tasador, provincia). Fuera de alcance: se lista como seguimiento.
- Ninguna fila de `M_Zonificacion` tiene todavía `TX_DatosTasacion` enlazado: el saneo no afecta
  tasaciones existentes.

## 3. Por qué el grupo C queda sin Link

Si las 45 filas de Ventanas/Maitencillo/Horcón se enlazan a Puchuncaví y el catálogo pasa a filtrar
por el Link, Puchuncaví ofrecería cada código cuatro veces; la lista lo deduplica, pero el recordId
que se guarda en `TX_DatosTasacion.zonificacion` quedaría en una fila de localidad elegida por el
orden de Airtable (en `Z1`, la de Horcón, con otra altura). Eso es justo lo que el informe va a leer
cuando arrastre los atributos de la zona. Los OGUC/PRMS sueltos aportan un código genérico. Si Sergio
prefiere el Link "verdadero" para el grupo C, el filtro tiene que desempatar a favor de la fila cuyo
prefijo es el nombre de la comuna — se puede, pero es una regla nueva.

## 4. Decisiones para Sergio

1. **Link `comuna` en grupos A + B (1.579 filas).** Recomendado: sí. Un PATCH por lote de 10 con
   `comuna` (`fldNcL5XUGoF7e7sM`) desde `plan-escrituras.json`, sin `typecast`.
2. **`activo`.** Recomendado: `true` en las 1.634 filas de la planilla (A+B+C+D), en el mismo PATCH;
   el encabezado y `Colina-Rural` quedan como están. Alternativa: dejarlo en `false` y documentar
   que no significa nada.
3. **Fila-encabezado `recMlkFlMhbG6yWVy`.** Recomendado: que Sergio la borre desde la UI de Airtable
   (queda en la papelera de la base). Claude no borra registros.
4. **Colina duplicada `recNgsqC5V7Ayeg3M`.** Recomendado: que Sergio la borre desde la UI (no tiene
   ningún Link). Alternativa: renombrarla `Colina (duplicada — no usar)`.
5. **Grupo C.** Recomendado: sin Link (§3). Alternativa: enlazar a la comuna real según la tabla.
6. **Duplicados de `clave_zona`.** Recomendado: no tocar y documentar.

## 5. Después de escribir

- Bajar `M_Zonificacion-despues.json` y verificar: 1.579 filas con Link y la comuna esperada, 0
  filas con Link fuera de A+B+X, `activo` según la decisión 2.
- Paso 3 de la tarea: con A+B enlazados, filtrar el catálogo por el Link en vez de por `clave_zona`
  suma listas a Coyhaique (16), Llay-Llay (9), Pedro Aguirre Cerda (9) y María Pinto (1) y no cambia
  ninguna otra comuna (el grupo C sigue sin Link). Cambio en `lib/tasador/zonificacion.ts` + test.
