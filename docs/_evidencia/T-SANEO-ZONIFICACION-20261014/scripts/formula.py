"""Sólo lectura: cuenta filas que devuelve la fórmula vieja y la nueva por comuna."""
import os, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
import at


def lit(s):
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def vieja(c):
    return f'AND({{zona}}!="",LOWER({{clave_zona}})=LOWER({lit(c)}&{{zona}}))'


def nueva(c):
    l = lit(c)
    return f'AND({{zona}}!="",OR(LOWER(ARRAYJOIN({{comuna}}))=LOWER({l}),LOWER({{clave_zona}})=LOWER({l}&{{zona}})))'


def contar(formula):
    n, off = 0, None
    while True:
        q = [('pageSize', '100'), ('fields[]', 'zona'), ('filterByFormula', formula)]
        if off:
            q.append(('offset', off))
        d = at.req('GET', f'https://api.airtable.com/v0/{at.BASE}/tbltr5VN2NGuTtbc1?' + urllib.parse.urlencode(q))
        n += len(d['records'])
        off = d.get('offset')
        if not off:
            return n

for c in sys.argv[1:]:
    print(f'{c}: vieja {contar(vieja(c))} · nueva {contar(nueva(c))}')
