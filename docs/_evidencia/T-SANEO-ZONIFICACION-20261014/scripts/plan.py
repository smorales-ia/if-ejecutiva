"""Genera plan-escrituras.json (sólo lectura del respaldo local; no escribe en Airtable).

Grupos:
  A  prefijo de clave_zona = nombre de M_Comunas (sin distinguir mayúsculas ni tildes) -> Link
  B  variante ortográfica de la comuna (Coihaique, Llaillay) -> Link
  C  localidad dentro de una comuna (Ventanas, Maitencillo, Horcón, Dichato…) -> sin Link (propuesta)
  D  no es comuna ni localidad inequívoca (Limari, Cachapoal, Lagunillas) -> sin Link
  H  encabezado del CSV -> no se toca (borrado manual de Sergio)
  X  Colina-Rural (ya enlazada, sin zona) -> no se toca
"""
import json, os, sys, unicodedata
from collections import Counter, defaultdict

D = sys.argv[1]
zon = json.load(open(os.path.join(D, 'M_Zonificacion-antes.json'), encoding='utf-8'))
com = json.load(open(os.path.join(D, 'M_Comunas-antes.json'), encoding='utf-8'))
COLINA = 'recKT9mUJkeq3YuBu'          # la Colina con tasadores, comparables y región
COLINA_DUP = 'recNgsqC5V7Ayeg3M'      # fila vacía (sólo nombre + autonumber)
NUNOA_DUP = 'recejBIZUOI1NQepO'       # «Nunoa» sin tilde; el prefijo usa «Ñuñoa»

GRUPO_B = {'coihaique': 'Coyhaique', 'llaillay': 'Llay-Llay'}
GRUPO_C = {'ventanas': 'Puchuncaví', 'maitencillo': 'Puchuncaví', 'horcon': 'Puchuncaví',
           'dichato': 'Tomé', 'malloco': 'Peñaflor', 'alto jahuel': 'Buin', 'linderos': 'Buin',
           'champa': 'Paine', 'ensenada': 'Puerto Varas', 'monte': 'El Monte'}
GRUPO_D = {'limari', 'cachapoal', 'lagunillas'}


def norm(s):
    s = ' '.join((s or '').replace('﻿', '').split())  # split() también corta U+00A0
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode()
    return ' '.join(s.lower().split())


por_norm = defaultdict(list)
for c in com:
    if c['id'] in (COLINA_DUP, NUNOA_DUP):
        continue
    por_norm[norm(c['fields'].get('nombre'))].append(c)
assert all(len(v) == 1 for v in por_norm.values()), {k: len(v) for k, v in por_norm.items() if len(v) > 1}
nombre_de = {c['id']: c['fields'].get('nombre') for c in com}

filas, cuenta, como_cuenta = [], Counter(), Counter()
for r in zon:
    f = r['fields']
    clave, zona = f.get('clave_zona') or '', f.get('zona') or ''
    base = {'id': r['id'], 'clave_zona': clave, 'zona': zona}
    if '﻿' in (f.get('clave_natural') or '') or '﻿' in clave:
        filas.append({**base, 'grupo': 'H'}); cuenta['H'] += 1; continue
    if not zona:
        filas.append({**base, 'grupo': 'X'}); cuenta['X'] += 1; continue
    assert clave.lower().endswith(zona.lower()), r['id']
    pref = clave[: len(clave) - len(zona)].strip()
    k = norm(pref)
    if k in por_norm:
        c = por_norm[k][0]
        n = c['fields']['nombre']
        como_cuenta['identico' if pref == n else ('mayusculas' if pref.lower() == n.lower() else
                    ('espacios' if ' '.join(pref.split()).lower() == n.lower() else 'tildes'))] += 1
        filas.append({**base, 'prefijo': pref, 'grupo': 'A', 'comuna_id': c['id'], 'comuna': n})
    elif k in GRUPO_B:
        c = por_norm[norm(GRUPO_B[k])][0]
        filas.append({**base, 'prefijo': pref, 'grupo': 'B', 'comuna_id': c['id'], 'comuna': c['fields']['nombre']})
    elif k in GRUPO_C:
        c = por_norm[norm(GRUPO_C[k])][0]
        filas.append({**base, 'prefijo': pref, 'grupo': 'C', 'comuna_propuesta_id': c['id'], 'comuna_propuesta': c['fields']['nombre']})
    elif k in GRUPO_D:
        filas.append({**base, 'prefijo': pref, 'grupo': 'D'})
    else:
        raise SystemExit(f'prefijo sin clasificar: {pref!r} ({r["id"]})')
    cuenta[filas[-1]['grupo']] += 1

assert sum(cuenta.values()) == len(zon)
json.dump({'generado_desde': 'M_Zonificacion-antes.json', 'resumen': cuenta, 'filas': filas},
          open(os.path.join(D, 'plan-escrituras.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('por grupo', dict(cuenta), '· grupo A por tipo de coincidencia', dict(como_cuenta))
for g in 'ABCD':
    pc = Counter((x.get('prefijo'), x.get('comuna') or x.get('comuna_propuesta')) for x in filas if x['grupo'] == g)
    print(g, 'prefijos', len(pc), 'filas', sum(pc.values()))
    if g != 'A':
        for (p, cm), n in pc.most_common():
            print('   ', p, '->', cm, n)
print('A, coincidencias no idénticas:', sorted({(x['prefijo'], x['comuna']) for x in filas if x['grupo'] == 'A' and x['prefijo'] != x['comuna']}))
print('A comunas distintas:', len({x['comuna_id'] for x in filas if x['grupo'] == 'A'}), '· Colina filas', sum(1 for x in filas if x.get('comuna_id') == COLINA))
