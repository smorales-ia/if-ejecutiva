"""Crea TX_DatosTasacion.antecedentes_json y siembra los defaults de la sección I en C_DefaultsAntecedentes.

Aprobado por Sergio en el chat el 23-oct-2026. Idempotente: no recrea el campo
si existe y no duplica filas cuya `clave` ya está.
"""
import json, sys, urllib.request

ENV = r"C:\Users\Sergio\Documents\GitHub\if-ejecutiva\.env.local"
BASE = "app9G7lLkIV3CpeLa"
T_DATOS = "tblMoK3mFuwN8Yr1A"
T_DEF = "tblOj7nXcjeouPy09"
TIPOS = {"Casa": "recrXDAjlVCe59XBW", "Departamento": "recf9hz8TbkQ6wsus"}
ESTADOS = ["nuevo", "usado"]

token = next(l.split("=", 1)[1].strip().strip('"') for l in open(ENV, encoding="utf-8") if l.startswith("AIRTABLE_TOKEN="))


def api(metodo, url, cuerpo=None):
    req = urllib.request.Request(url, method=metodo, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    try:
        with urllib.request.urlopen(req, datos) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:500]); sys.exit(1)


# 1. Campo antecedentes_json
meta = api("GET", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables")
datos = next(t for t in meta["tables"] if t["id"] == T_DATOS)
existente = next((f for f in datos["fields"] if f["name"] == "antecedentes_json"), None)
if existente:
    print("campo ya existe:", existente["id"])
else:
    f = api("POST", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{T_DATOS}/fields", {
        "name": "antecedentes_json",
        "type": "multilineText",
        "description": "Sección I del tasador (Hoja N°3 y detalle de Hoja 1: normativa, sector, terreno, emplazamiento, instalaciones, síntesis). JSON con la forma de SeccionI; un solo escritor: PATCH /api/tasaciones/[id]/datos. 23-oct-2026.",
    })
    print("campo creado:", f["id"])

# 2. Defaults fijos (valores de la planilla, no fórmulas)
FILAS = [
    # bloque, campo_destino, valor Casa, valor Departamento, origen
    ("emplazamiento", "diseno_arquitectonico", "TIPICO", "TIPICO", "Antecedentes!H16"),
    ("emplazamiento", "utilidad_funcional", "ADECUADA", "ADECUADA", "Antecedentes!H17"),
    ("emplazamiento", "tipo_adosamiento", "AISLADA", "EDIF DPTO", "Antecedentes!H18"),
    ("emplazamiento", "predio_vista", "BUENO", "BUENO", "Antecedentes!Z16"),
    ("emplazamiento", "relacion_terreno_construccion", "ADECUADO", "ADECUADO", "Antecedentes!Z18"),
    ("emplazamiento", "iluminacion_natural", "ADECUADA", "ADECUADA", "Antecedentes!Z19"),
    ("plan_regulador", "cumple_uso_actual", "SI", "SI", "Antecedentes!BI7"),
    ("plan_regulador", "cumple_tipo_construccion", "SI", "SI", "Antecedentes!BI8"),
    ("plan_regulador", "cambios_plan_regulador", "NO CONTEMPLA", "NO CONTEMPLA", "Antecedentes!BI10"),
    ("plan_regulador", "ley_9135", "NO", "NO", "Antecedentes!AT9"),
    ("instalaciones", "alcantarillado", "Colector", "Colector", "Antecedentes!AN15"),
    ("detalle", "afecto_expropiacion", "NO", "NO", "Portada!BK24"),
    ("detalle", "fuente_informacion", "DOM, Plano Catastro", "DOM, Plano Catastro", "Portada!BL25"),
]

claves = set()
off = None
while True:
    url = f"https://api.airtable.com/v0/{BASE}/{T_DEF}?pageSize=100&fields%5B%5D=clave"
    if off:
        url += f"&offset={off}"
    r = api("GET", url)
    claves |= {x["fields"].get("clave") for x in r["records"]}
    off = r.get("offset")
    if not off:
        break

nuevas = []
for tipo, rec in TIPOS.items():
    for estado in ESTADOS:
        for bloque, campo, v_casa, v_depto, origen in FILAS:
            clave = f"{tipo}·{estado}·{campo}·valor"
            if clave in claves:
                continue
            nuevas.append({"fields": {
                "clave": clave,
                "tipo_propiedad": [rec],
                "estado_uso": estado,
                "bloque": bloque,
                "atributo": "valor",
                "campo_destino": campo,
                "valor_default": v_casa if tipo == "Casa" else v_depto,
                "catalogo_ref": f"{origen} · lista inline",
                "origen": f"[Excel: {origen}]",
                "activo": True,
                "notas": "Sección I (Hoja N°3) · sembrado 23-oct-2026 con aprobación de Sergio.",
            }})

for i in range(0, len(nuevas), 10):
    api("POST", f"https://api.airtable.com/v0/{BASE}/{T_DEF}", {"records": nuevas[i:i + 10], "typecast": True})
print("filas creadas:", len(nuevas), "· ya existentes omitidas:", 4 * len(FILAS) - len(nuevas))
