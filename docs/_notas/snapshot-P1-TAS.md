# Snapshot · cierre de P1-TAS — Types TypeScript

> **Tanda:** P1-TAS del plan `docs/_md/plan_ejecucion_UItasador_v1.0.md` §2.
> **Fecha:** 2026-08-17 · cierre 22:05 (-04) · **Rama:** `feat/tasador-ui`
> **Contrato aplicado:** 🟢 libre.
> **Aprendizajes:** `docs/_archivo/aprendizajes-20260817-2205-P1-TAS.md` ✅
>
> Este snapshot y su archivo de aprendizajes existen los dos → por §0.7 · paso 6 del plan, la
> tanda **NO** quedó a medias. **Siguiente de la secuencia oficial: P2-TAS · API Routes directas a
> Airtable** (modo `accept edits on` · contrato 🟡 pausa-en-comandos).

---

## 1 · Decisiones de Sergio que gobernaron la tanda

Las cuatro se tomaron antes de escribir código, sobre las preguntas de §3.1 del snapshot anterior:

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | §3.1 · replanificación por el cierre de CI-012 | **No tipar coordinación; limpiar después.** Los huérfanos quedan inertes |
| 2 | OV-4 · dónde viven los tipos | **`@/lib/tasaciones`**, no `lib/tasador/types.ts` |
| 3 | Build rojo (§0.7 · paso 7) | **Aval explícito para arrancar igual.** El verde sigue diferido a P2-TAS |
| 4 | `snapshot-P0.5-TAS-en-curso.md` | **Borrar con `git rm`** y commitear el borrado junto con P1-TAS |

---

## 2 · Qué se construyó

| Archivo | Líneas | Contenido |
|---|---|---|
| `lib/tasaciones.ts` | ~470 | 14 tipos de dominio + 4 catálogos |
| `lib/tasador/field-ids.ts` | ~180 | `TABLE_IDS` + 4 mapas de FIELD_ID (`Object.freeze`) |
| `lib/tasador/mock-user.ts` | ~60 | `getUsuarioTasador()` · `mockTasadorConfigurado()` |
| `lib/tasador/tipo-propiedad.ts` | ~105 | Paliativo P-5 (género masculino ↔ femenino) |

**Cero modificaciones a código existente.** Los cuatro archivos son nuevos.

---

## 3 · Estado del build

| | Antes de P1-TAS | Después |
|---|---|---|
| `pnpm tsc --noEmit` | 🔴 **102** errores | 🔴 **41** errores (−61) |
| `pnpm build` | 🔴 falla | 🔴 falla · exit 1 |
| Errores en los archivos nuevos | — | **0** |
| Módulos ausentes (TS2307) | 4 | 3 |

`pnpm build` se corrió y **falla con exit 1**, como estaba previsto. `next.config.mjs` tiene
`typescript.ignoreBuildErrors: true`, así que lo que lo tumba **no** son los errores de tipo sino
`Module not found` de Turbopack sobre los tres módulos que aún faltan, más los named exports
ausentes de `@/lib/tasaciones` (las 8 funciones de P2-TAS). **Ningún archivo de los creados en esta
tanda aparece como módulo irresoluble**: sólo aparecen como importadores.

`@/lib/tasaciones` deja de faltar. Quedan `@/hooks/use-estado-tasador`, `@/lib/tasador-store` y
`@/lib/factores-default`, los tres destino **P2-TAS**.

**Los 41 restantes son deuda ya inventariada, ninguno nuevo** — desglose completo en §4 del archivo
de aprendizajes. Reparto: 13 el huérfano `coordinar-visita.tsx`, 20 las funciones y módulos de
P2-TAS, 5 `OV-10` (P5-TAS/P9-TAS), 2 el `Select` de `@base-ui` (P7-TAS), 1 el residuo CI-015.

---

## 4 · Criterios de aceptación (§2.3 del plan)

| Criterio | Estado |
|---|---|
| Los cuatro módulos existen | ✅ · con **OV-4**: `lib/tasaciones.ts` en vez de `lib/tasador/types.ts` |
| Ningún FIELD_ID inventado | ✅ verificado con `comm -23`: **0 de 32** fuera del schema doc. Idem 17 TABLE_IDs |
| `AccionCard` es unión discriminada | ⛔ **superado por CI-012** — no se creó. Ver §3 del archivo de aprendizajes |
| `grep -rn "fechaVisita\b" lib/tasador/` vacío | ✅ (Regla T-B) |
| `EstadoBackend` sin `devuelta` | ✅ — sólo aparece en el comentario que explica su ausencia |
| `mockUserTasador` único punto de identidad | ✅ · `grep -rn "clerk\|Clerk" lib/tasador/` da sólo comentarios en `mock-user.ts` |
| Ningún tipo duplica uno de `lib/console-data.ts` | ✅ tras corregir la colisión de `ContactoVisita`, que ahora se **importa** de IF-02 |
| `pnpm tsc --noEmit` pasa · `pnpm build` verde | ⛔ **no** — diferido a P2-TAS con aval de Sergio (decisión 3) |
| `git status` sin cambios fuera de `lib/tasador/` y `docs/` | ✅ salvo `lib/tasaciones.ts`, que es la consecuencia directa de OV-4 |
| Archivo de aprendizajes creado | ✅ |

---

## 5 · Qué falta

### 5.1 · Commit pendiente (lo hace Sergio · R12)

Sergio autorizó **esta vez** que Claude Code commiteara el borrado del snapshot junto con la tanda,
**sin push**. El redeploy de Railway queda a su criterio: el build sigue rojo y un push a esta rama
haría fallar el despliegue si Railway la tiene atada. **IF-02 en `main` no se ve afectado.**

### 5.2 · Bloqueante blando de P2-TAS

**`TASADOR_MOCK_RECORD_ID` no está definida.** `lib/tasador/mock-user.ts` la lee de
`process.env`; sin ella `getUsuarioTasador()` devuelve `recordId: ''` y ninguna lectura de
Airtable funcionará. → **Sergio debe ponerla en `.env.local`** con el recordId de un tasador real
de `M_Tasadores` (`tblEi5jp18c1j00bQ`) antes de P2-TAS. No se tocó `.env.example` para no salirse
del diff acotado de la tanda.

### 5.3 · Deuda que hereda P2-TAS

1. Resolver los 9 nombres de `FIELD_IDS_PENDIENTES` contra el schema real y actualizar §2 del
   schema doc en el mismo movimiento.
2. Contrastar los dominios de `OPCIONES` contra `TX_ItemsCuadroValoracion` (`tblCxnMtOETK2ulD0`) y
   `TX_Comparables` (`tbllbTuhb0waWIbRo`) — el schema doc no los documenta a nivel de campo. Caso
   concreto: `origenSuperficie` usa `plano-municipal` en el v0 contra `plano` en `TX_Unidades`.
3. **OV-9**: el hook va a `lib/tasador/use-estado-tasador.ts`, **no** a `hooks/`.
4. **OV-8**: `createRecord` y `listRecords` **ya existen** en `lib/airtable-client.ts` — no
   extenderlo ni instalar el SDK de Airtable.
5. `resolverLimite()` es el punto de cambio aislado de **A-16**.

### 5.4 · Sigue abierto de antes

- **Los huérfanos de CI-012**: `components/tasador/coordinar-visita.tsx` (512 l.) y
  `app/tasaciones/[id]/coordinar/page.tsx`. Decisión de Sergio pendiente: borrar (baja a 6 rutas
  contra las 7 de CI-020) o dejar inertes. Hoy concentran 13 de los 41 errores.
- **`TX_Amenities` no existe** y `Comodidades` no tiene tabla destino → **P7-TAS**.
- **P-5** sólo tiene paliativo; la corrección real es alinear el dominio en Airtable.
- **`C_Plantillas` vs `C_NotificacionesConfig`**: sin resolver.
- **Enmienda a R5** (§3 del archivo de aprendizajes): el territorio de escritura de IF-03 ya incluye
  `lib/tasaciones.ts`, y el texto de la regla no lo refleja.

### 5.5 · Lo que NO falta

- ❌ No re-ejecutar P1-TAS. Está completa, con snapshot y aprendizajes.
- ❌ No crear `lib/tasador/types.ts` — OV-4 lo resolvió a favor de `lib/tasaciones.ts`. Dos rutas
  para los mismos tipos es el Riesgo 4 del inventario.
- ❌ No crear `CoordinacionVisita`, `MotivoNoContacto` ni `MOTIVOS_DEVOLUCION`.
- ❌ No crear `AccionCard` mientras CI-012 siga cerrado en sentido negativo.
- ❌ No instalar el paquete `airtable` (OV-8).
