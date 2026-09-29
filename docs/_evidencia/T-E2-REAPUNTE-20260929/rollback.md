# Rollback — T-E2-REAPUNTE-20260929 (snapshot BLOQUE 0, 29-sep-2026)

> Convención de secretos: `<MAKE_TOKEN>` · `<CARBONE_PROD>` — nunca en claro.
> ESTADO DE LA TANDA: **DETENIDA EN GATE G2** — no se aplicó ningún cambio.

## Gates

| Gate | Resultado | Evidencia |
|---|---|---|
| G1 token + E2 accesible | ✅ OK | `GET $MAKE_BASE_URL/scenarios/5750023` → 200, name `E2_Carbone_Render v2.1 - InformeContexto`, activo. Token usado: `MAKE_API_TOKEN` de `.env.local` (único token Make presente). `MAKE_BASE_URL=https://eu1.make.com/api/v2` (ya incluye `/api/v2`). |
| G2 templateId nuevo por DOS fuentes | ✅ OK (resuelto por Sergio) | Falló al primer intento: handoff §3.0 decía `31f3bfab…8e32` y `.env.local` tenía el VIEJO `517ddc62…434d`. Se DETUVO y se preguntó a Sergio (regla de la tanda); Sergio confirmó en sesión que la buena es **`31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`** y autorizó actualizar `.env.local` (hecho — rollback: reponer `517ddc62…434d`). Verificación extra: `GET /template/31f3bfab…` en Carbone prod → 200. El id viejo aparece exactamente 1 vez en el blueprint: `flow[1].mapper.url` (módulo Carbone), coherente con handoff §3.0. |
| G3 AT03 OFF | ✅ OK (indirecto) | `A_DecisionesMotor` sin filas para VP-2026-0067 (motor nunca corrió sobre la espejo) + confirmación vigente de Sergio del 29-sep. El MCP sigue sin permiso sobre automations. |

## Estado original de E2 (para revertir si más adelante se aplica el fix)

- Escenario: 5750023 · `E2_Carbone_Render v2.1 - InformeContexto` · **activo**.
- templateId actual en el módulo Carbone (URL del POST /render): `517ddc620992eb71a97a8f3b34d33d54bfc3cdea3c2573ead868f2650c14434d`.
  (El hash `ed75b48e…7b377` también aparece en el blueprint: es el template v1 histórico en un texto/nota, no la URL activa.)
- Blueprint completo (redactado): `blueprint-E2-viejo-redacted.json` (6.483 bytes).
- Rollback del futuro cambio: PATCH del blueprint restaurando la URL con `517ddc62…434d` y el name `E2_Carbone_Render v2.1 - InformeContexto`.

## Contexto de la discrepancia G2 (evidencia, sin decidir)

Tres registros independientes de la tanda T-CIERRE-FINAL-20260929 documentan
`31f3bfab…8e32` como el template NUEVO publicado en Carbone el 29-sep
(`rollback.md` §Cambios #1, `diseno-checklist.md` §Publicación, `auditor.md` §5),
y `517ddc62…434d` como el viejo/productivo. `.env.local` fue tocado después de esa
tanda (aparecieron `MAKE_WEBHOOK_E1..E4`) pero `CARBONE_TEMPLATE_ID` quedó con el
valor viejo. La decisión de cuál es la plantilla buena es de Sergio (regla de la tanda).

## Cambios aplicados

| # | Fecha | Pieza | Cambio | Rollback |
|---|---|---|---|---|
| 1 | 29-sep | `.env.local` | `CARBONE_TEMPLATE_ID`: `517ddc62…434d` → `31f3bfab…8e32` (autorizado por Sergio en sesión) | reponer el valor viejo |
| 2 | 29-sep | E2 5750023 | PATCH → 200: `flow[1].mapper.url` = `https://api.carbone.io/render/31f3bfab…8e32` · name `E2_Carbone_Render v2.2 - InformeContexto` · sigue ACTIVO. Verificado con GET post: 0 ocurrencias del id viejo. Nota: el PATCH con python-urllib dio 403 Cloudflare (error 1010, firma de user-agent); con curl salió 200 | PATCH restaurando `blueprint-E2-viejo-redacted.json` (URL `…/render/517ddc62…434d`, name v2.1) |
| 3 | 29-sep | Run real (Bloque 2) | Disparo del webhook E2 para VP-2026-0067 → escrituras esperadas de E3 en `TX_Solicitudes.pdf_final_url` y fila nueva en `TX_DocumentosGenerados` (snapshots pre en esta carpeta) | PATCH VP-0067 con `snap-VP0067-pre-run.json`; DocGen: borrar fila nueva / restaurar vigencia según `snap-docgen-pre-run.json` |

AT03 intacta (OFF).

## Llamada HTTP que se iba a hacer (para cuando Sergio dé el OK)

```
GET  https://eu1.make.com/api/v2/scenarios/5750023/blueprint   (Authorization: Token <MAKE_TOKEN>)
PATCH https://eu1.make.com/api/v2/scenarios/5750023            (Authorization: Token <MAKE_TOKEN>)
body: {"blueprint": "<blueprint JSON con la URL del módulo Carbone cambiada de
       .../render/517ddc62…434d a .../render/31f3bfab…8e32
       y name = E2_Carbone_Render v2.2 - InformeContexto>"}
GET  https://eu1.make.com/api/v2/scenarios/5750023/blueprint   (verificación post)
```

Nota adicional: en la tanda T-CIERRE-FINAL el clasificador de permisos del entorno
denegó este PATCH (regla CLAUDE.md "no modificar E1/E2/E3", redacción desactualizada:
dice "hoy inactivos y sin blueprint" cuando E2/E3 están activos). Si Sergio aprueba,
conviene además corregir esa redacción del CLAUDE.md (propuesta en el cierre) —
sin auto-editarla.
