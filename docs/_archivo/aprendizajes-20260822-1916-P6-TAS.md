# Aprendizajes P6-TAS — Pantalla 4 · Avance lectura de datos

- **Interfaz:** IF-03 · Tasador
- **Fecha:** 2026-08-22
- **Modo Claude Code usado:** tanda completa, sin pausas entre batches
- **Contrato aplicado:** 🟡 pausa-en-comandos · pausa-total sólo ante error real
- **Build antes:** tsc ✅ 0 · build ✅ · test ✅ 515 (28 archivos)
- **Build después:** tsc ✅ 0 · build ✅ · test ✅ **564** (+49, +3 archivos)
- **Estado de la tanda:** ✅ **completa — 3 de 3 batches**
- **Commit asociado:** (Sergio lo agrega tras commit)

---

## Resumen ejecutivo

**P6-TAS no construyó la pantalla: la arregló.** La ruta, la página y el endpoint ya existían desde
P2-TAS.A (21-ago). Lo que faltaba era que dejaran de estar desconectados.

- **El defecto central:** la rama `lectura` de `estado-procesando.tsx` avanzaba con dos `setTimeout`
  de 4 y 8 segundos. El stepper llegaba a «Datos listos» y **habilitaba «Continuar»** pasaran ocho
  segundos y nada más, con la extracción todavía corriendo o fallada.
- **`GET /api/tasaciones/[id]/lectura` tenía cero consumidores.** Construido y nunca cableado.
- **Regla T-C: auditoría en cero**, incluida la purga del único literal que la incumplía.
- **3 correcciones documentales** que el trabajo destapó.

---

## El hallazgo que definió la tanda

El plan §7.3 abre con *«el stepper muestra tres pasos y avanza según el **estado backend**, no un
temporizador local»*. El código hacía exactamente lo contrario, y no de forma sutil:

```
const [fase, setFase] = useState<Fase>(0)
useEffect(() => {
  const t1 = setTimeout(() => setFase(1), 4000)
  const t2 = setTimeout(() => setFase(2), 8000)
  ...
```

`completado = fase === 2`. Cinco de los diez criterios de §7.3 caían por esta sola causa: el avance
falso, el botón habilitado antes de tiempo, el progreso que se reiniciaba en cada montaje, los siete
estados sin mapear y el «Tiempo estimado: 15 segundos» hardcodeado que §7.1 prohíbe explícitamente
como promesa.

**Por qué sobrevivió:** la pantalla *funciona* a la vista. Se ve un stepper, avanza, completa y
habilita el botón. Sin abrir el archivo o sin un adjunto que tarde más de ocho segundos, no hay
síntoma. Es el modo de fallo de una simulación bien hecha: convence.

---

## B1 · Terminal no es lo mismo que «puede continuar»

`lib/tasador/avance-lectura.ts` concentra el mapeo de los siete valores a los tres pasos. La
distinción que lo justifica —y que es el corazón del criterio 5 de §7.3— es que **cinco estados son
terminales pero sólo tres autorizan a seguir**:

| Estado | Terminal | Deja continuar |
|---|---|---|
| `idle` · `extrayendo` | no | no |
| `listo` · `skipped` · `no_corresponde` | sí | **sí** |
| `error` · `delegado_visador` | sí | **no** |

`skipped` y `no_corresponde` dejan pasar a propósito: son desenlaces normales —«acá no había nada
que leer»— y bloquear por ellos dejaría al tasador atascado sin nada que pueda hacer.

**El endpoint no alcanzaba.** Devolvía `terminados` y `conError`, y ahí `delegado_visador` era
indistinguible de un `listo`: los dos sumaban a `terminados`. Se agregó `porEstado`, el desglose
completo con las siete claves siempre presentes en cero — emitir la forma completa le ahorra al
cliente distinguir «cero adjuntos en error» de «la clave no vino».

**Degradación segura ante lo desconocido.** Un estado que no esté en el dominio se cuenta como
pendiente, no como bloqueante: bloquear por un valor que nadie definió dejaría la pantalla muerta
sin diagnóstico. Y aparece en el body, para que se vea.

---

## B2 · El sondeo, y qué significa «no cancelar»

`lib/tasador/use-avance-lectura.ts`. Tres decisiones que conviene tener presentes:

**El hook se monta en las dos variantes, pero sólo manda en una.** Montarlo condicionalmente rompe
las reglas de React, así que sondea siempre y en `calculo` su resultado se ignora por completo. El
inventario marca `estado-procesando.tsx` como compartido con P8-TAS: **parametrizar, no bifurcar**.

**Volver no cancela; desmontar sólo detiene el sondeo.** §7.1 lo pide y además no hay forma de
cancelar —no existe endpoint para eso—. La limpieza del efecto apaga el `setInterval` y nada más.

**No hay nada que persistir.** §7.2 paso 6 pide que volver y regresar no reinicie el stepper; sale
gratis, porque el progreso vive en Airtable y no en el componente. Era el temporizador lo que lo
reiniciaba.

**Se detiene solo, por dos vías:** al llegar a completo, y por un tope de 150 sondeos (~10 min) para
el adjunto que quede colgado en `extrayendo`. Seguir preguntando por algo terminado gasta cuota de
los 5 req/s por base sin cambiar nada.

### Dos detalles del render que no son cosméticos

**El botón bloqueado es un `<button disabled>`, no un enlace.** Un `<a>` deshabilitado no existe:
sigue siendo focalizable y activable con Enter. El criterio pide *«no accionable ni por teclado ni
por doble toque»*, y eso sólo lo da un botón nativo.

**El gate es `puedeContinuar`, no `completado`.** Son dos derivaciones distintas del mismo avance:
con `error` o `delegado_visador` el proceso terminó —el stepper lo refleja— y el botón sigue
cerrado. Confundirlas era lo que dejaba pasar al formulario con datos que nunca se leyeron.

**El «Tiempo estimado: 15 segundos» se retiró.** §7.1 lo marca como valor del prototipo v4 y no un
compromiso normativo. No hay forma de estimarlo, así que se omite y en su lugar se dice
«N de M archivos procesados», que es un dato cierto.

---

## Regla T-C · el criterio dominante

La auditoría de §7.2 paso 8 devuelve **cero**. Hizo falta más de lo previsto:

1. **El literal visible**, en `seccion-documentos.tsx:20` — *«Prellenado por IA cuando los PDFs estén
   adjuntos (SC07)»*. Incumplía dos veces: por nombrar el medio y por exponer el código interno del
   escenario. El inventario asignaba la purga a P7-TAS; **se hizo acá** por decisión de Sergio,
   porque el criterio de §7.3 no puede dar verde con esa línea viva. **Anotado para que P7-TAS no la
   rehaga.**
2. **Mis propios comentarios.** Al documentar el arreglo cité las palabras vedadas, y el `grep`
   volvió a dar tres. Están en comentarios, no en texto visible, así que el criterio *literal* se
   cumplía — pero un criterio que se verifica por `grep` tiene que dar cero de verdad (RO-02,
   RO-16). Se reformularon sin citar. **La lección: explicar una regla de vocabulario usando el
   vocabulario prohibido rompe su propia verificación.**

---

## Correcciones documentales que el trabajo destapó

| Documento | Qué decía | Qué dice ahora |
|---|---|---|
| `docs/schema-airtable.md:347` y `:476` | `estado_extraccion` con **4** opciones | Las **7**, con sus choice IDs, verificadas por meta API el 05-ago y re-verificadas vía MCP hoy |
| `docs/_notas/inventario-tasador.md:122` | *«Polling real contra `GET /api/tasaciones/[id]/estado`»* | Los dos endpoints, con la advertencia de que **no son intercambiables** |

El del inventario importaba: `/estado` lee la máquina de estados del cálculo y no sabe nada de
extracción documental. Seguirlo habría cableado la pantalla al endpoint equivocado.

---

## Estado de los criterios de aceptación de §7.3

| Criterio | Estado |
|---|---|
| Stepper avanza según estado backend, no temporizador | ✅ · era el defecto central |
| «Continuar» no accionable por teclado ni doble toque | ✅ · `<button disabled>`, no enlace |
| Se habilita al tercer paso sin recargar | ✅ · con test |
| «Volver» disponible y no cancela; regresar recupera progreso | ✅ · sale del backend |
| 7 valores mapeados; `error` y `delegado_visador` con tratamiento propio | ✅ · con test |
| Regla T-C · grep en cero | ✅ |
| Error con mensaje humano, sin error técnico | ✅ |
| No se escribió pipeline nuevo (R7) | ✅ · con test que lo afirma |
| tsc · build · test verdes | ✅ 0 · 0 · **564** |
| Verificado a 375×812 | ⚠ **pendiente para Sergio** |
| Archivo de aprendizajes | ✅ · éste |

---

## Deuda declarada

- **Verificación visual pendiente**, y tiene que cubrir **las dos pantallas**: la 4 y la 6. El
  componente es compartido y la garantía de que la parametrización no se filtró a la variante
  `calculo` es visual, no automática.
- **El aviso de `delegado_visador` no enlaza a ninguna parte.** Dice que el visador completará esos
  datos, pero el tasador no tiene desde ahí forma de ver cuáles. `TX_Adjuntos.datos_pendientes_visador`
  guarda la lista y no se consume. Fuera de alcance de §7; corresponde evaluarlo en P9-TAS o P10-TAS.
