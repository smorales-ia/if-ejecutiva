"""Sólo lectura: baja M_Zonificacion-despues.json y lo contrasta con plan-escrituras.json."""
import json, os, sys
from collections import Counter
sys.path.insert(0, os.path.dirname(__file__))
import at
D = sys.argv[1]
plan = {f['id']: f for f in json.load(open(os.path.join(D, 'plan-escrituras.json'), encoding='utf-8'))['filas']}
antes = {r['id']: r['fields'] for r in json.load(open(os.path.join(D, 'M_Zonificacion-antes.json'), encoding='utf-8'))}
ahora = at.list_all('tbltr5VN2NGuTtbc1')
json.dump(ahora, open(os.path.join(D, 'M_Zonificacion-despues.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
c = Counter()
errores = []
for r in ahora:
    f, p = r['fields'], plan.get(r['id'])
    if p is None:
        errores.append(('fila nueva', r['id'])); continue
    link = f.get('comuna') or []
    g = p['grupo']
    if g in 'AB':
        c['AB_ok' if link == [p['comuna_id']] else 'AB_mal'] += 1
        if link != [p['comuna_id']]: errores.append(('link', r['id'], link, p['comuna_id']))
    elif g == 'X':
        c['X_igual' if link == (antes[r['id']].get('comuna') or []) else 'X_cambio'] += 1
    else:
        c[f'{g}_sin_link' if not link else f'{g}_con_link'] += 1
    act = bool(f.get('activo'))
    c[f'activo_{g}_{act}'] += 1
    otros = {k for k in set(f) | set(antes[r['id']]) if k not in ('comuna', 'activo', 'ultima_modificacion', 'zona_compuesta') and f.get(k) != antes[r['id']].get(k)}
    if otros: errores.append(('otros campos cambiaron', r['id'], sorted(otros)))
print('filas', len(ahora), dict(sorted(c.items())))
print('errores', len(errores), errores[:10])
print('aplicar-log existe:', os.path.exists(os.path.join(D, 'aplicar-log.json')))
