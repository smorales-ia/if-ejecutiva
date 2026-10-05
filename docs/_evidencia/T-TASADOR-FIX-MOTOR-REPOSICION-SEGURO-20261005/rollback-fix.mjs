#!/usr/bin/env node
// ROLLBACK FASE 2 · T-TASADOR-FIX-MOTOR-REPOSICION-SEGURO-20261005
// Restaura las 2 expresiones de C_Formulas y los campos tocados de las 4
// solicitudes sandbox desde rollback-fix.json. Idempotente. NO toca M_Clientes.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "..", "..", "..");
const BASE = "app9G7lLkIV3CpeLa";
const T_FORMULAS = "tblNFa454fBbqRB3t";
const T_SOLICITUDES = "tblaHTyMHYfmy7Fg6";
// Campos de sandbox que FASE 2 pudo tocar — se restauran siempre (ausente => null)
const CAMPOS_SANDBOX = [
  "estado",
  "valor_reposicion_override",
  "valor_seguro_override",
  "tasa_cap_rate_override",
  "vida_util_override",
  "override_motivo",
  "override_autor",
];

const envLine = readFileSync(join(REPO, ".env.local"), "utf8")
  .split("\n")
  .find((l) => l.startsWith("AIRTABLE_TOKEN="));
if (!envLine) {
  console.error("AIRTABLE_TOKEN no encontrado en .env.local");
  process.exit(1);
}
const TOKEN = envLine.slice("AIRTABLE_TOKEN=".length).trim();
const snap = JSON.parse(readFileSync(join(DIR, "rollback-fix.json"), "utf8"));

async function patch(table, recId, fields) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${table}/${recId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields, typecast: true }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(`FALLO PATCH ${table}/${recId}: HTTP ${res.status}`, JSON.stringify(body));
    process.exitCode = 1;
    return null;
  }
  return body;
}

async function get(table, recId) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE}/${table}/${recId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  return res.json();
}

// 1 · Expresiones de C_Formulas
for (const [recId, rec] of Object.entries(snap.c_formulas)) {
  const original = rec.fields.expresion;
  console.log(`Restaurando expresion de ${recId} (${rec.fields.nombre})…`);
  const ok = await patch(T_FORMULAS, recId, { expresion: original });
  if (ok) {
    const check = await get(T_FORMULAS, recId);
    const match = check.fields.expresion === original;
    console.log(match ? "  OK verificado (texto idéntico al snapshot)" : "  ⚠ VERIFICACION FALLO: el texto leído difiere del snapshot");
    if (!match) process.exitCode = 1;
  }
}

// 2 · Solicitudes sandbox
for (const [recId, rec] of Object.entries(snap.tx_solicitudes_sandbox)) {
  const fields = {};
  for (const k of CAMPOS_SANDBOX) {
    fields[k] = rec.fields[k] === undefined ? null : rec.fields[k];
  }
  console.log(`Restaurando sandbox ${recId} (${rec.fields.codigo_ext})…`);
  const ok = await patch(T_SOLICITUDES, recId, fields);
  if (ok) {
    const check = await get(T_SOLICITUDES, recId);
    const diffs = CAMPOS_SANDBOX.filter((k) => {
      const want = rec.fields[k] === undefined ? undefined : rec.fields[k];
      const got = check.fields[k];
      return JSON.stringify(want) !== JSON.stringify(got);
    });
    console.log(diffs.length === 0 ? "  OK verificado" : `  ⚠ DIFIEREN tras restore: ${diffs.join(", ")}`);
    if (diffs.length) process.exitCode = 1;
  }
}

console.log(process.exitCode ? "ROLLBACK CON ERRORES — revisar arriba" : "ROLLBACK COMPLETO");
