# -*- coding: utf-8 -*-
"""
T-TASADOR-E2E-5CASOS-PROD-TEST-20261005 · Siembra las 8 filas TX_Adjuntos subido_por='Sistema'
(documentos fuente, patrón A de VP-0067) para un caso sandbox, habilitando V1 (sheet documentos)
y V2 (/lectura con datos extraídos).

Fuente de datos: el propio Airtable del caso (TX_Solicitudes + TX_DatosTasacion + TX_Comparables),
ya auditado espejo del oráculo por las tandas RÉPLICA y FIX-MOTOR. Plantillas de atributos_esperados:
VP-0067 (plantillas-sistema-vp0067.json, extraído en solo-lectura).

Uso: python3 seed-sistema-caso.py <N> <record_id> [--dry-run]
Registra los ids creados en escrituras-casoN.json (insumo del rollback).
"""
import os, sys, json, urllib.request, urllib.parse

N = sys.argv[1]
RID = sys.argv[2]
DRY = "--dry-run" in sys.argv

TOK = os.environ["AIRTABLE_TOKEN"]; BASE = os.environ["AIRTABLE_BASE_ID"]
EV = os.path.dirname(os.path.abspath(__file__))
T_SOL = "tblaHTyMHYfmy7Fg6"; T_ADJ = "tblur71x1oItbmKZc"; T_COMP = "tbllbTuhb0waWIbRo"
T_DATOS = None  # resuelto por link

ALIAS = {"1": "Metlife6280", "2": "AGH1548", "3": "ALH335", "4": "Security6073", "5": "HEV3183"}
CARPETA = {"1": "caso1-metlife-6280", "2": "caso2-agh-1548", "3": "caso3-alh-335",
           "4": "caso4-security-6073", "5": "caso5-hev-3183"}

def api(method, path, payload=None, params=None):
    url = f"https://api.airtable.com/v0/{BASE}/{path}"
    if params: url += "?" + urllib.parse.urlencode(params)
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json"})
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} en {method} {path}: {e.read().decode()[:400]}", file=sys.stderr)
        raise

sol = api("GET", f"{T_SOL}/{RID}")["fields"]
codigo = sol.get("solicitud_codigo") or sol.get("codigo_ext") or f"CASO{N}"

# TX_DatosTasacion del caso (primera fila linkeada)
datos = {}
if sol.get("TX_DatosTasacion"):
    # resolver tabla por meta una sola vez
    tables = api("GET", f"../meta/bases/{BASE}/tables".replace("../", ""), params=None) if False else None
    req = urllib.request.Request(f"https://api.airtable.com/v0/meta/bases/{BASE}/tables",
                                 headers={"Authorization": f"Bearer {TOK}"})
    tbls = json.load(urllib.request.urlopen(req))["tables"]
    t_datos = [t for t in tbls if t["name"] == "TX_DatosTasacion"][0]["id"]
    datos = api("GET", f"{t_datos}/{sol['TX_DatosTasacion'][0]}")["fields"]

# comuna (nombre) vía M_Comunas
comuna = ""
if sol.get("comuna"):
    comuna = api("GET", f"tblyggAfQfq682XHK/{sol['comuna'][0]}")["fields"].get("nombre", "")

# comparables ordenados
comps = []
for cid in sol.get("TX_Comparables", []):
    comps.append(api("GET", f"{T_COMP}/{cid}")["fields"])
comps.sort(key=lambda c: c.get("clave_natural", ""))

plantillas = json.load(open(f"{EV}/plantillas-sistema-vp0067.json"))

direccion = sol.get("direccion", "")
prop_nombre = datos.get("propietario_nombre") or sol.get("cliente_final_nombre", "")
rol = datos.get("rol_sii") or sol.get("rol_sii", "")
sup = datos.get("sup_construccion_m2", "")
anio = datos.get("anio_construccion", "")
avaluo = datos.get("avaluo_fiscal_clp", 0)
avaluo_txt = "NO REGISTRA" if not avaluo else str(avaluo)
destino = datos.get("destino_sii", "HABITACIONAL")
urb = datos.get("ubicacion_urbano_rural", "urbano")
fecha_visita = sol.get("fecha_visita") or sol.get("fecha_visita_programada") or "2026-10-05"

def items(pares, fila=None):
    out = []
    for cod, val in pares:
        if val in (None, ""): continue
        it = {"codigo_atributo": cod, "valor": str(val), "confianza": 1}
        it["fila"] = fila if fila is not None else 1
        out.append(it)
    return out

def obtenidos(its):
    return json.dumps({"items": its, "no_extraidos": []}, ensure_ascii=False)

comp_items = []
for i, c in enumerate(comps, start=1):
    comp_items += items([
        ("tipo_referencia", c.get("tipo_referencia")), ("fecha_publicacion", c.get("fecha_publicacion")),
        ("direccion", c.get("direccion")), ("anio", c.get("anio")),
        ("telefono_contacto", c.get("telefono_contacto")), ("precio_uf", c.get("precio_uf")),
        ("sup_construccion_m2", c.get("sup_construccion_m2")), ("oo_cc_uf", c.get("oo_cc_uf")),
        ("uf_m2_construccion_f", c.get("uf_m2_construccion")),
    ], fila=i)

POR_CLAVE = {
    "permiso_edificacion": items([("direccion", direccion), ("superficie_construida_m2", sup),
        ("nombre_propietario", prop_nombre), ("tipo_propiedad", "Departamento"),
        ("ano_construccion", anio), ("comuna", comuna)]),
    "foto_fuente_sii": items([("avaluo_fiscal_clp", avaluo_txt), ("destino_sii", destino),
        ("ubicacion_urbano_rural", urb), ("cod_sii_manzana", datos.get("cod_sii_manzana")),
        ("cod_sii_predio", datos.get("cod_sii_predio")), ("sup_terreno_m2", datos.get("sup_terreno_m2"))]),
    "foto_ofertas_comparables": comp_items,
    "certificado_deuda_tgr": items([("rol_sii", rol), ("comuna", comuna),
        ("nombre_propietario", prop_nombre), ("tiene_deuda", "NO"), ("monto_deuda_clp", "0")]),
    "certificado_recepcion_final": items([("superficie_construida_m2", sup), ("direccion", direccion),
        ("tipo_propiedad", "Departamento"), ("comuna", comuna), ("rol_sii", rol), ("destino_sii", destino)]),
    "consulta_antecedentes_bien_raiz": items([("direccion", direccion), ("rol_sii", rol),
        ("avaluo_total_clp", avaluo_txt), ("comuna", comuna), ("nombre_propietario", prop_nombre),
        ("destino_sii", destino)]),
    "informe_no_expropiacion_serviu": items([("afecto_expropiacion", "NO"), ("direccion", direccion),
        ("rol_sii", rol), ("comuna", comuna)]),
    "inscripcion_dominio_cbr": items([("nombre_propietario", prop_nombre), ("comprador", prop_nombre),
        ("comuna", comuna)]),
}
KB = {"application/pdf": 112, "image/jpeg": 78,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 64}

rows = []
for clave, tpl in sorted(plantillas.items(), key=lambda kv: kv[1]["orden"]):
    ext = tpl["nombre_archivo"].rsplit(".", 1)[1]
    fields = {
        "solicitud": [RID],
        "subido_por": "Sistema",
        "clave_adjunto": clave,
        "descripcion": tpl["descripcion"],
        "nombre_archivo": f"{clave}_{ALIAS[N]}.{ext}",
        "mime_type": tpl["mime_type"],
        "tipo": tpl["tipo"],
        "tipo_adjunto": tpl["tipo_adjunto"],
        "orden": tpl["orden"],
        "estado_extraccion": "listo",
        "tamanio_kb": KB.get(tpl["mime_type"], 90) + tpl["orden"],
        "subido_en": f"{fecha_visita}T12:00:00.000Z",
        "atributos_esperados": tpl["atributos_esperados"],
        "atributos_obtenidos": obtenidos(POR_CLAVE[clave]),
    }
    rows.append({"fields": fields})

print(f"CASO {N} ({codigo}) · {len(rows)} filas Sistema a crear · comparables={len(comps)} · comuna={comuna}")
if DRY:
    print(json.dumps([{k: (v[:80] + "…" if isinstance(v, str) and len(v) > 80 else v)
                       for k, v in r["fields"].items()} for r in rows], ensure_ascii=False, indent=1)[:3000])
    sys.exit(0)

creados = []
for i in range(0, len(rows), 10):
    resp = api("POST", T_ADJ, {"records": rows[i:i+10], "typecast": True})
    creados += [r["id"] for r in resp["records"]]
out_path = f"{EV}/escrituras-caso{N}.json"
prev = json.load(open(out_path)) if os.path.exists(out_path) else {"adjuntos_sistema": [], "docgen": []}
prev["adjuntos_sistema"] += creados
json.dump(prev, open(out_path, "w"), indent=1)
print(f"OK · {len(creados)} adjuntos Sistema creados para caso {N}: {creados}")
