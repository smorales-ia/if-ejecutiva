# Ficha de brecha — `Arquitectura_Enterprise_VProperty_v2_8.md`

- **Familia** — C · Arquitectura Enterprise
- **Ruta** — `docs/_md/Arquitectura_Enterprise_VProperty_v2_8.md`
- **Última modificación** — 2026-07-23 · `a0dd566` · 5138 líneas
- **Versión declarada** — v2.8 *(el prompt asumía v2.6 — ver C-2)*
- **Decisión** — **ACTUALIZAR**
- **Prioridad** — **P1**

---

## Referencias al vocabulario obsoleto

| Término | Hits | Líneas |
|---|---|---|
| `devuelta` | 6 | 3761, 3764, 3771, 4407 |
| `SC15` | 2 | 3122, 3307 |
| `SC04` | 3 | 3158, 3749, 3807 |
| `SC05` | 2 | 3178, 3813 |
| `WhatsApp` / `whatsapp` | 5 | 1131, 4336, 4434, 4482 |
| `capturada` | 0 | ✅ |
| `TX_CoordinacionVisita` | **0** | — |

**Falso positivo relevante:** línea 3178 declara `SC05 ejecutar cadena · AT03 · TX_Solicitudes.estado = visitada`.
El **trigger ya es correcto** (`visitada`, no `capturada`); lo único obsoleto es el nombre del escenario.
`WhatsApp` en 4336, 4434 y 4482 se refiere a canales de soporte y a la práctica actual que el
sistema viene a reemplazar — **preservar**.

## Referencias al spec v1.9.3 § afectada

§2.3 · §2.11 · §2.12 · §2.13 · RF-TAS-03/05

## Impacto por sección del doc

| § del doc | Cambio requerido | § del spec v1.9.3 que lo justifica | Rol firmante |
|---|---|---|---|
| Máquina de estados (3749–3775) | Tabla estado→transiciones: `**pdf_listo** → aprobada · devuelta` (3761) y la fila `**devuelta** → asignada` (3764) pasan a **DEPRECATED** con la nota canónica; el flujo vivo es `pdf_listo → asignada`. Preservar la fila para solicitudes históricas | §2.11 (1806) · §2.12 (1872) | EA + DE |
| Máquina de estados · fila `creada` (3749) | *"Acaba de entrar al sistema. **SC04** corre y…"* → SC04 retirado; en v1.9 la asignación de tasador es **manual** (§1.5.5) | §2.11 (1836) | EA + INT |
| Sección IF-03 | Documentar las **7 pantallas de IF-03 con sus rutas**, incl. `app/tasaciones/[id]/coordinar/` como Pantalla 2 nueva | §2.13 (1882–1891) · §6.3 del prompt | EA + FE |
| Modelo de datos | Incorporar **`TX_CoordinacionVisita`** al inventario de tablas de la arquitectura, y los 3 campos nuevos de `TX_Solicitudes` | §2.12 | EA + DE |
| Tabla de escenarios (3122) | `SC15 · scheduler_actualizar_uf · Mindicador → H_PreciosUF · Cron diario 09:00` → marcar **retirado**, se resuelve como AT08 Airtable | §2.11 (1838) | INT |
| 3307 | *"**UF diaria:** SC15 actualiza H_PreciosUF desde mindicador.cl"* → ídem | §2.11 (1838) | INT |
| 3158 | `SC04 asignar tasador · Airtable Script · AT02 · TX_Solicitudes.estado = creada` → marcar **retirado** (asignación manual) | §2.11 (1836) | INT + EA |
| 3178 | `SC05 ejecutar cadena` → **renombrar a SC08** *(ex-SC05)*. El trigger `estado = visitada` ya es correcto — **no tocarlo** | §2.11 (1825, 1837) | INT |
| Narrativa de ejemplo (3807, 3813) | *"MIÉRCOLES 14:23:05 — SC04 asigna tasador"* y *"14:23:08 — SC05 envía email a Roberto"* → reescribir: asignación **manual** por la ejecutiva; notificación por **SC08** *(ex-SC05)*. Es prosa ilustrativa: debe reflejar el flujo real o se convierte en fuente de confusión | §2.11 (1836, 1837) · §1.5.5 | EA + PM |
| Métrica (4407) | `Tasa de devolución del … COUNT(estado=devuelta) / …` → recalcular; `devuelta` deja de poblarse. Misma observación que en el Blueprint | §2.11 (1806) | PM + DE |
| Tabla de automatizaciones | Agregar **SC08** y **SC09** con sus triggers | §2.11 (1825, 1828) | INT |

## Riesgos de esta intervención

1. **Narrativa temporal (3807–3813).** Es un ejemplo cronológico end-to-end. Cambiar SC04/SC05 obliga a revisar la coherencia de los timestamps y del relato completo, no sólo los identificadores.
2. **Métrica de devolución (4407).** Igual que en el Blueprint: excede el sync documental. Se marca y se pide firma PM.
3. **Sin `TX_CoordinacionVisita` en ninguna vista de arquitectura.** La tabla nueva debe entrar en el inventario de entidades y en los diagramas de flujo donde corresponda, no sólo mencionarse.
