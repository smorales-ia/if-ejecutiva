# Cierre de sesión · 19-ago-2026 · P4-TAS completa

> Nota operativa con fecha. **No es especificación** — lo normativo vive en
> `docs/_md/VProperty_Especificacion_Proyecto_v1_9_12.md`.

## Estado

- **P4-TAS completa** en `feat/tasador-ui`: bloques 1 a 6, todos commiteados y
  pusheados.
- **`main` no tocado.** **Railway sin actividad**, que es lo correcto: el deploy
  sigue a `main` y nada de esta tanda llegó ahí.
- **Pendiente: merge a `main` + deploy a producción.**

⚠ **Consecuencia de lo anterior, dicha en voz alta:** todo lo construido en esta
tanda —la tabla `TX_CoordinacionVisita`, las dos rutas, Pantalla 2— **no está en
producción**. Lo que **sí** está en producción desde ya es el **schema de
Airtable**, porque la base es una sola y no tiene ramas: los 14 campos nuevos y
los 2 de `TX_Solicitudes` existen para IF-02 en vivo. Son aditivos y nadie los
lee todavía, así que no rompen nada, pero la asimetría conviene tenerla presente:
**el código está en una rama y el schema no.**

## Commits de la tanda

| Hash | Summary |
|---|---|
| `036fdc2` | `feat(tasador): reversión RO-29 · spec v1.9.10 · A-17 resuelta` |
| `0856568` | `feat(tasador): P4-TAS bloques 1-2 · schema TX_CoordinacionVisita + tipos` |
| `519e50a` | `feat(tasador): P4-TAS bloque 3a · proyección unidades/contactos/adjuntos + helper dirección` |
| `09a09c7` | `feat(tasador): P4-TAS bloque 3 · Pantalla 2 Coordinar visita (UI + tipos + deudas)` |
| `0efe1a0` | `feat(tasador): P4-TAS bloque 4+5 · rutas API coordinación + SLA e2/e3 + RO-37` |
| `681cded` | `chore(tasador): P4-TAS bloque 6 · limpieza RO-29 + auditoría CI-045/CI-046` |

Commit inmediatamente anterior a la tanda: `5e496ee` (ingesta SLA v1.1, CI-037 a
CI-040, cierre de Q5).

## Deudas declaradas

| ID | Qué | Dónde |
|---|---|---|
| **CI-042** | `AdjuntoDropbox.sizeBytes` asume que `TX_Adjuntos.tamanio_kb` sigue en KB. Si el campo pasa a bytes, el `× 1024` duplica **en silencio** | `lib/tasador/lectura-tasacion.ts` → `leerAdjuntos()` |
| **CI-043** | **RF-TAS-04 diferido.** `contactosEditadosPorEjecutiva` no tiene campo en Airtable ni forma de derivarlo; sin discriminante el banner de reapertura mentiría. Candidato barato anotado en la ficha: `ultima_modificacion` de un contacto > `fecha_respuesta` del último intento | `components/tasador/coordinar-visita.tsx`, comentario en el sitio del banner retirado |
| **CI-044** | Carrera residual anti doble-tap, **~100-300 ms** entre la lectura de la ventana y el `createRecord`. Airtable no tiene constraints ni transacciones: no es evitable sin cambiar de mecanismo | `app/api/tasaciones/[id]/coordinacion/route.ts` |
| **CI-045** | El chip "Por coordinar" infiere la coordinación desde la etapa de SLA teniendo `coordinacion_vigente` disponible. Si `slaEtapa` viene `undefined` —resultado legítimo—, la solicitud **desaparece del chip** aunque no tenga coordinación | `lib/tasador/cola-filtros.ts` → `esPorCoordinar()` |
| **CI-046** | **Impacto alto.** El gate de coordinación de §2.4 **no existe en la UI**: la card enlaza incondicionalmente a la captura. **Paso (1) obligatorio: poblar `coordinacionVigente` en `proyectarTasacion()`** antes de cablear `resolverAccionCard()` | `components/tasador/tasacion-card.tsx` |
| **Divergencia §4.1** | La ventana de **4 h** del chip "Por coordinar" **no la implementa ninguna versión** —ni la actual por etapa ni la original—. Es preexistente, no la introdujo esta tanda. Anotada dentro de CI-045 | — |
| **RF-TAS-05** | Lectura de `TX_CoordinacionVisita` en las pestañas Datos (§1.3.2) e Historial (§1.3.3) de IF-02. **Desbloqueada** —sólo necesita que la fila exista, y existe— pero es superficie IF-02: **tanda aparte** | `lib/historial-airtable.ts:167` tiene la nota |
| **Deuda documental previa** | 4 módulos sin documentar de P1/P2-TAS, más `coordinacionVigente` en el tipo sin proyectar (esto último cubierto por CI-046). ⚠ **Arrastrada de sesiones anteriores; no verificada en ésta** — se anota para no perderla, no como hallazgo de hoy | — |

## Decisiones arquitectónicas

Las dos primeras son previas; las dos últimas se registraron en esta tanda.

- **RO-34 · Ausencia ≠ neutro.** Un campo no tecleado se representa como `""` o
  `null`, nunca como su valor neutro: el neutro es indistinguible de una
  decisión explícita del usuario. *(previa)*
- **RO-35 · Ningún efecto de montaje dispara una escritura irreversible.** El
  montaje no expresa intención — ocurre por navegación, recarga e hidratación.
  Toda transición irreversible va por click explícito. *(previa)*
- **RO-36 · Un día del calendario no es un instante: se ancla al mediodía
  local.** `T12:00:00` **sin `Z`**. Los instantes (`*_ts`) se leen tal cual.
  *(previa, aplicada en esta tanda vía `fechaCalendarioADate()`)*
- **RO-37 · Una capacidad nueva de acceso a Airtable desde IF-03 no se agrega a
  `lib/airtable-client.ts`.** Superficie compartida con IF-02 (**R5**). Se aísla
  en módulo propio de `lib/tasador/` con caché TTL, y la promoción queda diferida
  hasta que IF-02 la necesite. **Nueva en esta tanda** — la originó A-17, que
  exigió leer las `choices` de un `singleSelect` por Meta API.

## Pre-autorizaciones vigentes

- **`lib/tasador/field-ids.ts`** — pre-autorizado para **AGREGAR** `TABLE_IDs` y
  `FIELD_IDs` sin pedir permiso. Es registro central, no lógica de negocio.
  **Modificar los existentes sigue requiriendo autorización.**

Todo lo demás mantiene el contrato habitual: 🔴 pausa total antes de escribir
Airtable, crear o borrar archivos fuera de la lista de la tanda, tocar superficie
IF-02 (`airtable-client.ts`, `historial-airtable.ts`, `components/console/`), o
commitear.

## Próximos frentes candidatos

| Frente | Qué | Tamaño · impacto |
|---|---|---|
| **A** | **CI-046 completo** — poblar `coordinacionVigente` en `proyectarTasacion()` + cablear `resolverAccionCard()` en la card. Pantalla 1, IF-03 | **Impacto alto.** Es el único pendiente con consecuencia funcional: hoy se puede saltar la coordinación |
| **B** | **CI-045** — chip directo desde `coordinacion_vigente` + decidir la ventana de 4 h de §4.1. Pantalla 1 | Más chico. **Comparte el paso (1) con el Frente A** |
| **C** | **RF-TAS-05** en IF-02 — lectura de coordinaciones en Datos e Historial de la ejecutiva | Requiere **R5 explícito**. Tanda distinta, otra interfaz |
| **D** | **Merge a `main` + deploy a producción** | Sin código nuevo. Primera vez que Pantalla 2 llega a Railway |
| **E** | **Etapas SLA 4-7 sin escritor** — cierra el resto de CI-037. Esta tanda sólo cubrió e2 y e3 | Transversal |

**Si A y B van juntos, el paso (1) se paga una sola vez.** Están separados en dos
fichas porque sus impactos no son comparables, no porque deban hacerse aparte.

## Orden de lectura al retomar

1. Plan — el documento maestro de P4-TAS, o el que gobierne el frente elegido
2. Inventario del repo
3. `docs/aprendizajes.md` — incluye **RO-37**, nueva
4. `lib/tasador/schema-airtable.ts` — módulo nuevo del Bloque 4+5
5. `CLAUDE.md`
6. Este snapshot

### Prompt inicial

```
Sesión nueva. Leé en este orden: plan → inventario → aprendizajes →
schema-airtable → CLAUDE.md → snapshot
docs/_notas/sesion-2026-08-19-p4-tas-cierre.md. Confirmame qué leíste
y esperá indicación de frente.
```
