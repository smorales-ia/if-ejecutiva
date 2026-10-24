"""Verifica que las rutas de las etiquetas {d.…} de una plantilla existan en un contexto JSON.
Una ruta cuyo arreglo tiene menos elementos (i=n fuera de rango) se informa aparte (es válido: fila vacía)."""
import json, re, sys, zipfile
x = zipfile.ZipFile(sys.argv[1]).read("word/document.xml").decode("utf-8")
ctx = json.load(open(sys.argv[2], encoding="utf-8"))
texto = "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", x)) + " ".join(re.findall(r'descr="([^"]*)"', x))
rutas = sorted(set(m.split(":")[0] for m in re.findall(r"\{d\.([^}]*)\}", texto)))
faltan, fuera = [], []


def resolver(obj, partes):
    for p in partes:
        m = re.fullmatch(r"(\w+)(?:\[(.*)\])?", p)
        nombre, filtro = m.group(1), m.group(2)
        if not isinstance(obj, dict) or nombre not in obj:
            return "falta"
        obj = obj[nombre]
        if filtro is not None:
            if not isinstance(obj, list):
                return "falta"
            mi = re.fullmatch(r"i=(\d+)", filtro)
            if mi:
                i = int(mi.group(1))
                if i >= len(obj):
                    return "fuera"
                obj = obj[i]
            else:
                conds = dict(re.findall(r"(\w+)='([^']*)'", filtro))
                cand = [e for e in obj if all(str(e.get(k)) == v for k, v in conds.items())]
                if not cand:
                    return "fuera"
                obj = cand[0]
    return "ok"


for r in rutas:
    est = resolver(ctx, re.findall(r"\w+(?:\[[^\]]*\])?", r))
    if est == "falta":
        faltan.append(r)
    elif est == "fuera":
        fuera.append(r)
print("rutas distintas", len(rutas), "· inexistentes", len(faltan), "· fila vacía en este caso", len(fuera))
for r in faltan:
    print("  FALTA", r)
for r in fuera[:60]:
    print("  vacía", r)
