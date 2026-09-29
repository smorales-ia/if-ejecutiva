# Handoff a producción — T-CIERRE-FINAL-20260929

Para: Sergio · Fecha: 2026-09-29
Escrito por el Agente D (verificación y handoff). Nada de lo descrito aquí fue ejecutado:
commit, push y merges los haces tú desde GitHub Desktop.

---

## 1. Qué ramas pasar a producción y en qué orden

Buena noticia: **basta con una sola rama**. Se verificó con git que
`feat/T-CIERRE-FINAL-20260929` ya contiene TODA la cadena de trabajo:

- `main` (8743e46) ✓ contenida
- `feat/T-PDF-BASE-20260927` ✓ contenida
- `feat/T-PDF-IMPRENTA-20260927` ✓ contenida
- `feat/T-PDF-IDENTICO-20260927` ✓ contenida (su HEAD 0f36e28 es hoy el mismo HEAD de la rama de cierre)

Pasos, en orden:

1. En GitHub Desktop, párate en la rama `feat/T-CIERRE-FINAL-20260929`.
2. Haz **commit** de la carpeta nueva `docs/_evidencia/T-CIERRE-FINAL-20260929/`
   (hoy está sin versionar; es solo documentación y evidencia, no toca código).
   Sugerencia de mensaje: `docs(cu-002): evidencia y handoff T-CIERRE-FINAL-20260929`.
3. **Merge de `feat/T-CIERRE-FINAL-20260929` a `main`** (una sola operación; no hace falta
   mergear las ramas T-PDF-* una por una, ya vienen adentro).
4. **Push de `main`**. Railway detecta el push y redespliega solo.
5. Las ramas `feat/T-PDF-BASE/IMPRENTA/IDENTICO-20260927` y sus `plan/*` quedan como
   histórico; puedes borrarlas después si quieres, no es necesario para el deploy.

---

## 2. Checklist post-deploy (5–10 minutos)

### 2.1 Variables de entorno en Railway

Verifica que existan (los valores los tienes tú; aquí solo los nombres):

- `AIRTABLE_TOKEN` y `AIRTABLE_BASE_ID`
- `MAKE_HMAC_SECRET`
- **`MAKE_WEBHOOK_E2`** ← es la variable NUEVA de la tanda T-PDF-IMPRENTA. Si falta,
  el botón "Enviar informe" devuelve error 503 y no imprime nada. En `.env.local` local
  ya está; confírmala en Railway.
- `MAKE_WEBHOOK_URL_SC01`, `MAKE_WEBHOOK_URL_SC05`, `MAKE_WEBHOOK_URL_RF09`
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_APP_URL`, `ANTHROPIC_API_KEY`

### 2.2 Escenarios Make que deben quedar ACTIVOS (y versión)

| Escenario | ID | Versión | Estado esperado |
|---|---|---|---|
| SC01 alta interna | 6483077 | v1.1 | ACTIVO |
| SC-Asignar | 6681939 | v2.1 | ACTIVO |
| SC-Edicion | 6682031 | v3.5 | ACTIVO |
| SC-RF09 Extracción Claude | 6554321 | v2.2 | ACTIVO |
| **E2 Carbone Render** | 5750023 | v2.1 "InformeContexto" ⚠ ver §3.0 | **ACTIVO** |
| **E3 Carbone Download Dropbox** | 5791413 | v2.1 "(sin share-link: scope pendiente)" | **ACTIVO** |
| SC05 email tasador | 6780103 | v1.0 | INACTIVO (tu stop del 21-sep sigue vigente — activarlo es decisión tuya) |
| SC-SLA-Envio | 7597712 | v1.0 | INACTIVO (activación programada es decisión tuya) |

### 2.3 Qué probar tras el deploy

1. Entrar a la consola (`/consola`) y ver la cartera — confirma que Airtable responde.
2. Como **tasador**, abrir `/tasaciones/{id}/informe` de VP-2026-0067 y pulsar
   **"Enviar informe"** (esto además genera las capturas del punto 3.1).
3. Verificar en Airtable: fila nueva en `TX_DocumentosGenerados`,
   `pdf_final_url` actualizado en la solicitud, y entradas "✓ OK" de
   `E2_Carbone_Render` y `E3_Carbone_Download_Dropbox` en `LogEscenarios`.

---

## 3. Pendientes explícitos tuyos

### 3.0 Re-apuntar E2 a la plantilla nueva (ANTES de probar "Enviar informe")

La tanda de cierre publicó en Carbone la plantilla con la Hoja 1 corregida
(templateId nuevo `31f3bfab76addc8dc47f0b777553cb4c1c94274695c7f25fb5dddf0703408e32`),
pero el entorno de Claude Code bloqueó por permisos la modificación del escenario E2
(regla sobre E1/E2/E3). **E2 sigue apuntando a la plantilla anterior**: si emites un
informe antes de este paso, saldrá sin el ajuste de la portada.

Qué hacer (2 minutos, instrucción exacta en
`docs/_evidencia/T-CIERRE-FINAL-20260929/diseno-checklist.md` §Publicación):
en Make, escenario 5750023, módulo 2 (HTTP a Carbone), reemplazar en la URL el
templateId viejo `517ddc62…434d` por el nuevo `31f3bfab…8e32`, renombrar el escenario a
`E2_Carbone_Render v2.2 - InformeContexto` y guardarlo ACTIVO. (O autorizar a Claude
Code el PATCH por API en la próxima sesión.) Rollback: volver a poner el templateId
viejo.

### 3.1 Las 3 capturas como tasador EN PRODUCCIÓN

Son el pendiente nº 4 del cierre de T-PDF-IDENTICO
(`docs/_analisis/CIERRE_T-PDF-IDENTICO-20260927.md` §Pendientes). En
`/tasaciones/{id}/informe`, ya desplegado en Railway:

1. **Diálogo de confirmación**: "¿Enviar este informe al visador?" con el botón
   "Enviar informe" visible.
2. **Estado en vuelo**: el mismo botón mostrando el spinner y el texto **"Enviando…"**.
3. **Resultado**: la confirmación de informe enviado / el link al PDF generado.

### 3.2 Share-link de Dropbox (E3) — el Reauthorize NO agregó el scope

Se verificó por API de Make (solo lectura) que la conexión "My Dropbox connection"
(7553318) sigue teniendo **solo 4 scopes** y **`sharing.write` no está**, pese al
Reauthorize. Consecuencia comprobada hoy: la URL del PDF v2 de VP-2026-0067 que quedó en
Airtable redirige a la **pantalla de login de Dropbox** (302 → /login) — no es un link
público.

Qué tienes que autorizar/hacer (el detalle técnico exacto está en
`docs/_evidencia/T-CIERRE-FINAL-20260929/verificacion-sharelink-e3.md` §1.5):

1. Conseguir el scope: repetir el Reauthorize en Make y verificar, o crear una conexión
   Dropbox nueva en Make (el OAuth nuevo pide los scopes completos, incluido
   `sharing.write`).
2. Autorizar que se agregue a E3 el módulo Dropbox **"Create a Share Link"** después del
   upload, y que `pdf_final_url` (solicitud) y `url_pdf` (TX_DocumentosGenerados) pasen a
   guardar ese link compartido en vez de la URL interna actual.
3. Tras el cambio: re-emitir un informe y comprobar que el link abre **sin** login.
   El nombre del escenario se bumpea a v2.2 y se exporta el blueprint al repo.

Hasta que esto se haga, los PDF solo se pueden abrir con tu sesión de Dropbox — el flujo
funciona igual, pero el link no sirve para compartir con terceros.

### 3.3 Otros pendientes que ya venían del cierre anterior (estado al 29-sep)

- OK visual final del PDF vs la referencia: ahora sobre el **PDF v3**
  (`docs/_evidencia/T-CIERRE-FINAL-20260929/PDF_generado_VP0067_v3.pdf`) — tuyo.
- Fix motor `C_Formulas`: **YA APLICADO en esta tanda** (AT03 verificada OFF; harness
  17/17 PASS). AT03 sigue OFF; antes de una eventual reactivación recuerda el paste
  manual del script `docs/_artefactos/airtable/AT03_Calculos_DAG.js` en la automation.
- Credencial `DROPBOX_*` de `.env.local` sigue inválida (no afecta al pipeline Make,
  que usa la conexión OAuth propia de Make).
