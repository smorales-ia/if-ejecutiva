# Aprendizajes P5-TAS — Pantalla 3 · Ingreso de fotos

- **Interfaz:** IF-03 · Tasador
- **Fecha:** 2026-08-22
- **Modo Claude Code usado:** tanda completa, sin pausas entre batches
- **Contrato aplicado:** 🔴 pausa-total sólo para OK Gate, operaciones fuera de plan y `package.json`
- **Build antes:** tsc ✅ 0 · build ✅ · test ✅ 415
- **Build después:** tsc ✅ 0 · build ✅ · test ✅ **444** (+29, +3 archivos)
- **Estado de la tanda:** ⚠ **parcial — 3 de 6 batches.** B2, B3 y B4 bloqueados por **CI-052**
- **Commit asociado:** (Sergio lo agrega tras commit)

---

## Resumen ejecutivo

- **B1, B5 y B6 completos.** A-16 aislada en un módulo propio, sheet documental reutilizado de
  verdad (R7 cumplido, copia de 242 líneas eliminada) y 29 tests nuevos.
- **B2, B3 y B4 detenidos** por un hallazgo de contrato: `POST /api/tasaciones/[id]/fotos` y
  `POST /api/adjuntos/upload` **crean los dos una fila en `TX_Adjuntos`**. Encadenarlos como
  describe §6.1 duplicaría el registro de cada foto. Ficha **CI-052**.
- **2 fichas CI nuevas** (CI-051 · CI-052) y una observación anexa sobre el guard ausente de
  `GET /api/solicitudes/[id]/adjuntos`.
- **RF-TAS-06: construido con paliativo · pendiente P-5.** El filtro por `tipo_propiedad` funciona
  a través de `lib/tasador/tipo-propiedad.ts`; la corrección real sigue siendo alinear el dominio
  en Airtable.
- **A-16: asunción reversible**, ahora con un único punto de cambio y cinco tests que fallan a
  propósito si el negocio la revierte.

---

## Lo que se construyó

### B1 · A-16 en un solo lugar

`lib/tasador/minimos-fotos.ts` concentra la resolución de mínimos. Antes vivía repartida en tres
sitios —el catálogo `CATEGORIAS_FOTO`, el traductor `resolverLimite()` y la evaluación dentro del
componente—, ninguno equivocado, pero revertir A-16 obligaba a visitar los tres y a confiar en que
no hubiera un cuarto.

`MINIMOS_DINAMICOS` mapea las tres categorías a la **clave del dato declarado**, no a un número:
fijarlos es sustituir `'dorm'` por `2` y nada más. El `TODO(A-16)` de la cabecera dice
explícitamente qué está en juego —*una casa de 5 dormitorios se daría por completa con 2 fotos*— y
dónde se cambia.

**`resolverLimite()` se retiró de `lib/tasaciones.ts`, no se movió.** Intentar que delegara en el
módulo nuevo habría creado un ciclo de imports (`minimos-fotos` importa `CATEGORIAS_FOTO` de allí),
y dejarlo duplicado habría sido exactamente lo que el criterio de §6.3 prohíbe. No tenía
consumidores, así que retirarlo fue la salida limpia.

### B5 · R7 cumplido: el sheet se reutiliza, ya no se copia

`components/tasador/sheet-documentos.tsx` era una **reimplementación de 242 líneas** del sheet
documental de la ejecutiva. Se eliminó. Pantalla 3 abre ahora
`components/console/documentos-adjuntos-sheet.tsx`, el mismo componente que IF-02.

Hizo falta resolver tres obstáculos reales, y ninguno era el que el plan anticipaba:

1. **El sheet no filtraba por `tipo_propiedad`.** Reutilizarlo tal cual habría perdido RF-TAS-06,
   que es el motivo entero del requisito. Se agregó la prop **opcional** `filtroTipos`, aditiva:
   el llamador de IF-02 no la pasa y su comportamiento es idéntico al de antes.
2. **Exigía un `Solicitud` completo** —cuarenta campos— cuando **lee cinco**. Se estrechó el tipo
   de la prop a `SolicitudParaSheetDocumentos = Pick<Solicitud, 'id'|'codigoExt'|'cliente'|'estado'|'unidades'>`.
   Estrechar un parámetro es más permisivo para el llamador, así que IF-02 sigue compilando sin
   cambios; y evita la alternativa mala, que era fabricar treinta campos con `""`.
3. **Degradaba a sólo lectura.** `readOnly ?? estado !== "creada"` deja en consulta cualquier
   tasación, que siempre está en `asignada` o posterior. Se pasa `readOnly={false}` explícito, con
   el comentario que explica por qué no es redundante.

### B6 · Tests

29 tests nuevos en tres archivos co-ubicados: `lib/tasador/minimos-fotos.test.ts`,
`components/tasador/fotos-categorizadas.test.ts` y `lib/tasador/adaptador-solicitud.test.ts`.
Cubren los criterios de §6.3 que son verificables sin persistencia: contador y total en la misma
interacción, categoría personalizada sin mínimo, mínimos dinámicos contra lo declarado, y que la
normalización de P-5 produce coincidencias no vacías.

---

## Un bug de requisito que el catálogo escondía

**Las categorías personalizadas exigían mínimo, y la spec dice que no.** `crearCategoria()` las
creaba con `minimo: 1` y `evaluarCustom` calculaba `completa: count >= c.minimo`, de modo que una
categoría recién creada aparecía **marcada como incompleta** y contaba contra el estado global de
la pantalla. El criterio de RF-TAS-14 es literal: *"admite fotos sin exigir mínimo"*.

Lo que lo hacía difícil de ver: el catálogo de las ocho predefinidas estaba impecable —incluido el
mínimo dinámico de A-16, bien resuelto desde P2-TAS.B— y la ruta de las personalizadas era una
rama aparte que nadie había contrastado contra el requisito. **Un catálogo correcto no dice nada
sobre lo que ocurre fuera del catálogo.**

`minimoCategoriaPersonalizada()` sobrescribe el `minimo` que traigan los borradores ya guardados en
`localStorage`, para que un borrador viejo no reviva la exigencia. Hay un test específico para ese
caso.

---

## El hallazgo que detuvo la mitad de la tanda

El Gate 1 pedía verificar, antes de B3, que `/api/adjuntos/upload` *"existe y funciona"*. **Existe
y funciona.** El problema es otro: además de subir el binario, **crea la fila en `TX_Adjuntos`** —
lo hace el módulo 8 de `SC-Adjuntos-Upload`, dentro del escenario Make, y la ruta lo trata como
obligatorio (responde **502** si Make contesta 200 sin `adjunto_id`).

`POST /api/tasaciones/[id]/fotos` hace su propio `createRecord` sobre la misma tabla. Encadenarlos
como describe §6.1 deja **dos filas por foto**. Ficha **CI-052**, con tres salidas evaluadas y una
recomendada: que `/fotos` pase a **actualizar** el registro que Make ya creó, en vez de crear otro.

**Por qué no se resolvió sobre la marcha:** la corrección vive en `app/api/`, que esta tanda tenía
vedado salvo bug, y *cuál* endpoint es dueño de la fila es una decisión de diseño, no una errata.
§2.6 dice *"guardado en Dropbox por API Route con retry offline"* y no adjudica.

**La lección, que es reutilizable:** al reutilizar un endpoint ajeno, la pregunta útil no es
*"¿existe y funciona?"* sino **"¿qué más hace además de lo que su nombre promete?"**. Acá el efecto
decisivo no estaba en el Route Handler sino dentro de un escenario Make, a un salto de distancia
del código que se lee.

---

## Efecto colateral declarado

`components/tasador/expediente-sheet.tsx` construía una lista de documentos desde
`payload.documentosCargados`, que poblaba la copia eliminada del sheet. **Ese bloque rinde ahora
siempre vacío.** No es una pérdida: fabricaba nombres de archivo (`${tipo}_${i}.pdf`) que nunca
correspondieron a archivos reales, mientras los adjuntos verdaderos —`tasacion.adjuntosDropbox`—
se siguen mostrando al lado.

No se borró porque el expediente es territorio de **RF-TAS-10**, no de P5-TAS. Queda un comentario
en el sitio explicando qué corresponde hacer al retomarlo: leer de `adjuntos` y retirar el campo
`InformeData.documentosCargados`.

---

## Estado de los criterios de aceptación de §6.3

| Criterio | Estado |
|---|---|
| Ocho categorías con contador "X/N" y su acción | ✅ |
| No existe categoría "Documentos" | ✅ · con test |
| Header "N fotos · N docs" actualizado en la misma interacción | ✅ · con test · el conteo de docs pasó a ser **real** (`TX_Adjuntos`) |
| Categoría personalizada inmediata y **sin mínimo** | ✅ · era un bug, se corrigió |
| "Cargar documentos" abre **el mismo componente** que IF-02 | ✅ · import presente, copia eliminada |
| El sheet no sale vacío (normalización P-5) | ✅ · con test |
| `cuándo = Reproceso / Cliente tipo 2 / Depto con gas` no filtra mal | ✅ · el filtro sólo mira `tipo_propiedad` |
| Mínimos sólo en `lib/tasador/minimos-fotos.ts` | ✅ |
| `TX_Adjuntos.seccion` se escribe en cada alta | ⛔ **CI-051** — el campo no existe |
| Cola offline con IndexedDB | ❌ **B4 bloqueado por CI-052** |
| RF-TAS-06 declarado *"construido con paliativo · pendiente P-5"* | ✅ · acá |
| A-16 declarada asunción reversible | ✅ · acá y en el `TODO` del módulo |
| tsc · build · test verdes | ✅ 0 · 0 · 444 |
| Verificado a 375×812 | ⚠ no verificado — sin entorno gráfico en esta sesión |

---

## Deuda técnica declarada

| Ficha | Qué | Estado |
|---|---|---|
| **CI-051** | `TX_Adjuntos.seccion` no existe; la categoría va en `tipo_adjunto` / `descripcion` | abierta · impacto bajo |
| **CI-052** | Doble alta en `TX_Adjuntos` al encadenar los dos endpoints | abierta · **bloquea B2/B3/B4** |
| **P-5** | Género de `tipo_propiedad` desalineado entre dos tablas | abierta · paliativo en su sitio |
| **A-16** | Mínimos dinámicos vs. fijos | abierta · asunción reversible, un punto de cambio |
| Observación | `GET /api/solicitudes/[id]/adjuntos` sin guard de pertenencia | anotada en las notas de CI-052 |
