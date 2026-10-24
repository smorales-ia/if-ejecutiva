"""Deja los datos de VP-2026-0079 como los del informe MET-6283 (réplica, 23-oct-2026).

Pedido de Sergio en el chat: «corrige lo que sea necesario, para obtener un
informe idéntico en producción». Escribe en producción, idempotente:

1. TX_ItemsCuadroValoracion: Servidumbre va 2ª y Piso 1 3ª (orden del cuadro de
   la planilla, Portada!B51:B56); piscina y OO.CC sin situación municipal ni
   estado, como en la planilla (no cambian ningún valor: el motor sólo mira
   «S/Reg No Regularizable» y estado «M»).
2. TX_DatosTasacion: antecedentes_json (sección I) con los valores de las hojas
   Antecedentes y Portada del xlsm, y las dos síntesis (Portada!D12 · D18).

Uso: python -P cargar_0079_met6283.py [--aplicar]   (sin --aplicar sólo muestra)
"""
import json, sys, urllib.request, warnings

import openpyxl

warnings.filterwarnings("ignore")
APLICAR = "--aplicar" in sys.argv
RAIZ = r"C:\Users\Sergio\Documents\GitHub\if-ejecutiva"
XLSM = RAIZ + r"\docs\_referencias\1951-MET 6283-Los Eucaliptus 2100-Colina.xlsm"
BASE = "app9G7lLkIV3CpeLa"
T_ITEMS = "tblCxnMtOETK2ulD0"
T_DATOS = "tblMoK3mFuwN8Yr1A"
CODIGO = "VP-2026-0079"

token = next(l.split("=", 1)[1].strip().strip('"') for l in open(RAIZ + r"\.env.local", encoding="utf-8") if l.startswith("AIRTABLE_TOKEN="))


def api(metodo, url, cuerpo=None):
    req = urllib.request.Request(url, method=metodo, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, json.dumps(cuerpo).encode() if cuerpo is not None else None) as r:
        return json.load(r)


def filas(tabla):
    f = urllib.parse.quote(f'{{solicitud}}="{CODIGO}"')
    return api("GET", f"https://api.airtable.com/v0/{BASE}/{tabla}?filterByFormula={f}")["records"]


import urllib.parse  # noqa: E402

wb = openpyxl.load_workbook(XLSM, data_only=True, keep_vba=True)
P, A = wb["Portada"], wb["Antecedentes"]
v = lambda h, c: "" if h[c].value is None else str(h[c].value).strip()
num = lambda h, c: "" if h[c].value is None else (str(int(h[c].value)) if float(h[c].value).is_integer() else str(h[c].value))

seccion_i = {
    "detalle": {
        "sitioLote": v(P, "BR6"),
        "mansarda": v(P, "BK7"),
        "afectoExpropiacion": v(P, "BK24"),
        "fuenteInformacion": v(P, "BL25"),
    },
    "normativa": {
        "supPredialMinimo": v(A, "Z7"),
        "frentePredialMinimo": v(A, "Z8"),
        "ocupacionSuelo": v(A, "Z9"),
        "coefConstructibilidad": v(A, "Z10"),
        "alturaEdificacion": v(A, "Z11"),
        "distanciaMedianero": v(A, "Z12"),
        "sistemaAgrupamiento": v(A, "Z13"),
        "ley6071": v(A, "AT8"),
        "ley9135": v(A, "AT9"),
        "ley19537": v(A, "AT10"),
        "cumpleUsoActual": v(A, "BI7"),
        "cumpleTipoConstruccion": v(A, "BI8"),
        "usoMasProbable": v(A, "BI9"),
        "cambiosPlanRegulador": v(A, "BI10"),
    },
    "sector": {
        "demanda": v(P, "F22"),
        "tendencia": v(P, "F23"),
        "densidad": v(P, "F24"),
        "mercado": v(P, "F25"),
        "abc1": v(P, "F26"),
        "homogeneidad": v(P, "H26"),
        "destinoBarrio": v(P, "S22"),
        "tipoZona": v(P, "S23"),
        "calzada": v(P, "S24"),
        "acera": v(P, "S25"),
        "solera": v(P, "S26"),
        "antejardin": v(P, "AE22"),
        "redElectrica": v(P, "AE23"),
        "aguaPotable": v(P, "AE24"),
        "gas": v(P, "AE25"),
        "proyUsoTerrenos": v(P, "AE26"),
        "arteriaPrincipal": v(A, "BD19"),
    },
    "usoTerrenos": {
        "casas": num(P, "AP23"),
        "deptos": num(P, "AP24"),
        "condominios": num(P, "AP25"),
        "equipComercial": num(P, "AP26"),
        "industrial": num(P, "AX23"),
        "comercial": num(P, "AX24"),
        "sitiosEriazos": num(P, "AX25"),
    },
    "terreno": {
        "forma": v(A, "AT22"),
        "pendiente": v(A, "AT23"),
        "orientacion": v(A, "AT24"),
        "frente": num(A, "BG21"),
        "contrafrente": num(A, "BG22"),
        "deslindeNorte": num(A, "BG23"),
        "deslindeSur": num(A, "BG24"),
    },
    "emplazamiento": {
        "tipoAgrupamiento": v(A, "H15"),
        "disenoArquitectonico": v(A, "H16"),
        "utilidadFuncional": v(A, "H17"),
        "tipoAdosamiento": v(A, "H18"),
        "predioVista": v(A, "Z16"),
        "orientacionConstruccion": v(A, "Z17"),
        "relacionTerrenoConstruccion": v(A, "Z18"),
        "iluminacionNatural": v(A, "Z19"),
    },
    "instalaciones": {"alcantarillado": v(A, "AN15"), "otros": v(A, "AN19")},
    "datosB": {"subterraneos": ""},
}
sintesis = v(P, "D12")
sector = v(P, "D18")

print(json.dumps(seccion_i, ensure_ascii=False, indent=1))
print("SINTESIS:", sintesis[:120], "…")
print("SECTOR:", sector[:120], "…")

items = {r["fields"].get("descripcion"): r for r in filas(T_ITEMS)}
cambios_items = [
    ("Servidumbre", {"orden": 2}),
    ("Piso 1", {"orden": 3}),
    ("Piscina", {"situacion_municipal": None, "flag_estado": None}),
    ("Quincho, terrazas, bodega", {"situacion_municipal": None, "flag_estado": None}),
    ("Cierros, pavimento exterior", {"situacion_municipal": None, "flag_estado": None}),
]
datos = filas(T_DATOS)
assert len(datos) == 1, f"se esperaba 1 fila de TX_DatosTasacion, hay {len(datos)}"
assert all(d in items for d, _ in cambios_items), f"ítems: {list(items)}"

if not APLICAR:
    print("(simulación: agrega --aplicar para escribir)")
    sys.exit()

api("PATCH", f"https://api.airtable.com/v0/{BASE}/{T_ITEMS}", {
    "records": [{"id": items[d]["id"], "fields": f} for d, f in cambios_items],
})
api("PATCH", f"https://api.airtable.com/v0/{BASE}/{T_DATOS}/{datos[0]['id']}", {"fields": {
    "antecedentes_json": json.dumps(seccion_i, ensure_ascii=False),
    "sintesis_descriptiva": sintesis,
    "descripcion_sector": sector,
}})
print("aplicado")
