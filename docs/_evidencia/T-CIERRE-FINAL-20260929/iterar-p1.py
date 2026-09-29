#!/usr/bin/env python3
"""Iteración local densidad vertical portada — AGENTE A T-CIERRE-FINAL-20260929.
Sube PLANTILLA_MET_v2.docx a Carbone (POST /template), renderiza con el contexto
real de la tanda previa, rasteriza la página 1 a 100 dpi y mide las bandas de
contenido vs visual-ref-p1.png. No toca Make ni Airtable. No imprime tokens."""
import io, json, os, re, sys, uuid, urllib.request

import numpy as np
import pymupdf
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
PREV = os.path.join(REPO, "docs/_evidencia/T-PDF-IDENTICO-20260927")
DOCX = os.path.join(REPO, "docs/_artefactos/carbone/PLANTILLA_MET_v2.docx")

env = {}
for line in open(os.path.join(REPO, ".env.local")):
    m = re.match(r"^([A-Z0-9_]+)=(.*)$", line.strip())
    if m:
        env[m.group(1)] = m.group(2).strip().strip('"')
URL = env["CARBONE_API_URL"].rstrip("/")
TOK = env["CARBONE_API_TOKEN_PROD"]
HDR = {"Authorization": f"Bearer {TOK}", "carbone-version": "4"}


def req(method, path, body=None, headers=None, raw=False):
    h = dict(HDR)
    if headers:
        h.update(headers)
    r = urllib.request.Request(URL + path, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(r, timeout=120) as resp:
            data = resp.read()
            return resp.status, data if raw else json.loads(data)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:400]


def subir_template():
    boundary = uuid.uuid4().hex
    payload = open(DOCX, "rb").read()
    body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"template\"; "
            f"filename=\"PLANTILLA_MET_v2.docx\"\r\nContent-Type: application/octet-stream\r\n\r\n"
            ).encode() + payload + f"\r\n--{boundary}--\r\n".encode()
    st, j = req("POST", "/template", body,
                {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    if st != 200 or not j.get("success"):
        sys.exit(f"POST /template fallo: {st} {str(j)[:300]}")
    return j["data"]["templateId"]


def render(tid):
    ctx = json.load(open(os.path.join(PREV, "contexto-real-v2.json")))
    body = json.dumps({"data": ctx, "convertTo": "pdf", "lang": "es-cl"}).encode()
    st, j = req("POST", f"/render/{tid}", body, {"Content-Type": "application/json"})
    if st != 200 or not j.get("success"):
        sys.exit(f"POST /render fallo: {st} {str(j)[:300]}")
    rid = j["data"]["renderId"]
    st, pdf = req("GET", f"/render/{rid}", raw=True)
    if st != 200:
        sys.exit(f"GET /render/{rid} fallo: {st}")
    return pdf


def bandas(png_path=None, pil_img=None):
    im = (Image.open(png_path) if png_path else pil_img).convert("L")
    a = np.asarray(im)
    h, w = a.shape
    rows = ((a < 200).sum(axis=1) / w) > 0.005
    out, start = [], None
    for i, r in enumerate(rows):
        if r and start is None:
            start = i
        if not r and start is not None:
            out.append([start, i - 1]); start = None
    if start is not None:
        out.append([start, h - 1])
    merged = []
    for b in out:
        if merged and b[0] - merged[-1][1] < 6:
            merged[-1][1] = b[1]
        else:
            merged.append(b)
    return h, merged


def main():
    tid = subir_template()
    print("templateId (iteracion):", tid)
    pdf = render(tid)
    out_pdf = os.path.join(HERE, "_iter-render.pdf")
    open(out_pdf, "wb").write(pdf)
    doc = pymupdf.open(out_pdf)
    print("paginas:", len(doc))
    pix = doc[0].get_pixmap(dpi=100)
    gen_png = os.path.join(HERE, "_iter-p1.png")
    pix.save(gen_png)
    hr, ref = bandas(os.path.join(PREV, "visual-ref-p1.png"))
    hg, gen = bandas(gen_png)
    print(f"ref {len(ref)} bandas / gen {len(gen)} bandas (alto ref {hr} gen {hg})")
    print("gen bandas (top% - bot%):")
    for b in gen:
        print(f"  {b[0]/hg*100:5.1f} - {b[1]/hg*100:5.1f}")
    # anclas: título, logo, ANTECEDENTES, ficha(top texto), pie
    def top(bs, h, idx):
        return bs[idx][0] / h * 100
    print("\nANCLAS ref-> ideal: titulo 6.3 logo(art) 23.2 antecedentes 54.4 pie 77.6")


if __name__ == "__main__":
    main()
