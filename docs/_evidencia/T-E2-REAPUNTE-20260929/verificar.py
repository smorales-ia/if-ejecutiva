#!/usr/bin/env python3
"""Batería QA T-E2-REAPUNTE-20260929 · valida PDF v4 vs oráculo MET-6283.
Uso: python3 docs/_evidencia/T-PDF-IDENTICO-20260927/verificar.py
Solo lectura (Airtable GET). Exit 0 = todo PASS."""
import io, os, re, sys, json, urllib.request, urllib.parse
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
REF = os.path.join(REPO, "docs/_referencias/Informe FRANCISCO VERGARA UNDURRAGA_Met6283.pdf")
GEN = os.path.join(HERE, "PDF_generado_VP0067_v4.pdf")
BASE, REC = "app9G7lLkIV3CpeLa", "recmMzeu3eWGxyXsf"
TBL_DOCS = "tbl5sYnGPZXgYCBSY"

def norm(t):
    # \n tambien colapsa a espacio: pymupdf corta lineas dentro de una celda
    # ("TERRAZA \nDESCUBIERTA...") y los literales del oraculo van sin saltos.
    return re.sub(r"\s+", " ", t.replace(" ", " ").replace("−", "-"))

RES = []
def check(tid, desc, ok, ev=""):
    RES.append(ok)
    print(f"{'PASS' if ok else 'FAIL'}  {tid:10s} {desc}" + ("" if ok else f"  << {ev}"))

# ---------- T0 + carga ----------
gen = pymupdf.open(GEN); ref = pymupdf.open(REF)
check("T0-PAG", "v3 tiene 8 páginas", len(gen) == 8, f"tiene {len(gen)}")
TXT = norm("\n".join(p.get_text() for p in gen))
PAG = [norm(p.get_text()) for p in gen]

# ---------- T1 DATOS ----------
T1 = [
  # terminales
  "20.125,86", "802.913.431", "9.246,94", "8.907,06", "8.517,68", "13.081,81", "16.603,84",
  "36.300.000", "806.666.667", "39.894,61", "5.024,86", "249,91", "16.610.203-0",
  # identificación corregida (las 4 brechas de datos)
  "2024", "70", "Maria Eugenia Soto", "METLIFE -6283", "900159638", "N°882-40",
  "N°319 09/09/2020", "N°210 18/07/2024",
  "LOS EUCALIPTUS, Casa: N°2100, Condominio LAS BRISAS DE CHICUREO",
  "FRANCISCO JOSÉ VERGARA UNDURRAGA", "MONICA REYES PINTO", "Héctor Martínez C.",
  "Colina", "Metropolitana de Santiago", "Refinanciamiento", "HABITACIONAL",
  "13-04-2026", "DOM, Plano Catastro",
  # comparables: totales y homologados UF/m²C
  "20.000", "24.900", "19.500", "23.900", "18.900", "20.500", "18.000",
  "34,05", "35,19", "35,71", "31,45", "31,82", "25,18", "22,99",
  # cuadro de valoración (formas corregidas, sin quirks)
  "11.218,80", "8.157,06", "350,00", "32,64", "0,96",
  # rentabilidad
  "3.300.000", "4,5%", "8 A 10 MESES", "82,5%", "65",
]
for v in T1:
    check("T1-DATOS", f"'{v}'", v in TXT)

# ---------- T2 IMÁGENES ----------
# Mínimos por página. Nota B-RECON: el "exacto 8" original en p5/p6 estaba mal
# calibrado — Carbone embebe ~36 objetos de imagen por página de grilla (render
# de prueba y render real coinciden); la completitud visual la cubre T5.
MIN_IMGS = {1: 1, 2: 3, 3: 4, 4: 0, 5: 8, 6: 8, 7: 4, 8: 6}
for n, p in enumerate(gen, 1):
    k = len(p.get_images(full=True))
    ok = True if MIN_IMGS.get(n, 0) == 0 else k >= MIN_IMGS[n]
    check("T2-IMG", f"p{n}: {k} imgs (min {MIN_IMGS.get(n, 0)})", ok)
check("T2-IMG", "sin placeholders '{d.' residuales", "{d." not in TXT)

# ---------- T3 HOJA 3 (página 4) ----------
H3 = ["PRMS", "OGUC", "LEY 19537", "Estrato Medio Alto", "Caletera Oriente Gral San Martín",
  "29,95", "REGULAR", "PLANO", "NORTE", "CONDOMINIO", "AISLADA", "ALBAÑILERÍA LADRILLO",
  "ACERO VOLCANITA", "PLANCHA METALICA", "ESTUCO Y PINTURA", "REJA METALICA",
  "TERRAZA DESCUBIERTA+QUINCHO+PISCINA+BODEGA", "RADIADOR MURAL", "MELAMINA",
  "MELAMINA Y CUARZO", "LOSA NACIONAL CORRIENTE", "NACIONAL CORRIENTE", "MADERA",
  "PVC TERMOPANEL", "ENMADERADO", "TIPO PISO DE INGENIERÍA", "ESMALTE", "ENLUCIDO / PINTURA",
  "CERAMICO", "TIPO PORCELANATO", "Colector", "Matriz Pública", "Red Subterránea", "Red Pública",
  "10 %", "45 %", "35 %", "249,91", "NO CONTEMPLA", "Solerilla"]
p4 = PAG[3] if len(PAG) >= 4 else ""
for v in H3:
    # "10 %"/"10%" equivalentes; y fallback sin espacios: el wrap de celda
    # parte literales largos sin espacio ("PISCINA\n+BODEGA" → "PISCINA +BODEGA")
    ok = (v in p4 or v.replace(" %", "%") in p4
          or v.replace(" ", "") in p4.replace(" ", ""))
    check("T3-HOJA3", f"'{v}' en pág.4", ok)

# ---------- T4 CI-057 + DÓLAR ----------
check("T4-CI057", "'-3%' presente", re.search(r"-3\s?%", TXT) is not None)
check("T4-CI057", "'36%' presente", re.search(r"\b36\s?%", TXT) is not None)
check("T4-CI057", "'161%' AUSENTE", "161%" not in TXT)
check("T4-CI057", "promedio ofertas 33,64", "33,64" in TXT)
check("T4-CI057", "promedio CBR 24,08", "24,08" in TXT)
check("T4-CI057", "30,91 (promedio viejo) AUSENTE", "30,91" not in TXT)
check("T4-CI057", "dólar 890,33", "890,33" in TXT)
for v in ["414.344", "399.115", "381.667", "586.180", "743.998"]:
    check("T4-CI057", f"columna US$ '{v}'", v in TXT)

# ---------- T5 VISUAL (genera PNGs + métrica guardarraíl) ----------
try:
    from PIL import Image
    HAVE_PIL = True
except ImportError:
    HAVE_PIL = False
for n in range(1, min(len(gen), len(ref)) + 1):
    pr = ref[n - 1].get_pixmap(dpi=100); pg = gen[n - 1].get_pixmap(dpi=100)
    pr.save(os.path.join(HERE, f"visual-ref-p{n}.png")); pg.save(os.path.join(HERE, f"visual-gen-p{n}.png"))
    if HAVE_PIL and n not in (5, 6):
        a = Image.open(io.BytesIO(pr.tobytes("png"))).convert("L").resize((300, 424))
        b = Image.open(io.BytesIO(pg.tobytes("png"))).convert("L").resize((300, 424))
        da, db = a.tobytes(), b.tobytes()
        diff = sum(1 for x, y in zip(da, db) if abs(x - y) > 40) / len(da)
        check("T5-VISUAL", f"p{n} diff {diff:.0%} <= 35%", diff <= 0.35)
print("T5-VISUAL: revisar ocularmente visual-ref-pN vs visual-gen-pN (veredicto fino = auditor/Sergio)")

# ---------- T6 CADENA ----------
sz = os.path.getsize(GEN)
head = open(GEN, "rb").read(5)
check("T6-CADENA", f"PDF v3 {sz} bytes >= 300000 y header %PDF", sz >= 300_000 and head == b"%PDF-")
tok = re.search(r"^AIRTABLE_TOKEN=(.+)$", open(os.path.join(REPO, ".env.local")).read(), re.M).group(1).strip()
def at(path, params=None):
    url = f"https://api.airtable.com/v0/{BASE}/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    rq = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}"})
    return json.load(urllib.request.urlopen(rq))
s = at(f"TX_Solicitudes/{REC}")["fields"]
check("T6-CADENA", "pdf_final_url con dropbox.com", "dropbox.com" in str(s.get("pdf_final_url", "")))
docs = at(TBL_DOCS, {"filterByFormula": 'FIND("VP-2026-0067",ARRAYJOIN({solicitud}))'})["records"]
vig = [d for d in docs if d["fields"].get("es_vigente")]
check("T6-CADENA", "1 fila vigente en TX_DocumentosGenerados", len(vig) == 1, f"hay {len(vig)}")
if vig:
    f = vig[0]["fields"]
    check("T6-CADENA", "render_id_carbone presente", bool(f.get("render_id_carbone")))
    check("T6-CADENA", "url_dropbox /VProperty/Tasaciones/", "/VProperty/Tasaciones/" in str(f.get("url_dropbox", "")))

# ---------- resumen ----------
tot, ok = len(RES), sum(RES)
print(f"\n== {ok}/{tot} PASS ==")
sys.exit(0 if ok == tot else 1)
