# Destrabe de E3 — pasos manuales para Sergio

El entorno de Claude Code vetó modificar el escenario E3 por API (política sobre E1/E2/E3,
aun con la autorización de la tanda). El fix quedó 100% preparado; hay dos caminos, elegí UNO.

## Camino 1 (recomendado, un comando)

Desde la sesión de Claude Code, escribí:

```
! bash docs/_evidencia/T-PDF-E3-GENERICOS-20260930/fix-e3-apply.sh
```

El script: reconstruye el blueprint con los tokens de `.env.local` (no los imprime), agrega el
error handler de idempotencia al módulo "Create a Share Link", verifica, reactiva E3 y muestra
el estado final. Si termina con `isActive: true` y `queueCount: 0`, decile a Claude Code
"E3 destrabado, corré la validación" para que haga la emisión real ×2.

## Camino 2 (UI de Make, sin terminal)

1. Abrí https://eu1.make.com → Team VProperty → escenario **E3_Carbone_Download_Dropbox v2.2**
   (id 5791413) → editar.
2. Click derecho sobre el módulo **Dropbox "Create a Share Link"** → **Add error handler**.
3. En la rama de error agregá el módulo **HTTP "Make a request"** con:
   - URL: `https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblaHTyMHYfmy7Fg6/{{1.solicitud_id}}`
   - Method: GET · Parse response: **Yes**
   - Header `Authorization`: `Bearer <el AIRTABLE_TOKEN de .env.local>` (igual que el módulo
     que ya escribe en TX_Solicitudes)
4. Después de ese módulo agregá la directiva **Resume**, y en su campo **url** mapeá
   `pdf_final_url` de la respuesta del paso 3 (`data.fields.pdf_final_url`).
5. Guardá y encendé el escenario (ON). La ejecución pendiente en cola se procesa sola.
6. Avisale a Claude Code para que corra la validación (emisión real ×2 e idempotencia).

## Por qué este fix

Cuando el link ya existe, Dropbox devuelve 409 y hoy eso tumba el escenario. Con el error
handler, ante el 409 se recupera el link ya guardado en Airtable (mismo archivo ⇒ mismo link)
y el flujo sigue normal. Emitir dos veces el mismo informe deja de romper E3.

## Rollback

`e3-blueprint-snapshot-original.json` (en esta carpeta, tokens redactados — se re-inyectan
desde `.env.local` como hace el script) + `POST /scenarios/5791413/stop`.
