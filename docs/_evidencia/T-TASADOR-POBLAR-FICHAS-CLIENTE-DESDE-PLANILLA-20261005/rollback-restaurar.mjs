#!/usr/bin/env node
/**
 * rollback-restaurar.mjs — T-TASADOR-POBLAR-FICHAS-CLIENTE-DESDE-PLANILLA-20261005
 *
 * Restaura en M_Clientes (tblpK7AcYBMH93apK · base app9G7lLkIV3CpeLa) los 4 campos
 * de parámetros al estado respaldado en backup-mclientes.json (snapshot 2026-10-05,
 * ANTES de cualquier escritura de la tanda):
 *
 *   - factor_garantia     (fldbv6nAdOsR9rCQQ)
 *   - factor_seguro       (fldjC67OGZOfIRMEc)   ← columna de seguro VIVA
 *   - tasa_cap_rate       (fldT6zd1COvckWgqq)
 *   - redondeo_decimales  (fldoFQQCsBpZ7yS9L)
 *
 * Los records que estaban VACÍOS vuelven a vacío (se envía null).
 * NO toca factor_seguro_incendio (fldS1GpxuH5BnCpqg — columna muerta, vacía en los 92).
 * NO toca ningún otro campo ni crea/borra records.
 *
 * Uso:
 *   node rollback-restaurar.mjs            # DRY-RUN (default): muestra qué haría, 0 requests de escritura
 *   node rollback-restaurar.mjs --apply    # ejecuta los PATCH reales (batches de 10)
 *
 * Token: lee AIRTABLE_TOKEN de .env.local del repo (sin source — línea a línea).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");

const BASE_ID = "app9G7lLkIV3CpeLa";
const TABLE_ID = "tblpK7AcYBMH93apK";
// Se referencia por FIELD_ID (regla del repo: preferir fld… ante riesgo de colisión).
const CAMPOS = {
  fldbv6nAdOsR9rCQQ: "factor_garantia",
  fldjC67OGZOfIRMEc: "factor_seguro",
  fldT6zd1COvckWgqq: "tasa_cap_rate",
  fldoFQQCsBpZ7yS9L: "redondeo_decimales",
};

// --- token desde .env.local (sin source: la línea 23 del archivo revienta bash) ---
const envPath = join(__dirname, "../../../.env.local"); // docs/_evidencia/<tanda>/ → raíz repo
const envLine = readFileSync(envPath, "utf8")
  .split(/\r?\n/)
  .find((l) => l.startsWith("AIRTABLE_TOKEN="));
if (!envLine) {
  console.error("No se encontró AIRTABLE_TOKEN en " + envPath);
  process.exit(1);
}
const TOKEN = envLine.slice("AIRTABLE_TOKEN=".length).trim();

// --- backup ---
const backup = JSON.parse(
  readFileSync(join(__dirname, "backup-mclientes.json"), "utf8"),
);
if (backup.tableId !== TABLE_ID) {
  console.error("El backup no corresponde a M_Clientes. Abortando.");
  process.exit(1);
}

// Payload: para CADA record del backup, los 4 campos a su valor respaldado.
// Campo ausente en el backup = estaba vacío → null (la API borra el valor).
const updates = backup.records.map((r) => {
  const fields = {};
  for (const [fid, nombre] of Object.entries(CAMPOS)) {
    const v = r.fields[nombre];
    fields[fid] = v === undefined ? null : v;
  }
  return { id: r.id, fields };
});

console.log(
  (APPLY ? "[APPLY] " : "[DRY-RUN] ") +
    `${updates.length} records a restaurar en ${TABLE_ID} (backup del ${backup.exportedAt}).`,
);

if (!APPLY) {
  // Muestra resumen: cuántos vuelven a vacío por campo y 3 ejemplos.
  for (const [fid, nombre] of Object.entries(CAMPOS)) {
    const vacios = updates.filter((u) => u.fields[fid] === null).length;
    console.log(`  ${nombre} (${fid}): ${updates.length - vacios} con valor · ${vacios} vuelven a VACÍO`);
  }
  for (const u of updates.slice(0, 3)) {
    console.log("  ejemplo:", JSON.stringify(u));
  }
  console.log("Dry-run OK. Nada se escribió. Ejecutar con --apply para restaurar.");
  process.exit(0);
}

// --- PATCH real, batches de 10 (límite Airtable), con pausa anti rate-limit ---
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
let hechos = 0;
for (let i = 0; i < updates.length; i += 10) {
  const lote = updates.slice(i, i + 10);
  const resp = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: lote }),
  });
  if (!resp.ok) {
    console.error(`FALLO en lote ${i / 10 + 1}: HTTP ${resp.status}`, await resp.text());
    console.error(`Restaurados hasta ahora: ${hechos}/${updates.length}. Re-ejecutar es seguro (idempotente).`);
    process.exit(1);
  }
  hechos += lote.length;
  console.log(`  lote ${i / 10 + 1}: ${hechos}/${updates.length} restaurados`);
  await sleep(250); // 5 req/s máx de Airtable
}
console.log("Restauración completa: " + hechos + " records.");
