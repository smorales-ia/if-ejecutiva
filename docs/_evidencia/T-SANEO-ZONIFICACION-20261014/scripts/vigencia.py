"""Compara el estado actual (sólo lectura) contra M_Zonificacion-antes.json y M_Comunas-antes.json."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import at
D = sys.argv[1]
for tabla, arch in (('tbltr5VN2NGuTtbc1', 'M_Zonificacion-antes.json'), ('tblyggAfQfq682XHK', 'M_Comunas-antes.json')):
    antes = {r['id']: r['fields'] for r in json.load(open(os.path.join(D, arch), encoding='utf-8'))}
    ahora = {r['id']: r['fields'] for r in at.list_all(tabla)}
    nuevos = set(ahora) - set(antes)
    borrados = set(antes) - set(ahora)
    cambiados = []
    for k in set(antes) & set(ahora):
        a = {x: y for x, y in antes[k].items() if x != 'ultima_modificacion'}
        b = {x: y for x, y in ahora[k].items() if x != 'ultima_modificacion'}
        if a != b:
            cambiados.append((k, sorted(set(a) ^ set(b)) + sorted(x for x in set(a) & set(b) if a[x] != b[x])))
    print(arch, 'filas', len(antes), '->', len(ahora), '· nuevos', sorted(nuevos), '· borrados', sorted(borrados), '· cambiados', cambiados[:20], len(cambiados))
