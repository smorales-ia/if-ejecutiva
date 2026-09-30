#!/usr/bin/env bash
# fix-e3-apply.sh — T-PDF-E3-GENERICOS-20260930
# Aplica el fix de IDEMPOTENCIA al escenario E3 (5791413) de Make y lo reactiva.
# Lo ejecuta SERGIO (el entorno de Claude Code veta modificar E3 por política).
# Uso, desde la raíz del repo (o con `!` dentro de la sesión de Claude Code):
#   bash docs/_evidencia/T-PDF-E3-GENERICOS-20260930/fix-e3-apply.sh
# No imprime tokens. Requiere: jq, curl, .env.local en la raíz del repo.
set -euo pipefail
cd "$(dirname "$0")/../../.."   # raíz del repo

# --- credenciales (sin imprimirlas) ---
set -a; source .env.local; set +a
: "${MAKE_API_TOKEN:?falta MAKE_API_TOKEN}"; : "${MAKE_BASE_URL:?falta MAKE_BASE_URL}"
: "${AIRTABLE_TOKEN:?falta AIRTABLE_TOKEN}"; : "${CARBONE_API_TOKEN_PROD:?falta CARBONE_API_TOKEN_PROD}"
SC=5791413
SNAP="docs/_evidencia/T-PDF-E3-GENERICOS-20260930/e3-blueprint-snapshot-original.json"

# --- 1) reconstruir el blueprint original con tokens reales (el snapshot del repo está redactado) ---
sed -e "s|<AIRTABLE_TOKEN>|$AIRTABLE_TOKEN|g" -e "s|<CARBONE_TOKEN_PROD>|$CARBONE_API_TOKEN_PROD|g" "$SNAP" > /tmp/e3-snap-full.json

# --- 2) agregar el error handler de idempotencia al módulo 9 (createShareLink) ---
# onerror: [ 20: http GET del record de la solicitud en Airtable (trae pdf_final_url del run
#            exitoso previo — mismo path de archivo => mismo shared link),
#            21: builtin:Resume con esa URL como sustituto del output del módulo 9 ]
# Módulos http:ActionSendData v3 clonados en forma de los módulos 2/7 ya probados del blueprint.
jq '
.response.blueprint as $bp |
($bp.flow[] | select(.id==7) | .mapper.headers) as $hdrs |
$bp | .flow = (.flow | map(
  if .id == 9 then . + {"onerror": [
    {"id": 20, "module": "http:ActionSendData", "version": 3,
     "parameters": {"handleErrors": false, "useNewZLibDeCompress": true},
     "mapper": {"ca":"","qs":[],"url":"https://api.airtable.com/v0/app9G7lLkIV3CpeLa/tblaHTyMHYfmy7Fg6/{{1.solicitud_id}}","data":"","gzip":false,"method":"get","headers":$hdrs,"timeout":"30","useMtls":false,"authPass":"","authUser":"","bodyType":"raw","contentType":"application/json","serializeUrl":false,"shareCookies":false,"parseResponse":true,"followRedirect":true,"useQuerystring":false,"followAllRedirects":false,"rejectUnauthorized":true},
     "metadata": {"designer": {"x": 890, "y": 300}}},
    {"id": 21, "module": "builtin:Resume", "version": 1,
     "mapper": {"url": "{{20.data.fields.pdf_final_url}}"},
     "metadata": {"designer": {"x": 1150, "y": 300}}}
  ]} else . end
))' /tmp/e3-snap-full.json > /tmp/e3-bp-new.json
jq -e '.flow[] | select(.id==9) | .onerror | length == 2' /tmp/e3-bp-new.json >/dev/null
jq '{blueprint: (. | tojson)}' /tmp/e3-bp-new.json > /tmp/e3-patch-body.json
echo "[1/4] Blueprint nuevo construido y validado (onerror con 2 módulos en el módulo 9)."

# --- 3) PATCH del blueprint ---
code=$(curl -s -o /tmp/e3-patch-resp.json -w '%{http_code}' -X PATCH \
  -H "Authorization: Token $MAKE_API_TOKEN" -H 'Content-Type: application/json' \
  --data @/tmp/e3-patch-body.json "$MAKE_BASE_URL/scenarios/$SC")
if [ "$code" != "200" ]; then echo "[ERROR] PATCH devolvió $code:"; cat /tmp/e3-patch-resp.json; exit 1; fi
echo "[2/4] PATCH aplicado (200)."

# --- 4) verificar que el onerror persistió ---
curl -s -H "Authorization: Token $MAKE_API_TOKEN" "$MAKE_BASE_URL/scenarios/$SC/blueprint" \
  | jq -e '.response.blueprint.flow[] | select(.id==9) | .onerror | length == 2' >/dev/null \
  && echo "[3/4] Verificado: onerror persistido en el módulo 9." \
  || { echo "[ERROR] el onerror NO aparece en el blueprint remoto"; exit 1; }

# --- 5) reactivar (consume el incoming pendiente de la cola del hook 3063524) ---
code=$(curl -s -o /tmp/e3-start-resp.json -w '%{http_code}' -X POST \
  -H "Authorization: Token $MAKE_API_TOKEN" "$MAKE_BASE_URL/scenarios/$SC/start")
if [ "$code" != "200" ]; then echo "[ERROR] start devolvió $code:"; cat /tmp/e3-start-resp.json; exit 1; fi
echo "[4/4] E3 reactivado. Esperando 45 s a que procese la cola…"
sleep 45
echo "--- Estado final ---"
curl -s -H "Authorization: Token $MAKE_API_TOKEN" "$MAKE_BASE_URL/scenarios/$SC" | jq '{isActive: .scenario.isActive, isinvalid: .scenario.isinvalid}'
curl -s -H "Authorization: Token $MAKE_API_TOKEN" "$MAKE_BASE_URL/hooks/3063524" | jq '{queueCount: .hook.queueCount}' 2>/dev/null || true
curl -s -H "Authorization: Token $MAKE_API_TOKEN" "$MAKE_BASE_URL/scenarios/$SC/logs?pg%5Blimit%5D=3" | jq '[.scenarioLogs[]? | {id, timestamp, status, duration, operations}]'
echo "Listo. Si isActive=true y queueCount=0, avisale a Claude Code que corra la validación (emisión real x2)."
