# PRD · Unidades SII, avalúo y regla del motor (hallazgos VP-2026-0079)

> **Documento de trabajo, no normativo.** La fuente normativa sigue siendo
> `docs/_md/VProperty_Especificacion_Proyecto_v1_9_18.md`. Los requisitos que se aprueben aquí
> se integran en la spec (§4.3 RF-09 · §1.3 IF-02 · motor AT01) con bump de versión, según la
> regla de fuente única de `CLAUDE.md`. Este archivo solo prepara esa decisión.

| Campo | Valor |
|---|---|
| Origen | Réplica manual de MET-6283 como VP-2026-0079 (`rec6XubOR92X6gnOH`), 13–14 oct 2026 |
| Alcance | 4 problemas de fondo: P1 unidades duplicadas · P2 avalúo CLP en campo UF · P3 bloques mock en la consola · P4 regla de motor equivocada |
| Afecta a | IF-02 (consola), IF-03 (tasador e informe), AT01, AT03-Ext, `D_TipoDocumentoAtributo` |
| Fecha | 14-oct-2026 |

---

## 1 · Problema

Al replicar una tasación real, cuatro defectos hicieron que la solicitud mostrara datos falsos o
incoherentes sin que nadie lo advirtiera:

- **P1 · Unidades duplicadas.** Al subir el certificado de avalúo, AT03-Ext buscó la unidad por
  igualdad exacta de texto del rol. La unidad ingresada tenía `882-40` y el certificado decía
  `00882-00040`; no hubo match y se creó una segunda unidad (`rec2F33IJvqowfub9`, ya borrada).
  Con dos unidades, las extracciones sin rol (foto SII) dejan de escribir material, año y
  superficies (`AT03-Ext_script.js:497-513`), y el informe lista dos unidades.
- **P2 · Avalúo en pesos guardado como UF.** El atributo `certificado_avaluo_fiscal__avaluo_total`
  (`recyfinCf1PgGYMMN`) destina a `TX_Unidades.avaluo_uf` con unidad «UF» y ejemplo `3223.20`,
  pero el certificado chileno imprime pesos. La extracción escribió `339.809.429` en `avaluo_uf`,
  que el informe lee como UF (`lib/tasador/lectura-informe.ts:499`). Viola RN-48 (el total es la
  suma de los avalúos de las unidades) porque la suma mezcla magnitudes.
- **P3 · La consola muestra datos inventados.** Los bloques «Datos SII» y «Antecedentes legales»
  de la pestaña Datos salen de `mockDatosSii` y `mockAntecedentesLegales`
  (`lib/console-data.ts:1614-1652`, usados en `components/console/solicitud-detail.tsx:765-766`).
  En VP-2026-0079 mostraban «1.200 UF / 1.550 UF», «N° 108-2009», «Fojas 12.345» — nada de eso
  existe en Airtable. La Ejecutiva no puede distinguir dato real de relleno.
- **P4 · AT01 elige la regla antigua para MetLife Casa.** Para MetLife + Refinanciamiento + Casa,
  AT01 asigna `Regla_MetLife_Refinanciamiento_Casa` (`recoZuF6otZ5Bcs2g`, prioridad 200, set de
  fórmulas v3.1) sobre `REGLA_REFI_CASA_V32` (`recYEf9XepX4SmLnH`), porque gana por score
  (3 criterios vs 2). La regla antigua no produce los 13 terminales que lee el informe. Hoy se
  corrige con un PATCH manual de `regla_aplicada` (bloqueo #1 ya registrado en
  `docs/aprendizajes.md:3064`). Si el PATCH se olvida, el cálculo sale mal en silencio.

**Costo de no resolverlo:** informes con avalúo fiscal erróneo (dato que se imprime y que el
cliente usa), datos catastrales que no llegan al formulario del tasador, y una consola que
presenta valores ficticios como si fueran de la solicitud. P4 afecta a toda la cartera MetLife
Casa, el caso con oráculo validado.

## 2 · Objetivos

1. **Cero unidades duplicadas por formato de rol**: subir un documento cuyo rol difiere solo en
   ceros o separadores nunca crea una unidad nueva.
2. **Avalúo con unidad correcta**: el 100 % de los avalúos escritos por RF-09 queda en el campo
   de su moneda real; el informe imprime UF y CLP coherentes con el certificado (±1 UF por
   redondeo de la UF del día).
3. **Cero datos de relleno en la consola**: ningún valor de la pestaña Datos proviene de un mock;
   donde no hay dato se ve «—».
4. **Regla correcta sin intervención**: toda solicitud MetLife + Refinanciamiento + Casa nueva
   queda con `REGLA_REFI_CASA_V32` sin PATCH manual.

## 3 · No objetivos

- **Reescribir RF-09 / SC-RF09-ExtraccionClaude.** El defecto P1 está en la resolución de unidad
  de AT03-Ext y P2 en la configuración del atributo; el escenario Make no cambia.
- **Mostrar comuna/manzana/predio SII.** Descartado por CI-025/CI-067; aquí solo se muestra el
  rol por unidad que ya existe.
- **Sanear datos históricos en masa.** Se corrigen las solicitudes activas detectadas; las
  cerradas quedan como están salvo pedido expreso.
- **Rediseñar el motor de reglas (AT01) o su scoring.** P4 se resuelve en datos de
  `C_ReglasNegocio`, no cambiando el algoritmo.
- **Editar avalúo por unidad desde la consola.** La consola sigue siendo de solo lectura en estos
  bloques (principio «la UI muestra y captura; nunca decide»).

## 4 · Historias de usuario

**Tasador**
- Como tasador, quiero que al subir el certificado de avalúo los datos se escriban en la unidad
  que ya existe, para no encontrar unidades fantasma ni campos vacíos en mi formulario.
- Como tasador, quiero que el avalúo fiscal que veo en el informe sea el del certificado, en UF y
  en pesos correctos, para no firmar un informe con un monto mil veces mayor.

**Ejecutiva Comercial**
- Como Ejecutiva, quiero que «Datos SII» y «Antecedentes legales» muestren solo lo que está en la
  solicitud, o «—» cuando falta, para no informar al cliente datos inventados.
- Como Ejecutiva, quiero que una solicitud MetLife Casa quede con la regla de cálculo correcta
  desde que la creo, para no depender de que alguien recuerde corregirla.

**Casos límite**
- Como tasador, si el documento trae un rol que no corresponde a ninguna unidad (otro predio
  real), quiero que quede registrado y visible para revisión, en vez de mezclarse con la unidad
  principal.
- Como tasador, si el certificado no trae avalúo legible, quiero que el campo quede vacío y no
  en cero.

## 5 · Requisitos

### P0 · Imprescindibles

**R1 · Comparación de rol normalizada en AT03-Ext (P1).**
Antes de comparar, normalizar ambos lados: quitar todo lo que no sea dígito, partir en
`manzana`/`predio` por el separador original y eliminar ceros a la izquierda de cada parte
(`00882-00040` ≡ `882-40` ≡ `882 - 040`). El rol con prefijo de comuna de la TGR
(`076-00882-040`) se reconoce por tener 3 partes y se compara por las dos últimas.
- Dado una unidad con rol `882-40`, cuando se extrae `00882-00040`, entonces se escribe sobre esa
  unidad y no se crea ninguna.
- Dado una unidad con rol `882-40`, cuando se extrae `882-41`, entonces se crea una unidad nueva
  (comportamiento actual, correcto).
- El valor guardado en `rol_sii` de la unidad existente no se reescribe con el formato extraído.
- Nota técnica: el script se pega a mano en la UI de Airtable (el MCP no edita `customScript`);
  la entrega incluye el paste y la verificación con una corrida real (`list_automation_runs`).

**R2 · Atributo de avalúo en su moneda real (P2).** *Diseño definitivo en §9.2.*
Corregir `certificado_avaluo_fiscal__avaluo_total` para que la extracción entregue pesos y se
destine a un campo CLP de la unidad; el valor en UF se deriva con la UF de la fecha de visita
(misma fuente `H_PreciosUF` que usa AT03), nunca lo extrae el modelo.
- Dado un certificado con avalúo `$339.809.429`, cuando termina la extracción, entonces la unidad
  tiene el monto en pesos en su campo CLP y `avaluo_uf` vacío o derivado (≈ 8.517,68 UF a la UF
  del 13-04-2026), nunca `339809429`.
- El informe de VP-2026-0079 imprime avalúo fiscal UF 8.517,68 / $339.809.429 (oráculo MET-6283).
- Si el campo CLP no existe en `TX_Unidades`, crearlo requiere aprobación explícita (regla de
  `CLAUDE.md`) y documentarlo en `docs/schema-airtable.md`.

**R3 · Retirar los mocks de la pestaña Datos (P3).**
«Datos SII» se alimenta de `TX_Unidades` (rol, avalúo, destino) y `TX_DatosTasacion`
(destino principal, contribución); «Antecedentes legales» de `TX_DocumentosLegales`. Lectura
server-side con el token de Airtable, como el resto de la consola.
- Dado una solicitud sin documentos legales, entonces cada fila muestra «—» (no «N° 108-2009»).
- `grep mockDatosSii\|mockAntecedentesLegales` no encuentra usos en `components/`.
- El avalúo total es la suma de las unidades (RN-48) calculada con datos reales.

**R4 · Regla v32 para MetLife Casa sin PATCH (P4).** *Resuelto en §9.1: desactivar la regla MetLife.*
Resolver en `C_ReglasNegocio` para que MetLife + Refinanciamiento + Casa termine en
`REGLA_REFI_CASA_V32`: o se desactiva `Regla_MetLife_Refinanciamiento_Casa`, o se le asigna el
mismo set de 13 terminales v32 (ver pregunta abierta Q1).
- Dado una solicitud nueva MetLife + Refinanciamiento + Casa, cuando corre AT01, entonces
  `A_DecisionesMotor` registra una regla cuyas fórmulas son los 13 terminales v32.
- VP-2026-0067 recalculada con la regla resultante sigue dentro de ±1 % de su oráculo.
- Prohibido editar `formulas_resultado` de la regla compartida sin aprobación (restricción ya
  vigente en `PLAN_prod-met6283.md:224`).

### P1 · Deseables

- **R5 · Aviso de unidad nueva.** Cuando AT03-Ext crea una unidad (rol realmente distinto),
  registrar un evento en `A_Eventos` y mostrarlo en el Historial de la consola.
- **R6 · Barrido de duplicados existentes.** Consulta de solo lectura que liste solicitudes
  activas con dos unidades cuyo rol normalizado coincide, para sanearlas con aprobación.
- **R7 · Barrido de `avaluo_uf` sospechoso.** Listar unidades con `avaluo_uf > 100.000`
  (imposible en UF para vivienda) como candidatas a P2.

### P2 · Futuro

- Guardar el rol en forma canónica también al crear la unidad (consola y SC01), para no depender
  solo de la comparación normalizada.
- Validar la unidad declarada (`D_TipoDocumentoAtributo.unidad`) contra el tipo de dato extraído
  en todos los atributos monetarios, no solo el avalúo.

## 6 · Métricas de éxito

| Indicador | Tipo | Meta | Cómo se mide |
|---|---|---|---|
| Unidades creadas por AT03-Ext con rol normalizado igual a otra de la misma solicitud | adelantado | 0 en las 2 semanas posteriores al paste | Consulta a `TX_Unidades` agrupando por solicitud + rol normalizado |
| Unidades con `avaluo_uf > 100.000` | adelantado | 0 nuevas desde la corrección | Filtro en `TX_Unidades` |
| Valores mock en la consola | adelantado | 0 (grep + revisión visual de 3 solicitudes) | `grep` en el repo |
| Solicitudes MetLife Casa con PATCH manual de regla | rezagado | 0 en el mes siguiente | `A_DecisionesMotor` vs `regla_aplicada` |
| Informes MetLife Casa dentro de ±1 % del oráculo sin override de regla | rezagado | 100 % | Regresión de VP-2026-0067 y VP-2026-0079 |

## 7 · Preguntas abiertas

- **Q1 · RESUELTA (14-oct-2026, panel motor + negocio MetLife) → desactivar.** Ver §9.1.
  Pendiente solo la confirmación de Héctor sobre remate/liquidación por velocidad de venta, que no
  cambia la decisión.
- **Q2 · RESUELTA (14-oct-2026, panel datos/RF-09) → crear `TX_Unidades.avaluo_clp`.** Ver §9.2.
  Requiere tu aprobación explícita para crear el campo.
- **Q3 · (Ingeniería · no bloqueante)** ¿El formato de rol de la TGR (`076-00882-040`) llega por
  otros documentos con destino `TX_Unidades.rol_sii`? Hoy `certificado_deuda_tgr` no lo destina
  a unidades; confirmarlo antes de cubrir el caso de 3 partes en R1.
- **Q4 · (Producto · no bloqueante)** En la consola, ¿«Datos SII» debe mostrar el avalúo en UF,
  en pesos o ambos?

## 8 · Plazos y dependencias

- **Prioridad sugerida:** R4 y R1 primero (afectan el cálculo y el flujo de datos del tasador),
  luego R2, luego R3.
- **Dependencias:** R1 requiere paste manual del script en Airtable; R2 puede requerir campo
  nuevo (aprobación); R4 depende de Q1.
- **Fases:** cada R es una tanda independiente, con `pnpm build` limpio, regresión de VP-0067 y
  la réplica VP-2026-0079 como caso de prueba en vivo.
- **Registro:** al aprobarse, abrir los CI correspondientes en `docs/CODE_INCONSISTENCIES.md`
  (siguiente número libre tras CI-072) e integrar los requisitos en la spec normativa.

---

## 9.0 · Estado de ejecución (14-oct-2026, con aprobación de Sergio)

Respaldo previo y reversión: `docs/_evidencia/T-REGLAS-AVALUO-20261014/snapshot-previo.json`.

| Acción | Estado |
|---|---|
| Desactivar `Regla_MetLife_Refinanciamiento_Casa` | ✅ hecho (`activa=false`) |
| Crear `TX_Unidades.avaluo_clp` | ✅ `fld7QVj2KR8X4yRlo`, documentado en `schema-airtable.md` |
| Redirigir `certificado_avaluo_fiscal__avaluo_total` a `avaluo_clp` (unidad CLP, ejemplo) · corregir ejemplo/unidad de `consulta_antecedentes_bien_raiz__avaluo_total_clp` | ✅ hecho |
| VP-2026-0079: `avaluo_fiscal_clp = 339809429` (TX_DatosTasacion) y `avaluo_clp` en su unidad | ✅ hecho; AT03-Ext no pisa campos con valor, así que la foto SII (D02) no lo reemplaza |
| Preview del informe: «Avalúo fiscal ($)» real y UF derivada (`avaluo_fiscal_clp / uf_dia_visita`); columna «Avalúo ($)» por unidad | ✅ código + tests · `tsc`, 1078 tests y `next build` limpios · **sin commit ni deploy** |
| Desactivar `M_Clientes` duplicados de MetLife (`recimE810cuyWIR9q`, `recwxQlPhJTXgig93`) | ✅ `activo=false` |
| Desactivar reglas prioridad 200 de AGH, Evoluciona y Security | ⛔ bloqueado por el control de permisos de la sesión; pendiente de confirmación explícita |
| R1 · AT03-Ext v4 con rol normalizado (`rolesEquivalentes`) | ✅ **desplegado y probado en vivo 14-oct-2026**: re-disparo sobre el certificado de VP-2026-0079 (rol `00882-00040`), corrida `wfxoW6c4rD1mgww3v` OK; escribió `avaluo_clp` en la unidad existente `882-40` y **no creó unidad duplicada** (v3 sí la había creado) |
| R3 · «Datos SII» y «Antecedentes legales» de la consola con datos reales | ✅ código (`GET /api/solicitudes/[id]/sii-legales`, `lib/sii-legales.ts`, `useSiiLegales`); mocks retirados de `lib/console-data.ts`; `tsc`, 1077 tests y `next build` limpios · sin commit ni deploy |
| RN-48 por suma de unidades en el motor y colaterales 2–4 y 6 de §9.1 | pendientes: requieren paste manual del script en Airtable o tandas de código propias |

## 9 · Resolución de Q1 y Q2 (panel de especialistas, 14-oct-2026)

Tres especialistas trabajaron en paralelo y en solo lectura (código, docs, oráculos XLSM/PDF y
Airtable por MCP): **motor de cálculo**, **negocio de tasación MetLife** y **datos / RF-09**. Los
dos de Q1 llegaron a la misma conclusión por caminos independientes.

### 9.1 · Q1 → Desactivar `Regla_MetLife_Refinanciamiento_Casa` (confianza alta)

**Cambio único:** `C_ReglasNegocio` · `recoZuF6otZ5Bcs2g` · `activa` (`fldidvedXZEJfq0Xs`)
`true → false`, con snapshot JSON previo en `docs/_evidencia/`. Reversión: volver a `true`.

Por qué:
- AT01 ordena por **score antes que prioridad** (`AT01-ResolverMotorReglas.js:438`) y solo
  considera reglas `activa === true` (`:360`). La regla MetLife gana por cumplir 3 criterios contra 2.
  Subir la prioridad de la v32 no sirve. Apagando la MetLife, gana `REGLA_REFI_CASA_V32`.
- Es la **única regla con cliente MetLife**: el cambio no afecta a otros clientes ni a MetLife Depto.
- **No se pierde nada que el informe use.** AT03 solo lee `formulas_resultado` (`AT03_Calculos_DAG.js:1288-1329`).
  Los factores salen de `M_Clientes` (`:791-820`). `factores_aplicables` no lo lee nadie. La plantilla
  es la misma (`MUTUO_MET.docx`). El ensamblador está construido sobre los terminales v32.
- **Oráculos MetLife** (6283 Casa, 6280 Depto, fórmulas leídas con `data_only=False`): remate 0,65 y
  liquidación 0,825 (por velocidad de venta, no por cliente), cap rate 4,5 %, seguro ×1,0 en Casa.
  La v32 los reproduce todos. Además, la regla v3.1 calcula mal la reposición y no produce los
  terminales CLP.
- **Cartera:** ninguna solicitud vigente depende del set v3.1. Solo la VP-2026-0039 (cancelada)
  conserva la regla. VP-0066, 0067 y 0079 ya están en v32 por PATCH.

Descartadas:
- **Cargarle fórmulas v32:** lo prohíbe `PLAN_prod-met6283.md:224` y duplica el set, que se desalinearía.
- **Subir la prioridad de la v32:** no tiene efecto.
- **Agregar el cliente a la v32:** la excluiría para los demás clientes.
- **Crear una regla MetLife v32:** es otra copia del set.
- **Cambiar el desempate de AT01:** toca a todos los clientes.

**Lo que se pierde (genérico, no MetLife):** el remate paramétrico por velocidad de venta
(0,75…0,50). La v32 lo fija en 0,65/0,825 dentro de la fórmula (`recCjbaxfXQELCfj9`, `recSYwQqRULkqYimi`)
y sus registros de `C_Factores` están vacíos.

**Pregunta para Héctor (no bloquea la desactivación):**
> «Para MetLife, ¿remate y liquidación son siempre 65 % y 82,5 %, o varían con la velocidad de venta
> que declara el tasador (1–2 meses 75 % … más de 24 meses 50 %)?»

Si varían, se abre un fix **genérico** en v32 (remate desde `C_Factores` por velocidad), no una
regla MetLife.

**Verificación:** la próxima solicitud MetLife + Refinanciamiento + Casa debe registrar en
`A_DecisionesMotor` `REGLA_REFI_CASA_V32 · score=2 prioridad=10`, sin PATCH. Como regresión,
VP-2026-0067 debe quedar dentro de ±1 % de su oráculo. AT01 solo corre en `creada`, así que las
solicitudes existentes no cambian.

**Hallazgos colaterales (fuera de Q1, a registrar como CI):**
1. Las reglas de prioridad 200 de Agencia Habitacional (`recAJFIbIXV1X93i3`), Evoluciona
   (`recGsNl62Hi8VE6nW`) y Security (`reccwJrigkDZMBvmM`) para Refinanciamiento + Casa tienen el
   mismo problema y aparecerá con su primera Casa. Conviene aplicar el mismo criterio cuando toque.
2. El PATCH manual no deja rastro en `A_DecisionesMotor`: el panel de decisión de VP-0066, 0067 y
   0079 muestra la regla MetLife aunque se aplicó la v32.
3. `matchText` de AT01 (`:366-371`) da coincidencia cuando la solicitud no tiene el campo, así que
   una solicitud sin cliente o sin tipo de propiedad puede caer en una regla específica.
4. Seguro MetLife Depto: la planilla aplica ×0,8 y la v32 aplica ×1,0 (G-2 condicional, abierto).
5. `M_Clientes` tiene duplicados de MetLife sin solicitudes: `recimE810cuyWIR9q` y
   `recwxQlPhJTXgig93` (este con fs = 0,825, errata RB-53).
6. `REGLA_REFI_CASA_V32` apunta a `MUTUO_MET.docx` para toda Casa de refinanciamiento, sea o no MetLife.

### 9.2 · Q2 → Crear `TX_Unidades.avaluo_clp` (confianza alta · requiere tu aprobación)

Hoy no existe ningún avalúo en pesos **por unidad**: `TX_Unidades` solo tiene `avaluo_uf`, y todos
los campos CLP son por solicitud. Reutilizar uno rompería la cardinalidad `una_por_unidad` de RN-48.

Inventario relevante:
- `TX_DatosTasacion.avaluo_fiscal_clp` (CLP) es **la entrada real del motor**:
  `F_AvaluoFiscalUF = avaluo_fiscal_clp / uf_dia_visita` (`C_Formulas recMo4Xqscqh3IIb0`).
- `TX_DatosTasacion.avaluo_fiscal_uf` es una fórmula que **devuelve pesos** con nombre de UF. El
  preview la rotula «Avalúo fiscal (UF)» (`informe-preview.tsx:583`) y AT04 valida rangos sobre ella.
- `TX_Solicitudes.avaluo_fiscal_clp` está vacío en toda la base.

Diseño (reemplaza a R2):
1. Crear `TX_Unidades.avaluo_clp` (number, precisión 0) y documentarlo en `docs/schema-airtable.md`.
2. `D_TipoDocumentoAtributo` `recyfinCf1PgGYMMN`: `uso_campo_destino = avaluo_clp`,
   `unidad_medida = CLP`, ejemplo `339809429`. Corregir también el ejemplo y la unidad de
   `consulta_antecedentes_bien_raiz__avaluo_total_clp`.
3. RF-09 deja de escribir `avaluo_uf`. La UF por unidad la deriva el motor:
   `avaluo_clp / uf_dia_visita`.
4. **RN-48:** `avaluo_fiscal_clp` de la solicitud = suma de `avaluo_clp` de sus unidades, con
   precedencia sobre `foto_fuente_sii` cuando existe certificado («manda el certificado», spec §4.3.1).
   Así `F_AvaluoFiscalUF` no cambia.
5. Código:
   - Agregar `FIELD_IDS_UNIDADES.avaluoClp`.
   - `lectura-informe.ts:499` y el preview muestran CLP y la UF derivada.
   - Corregir el rótulo de `informe-preview.tsx:583`.
   - Revisar los umbrales de AT04 y la fórmula engañosa `avaluo_fiscal_uf`.
6. Saneamiento: ninguna unidad tiene hoy pesos en `avaluo_uf` (solo 2 valores, ambos plausibles en
   UF), así que no hay datos que migrar.

**Decisión de spec pendiente (Sergio):** si la suma por unidades **reemplaza** a
`avaluo_fiscal_clp` de `foto_fuente_sii`, o solo lo **valida**.

**Verificación:**
- **VP-2026-0079:** re-extraer el certificado y confirmar `avaluo_clp = 339809429` en
  `receXRGWbpYBg26xl` (sin unidad nueva) y `F_AvaluoFiscalUF ≈ 8.517,68`.
- **VP-2026-0067:** debe seguir en 8.517,6777 (`golden-met6283.ts:166`).
