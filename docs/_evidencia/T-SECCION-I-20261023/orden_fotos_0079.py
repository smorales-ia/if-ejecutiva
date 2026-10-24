"""Pone `TX_Adjuntos.orden` a las fotos de VP-2026-0079 como en el informe MET-6283.

Los archivos traen su posición en el original en el nombre (h4_01 … h5_08 =
Hojas 4 y 5; h2_ref1..3 = referencias de la Hoja 2). «Planificación» es el plano
(anexo1_plano.jpg), segunda foto de la Hoja 4. Sin `orden`, la grilla quedaba en
orden de llegada. Pedido de Sergio: «corrige lo que sea necesario, para obtener
un informe idéntico en producción» (23-oct-2026). Idempotente.
"""
import json, re, sys, urllib.parse, urllib.request

RAIZ = r"C:\Users\Sergio\Documents\GitHub\if-ejecutiva"
BASE, TABLA = "app9G7lLkIV3CpeLa", "tblur71x1oItbmKZc"
token = next(l.split("=", 1)[1].strip().strip('"') for l in open(RAIZ + r"\.env.local", encoding="utf-8") if l.startswith("AIRTABLE_TOKEN="))


def api(metodo, url, cuerpo=None):
    req = urllib.request.Request(url, method=metodo, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, json.dumps(cuerpo).encode() if cuerpo is not None else None) as r:
        return json.load(r)


f = urllib.parse.quote("FIND('VP-2026-0079',ARRAYJOIN({solicitud})&'')")
filas = api("GET", f"https://api.airtable.com/v0/{BASE}/{TABLA}?pageSize=100&filterByFormula={f}&fields%5B%5D=nombre_archivo&fields%5B%5D=orden")["records"]


def orden_de(nombre: str):
    m = re.match(r"h([45])_(\d\d)_", nombre)
    if m:
        return (int(m.group(1)) - 4) * 8 + int(m.group(2))
    if nombre == "anexo1_plano.jpg":
        return 2
    m = re.match(r"h2_ref(\d)\.", nombre)
    if m:
        return 16 + int(m.group(1))
    if nombre.startswith("h2_mapa_referencias"):
        return 20
    return None


cambios = []
for r in filas:
    o = orden_de(r["fields"].get("nombre_archivo", ""))
    if o is not None and r["fields"].get("orden") != o:
        cambios.append({"id": r["id"], "fields": {"orden": o}})
        print(f'{o:2d} {r["fields"]["nombre_archivo"]}')
if "--aplicar" in sys.argv:
    for i in range(0, len(cambios), 10):
        api("PATCH", f"https://api.airtable.com/v0/{BASE}/{TABLA}", {"records": cambios[i:i + 10]})
    print("aplicado:", len(cambios))
else:
    print("simulación:", len(cambios), "cambios (agrega --aplicar)")
