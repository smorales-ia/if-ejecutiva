"""Sólo lectura: conteos tras el borrado y búsqueda de referencias a los ids borrados."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import at
BORR = {'recMlkFlMhbG6yWVy', 'recNgsqC5V7Ayeg3M', 'recejBIZUOI1NQepO'}
for t, n in [('tbltr5VN2NGuTtbc1', 'M_Zonificacion'), ('tblyggAfQfq682XHK', 'M_Comunas'), ('tblEi5jp18c1j00bQ', 'M_Tasadores')]:
    rs = at.list_all(t)
    refs = [(r['id'], k) for r in rs for k, v in r['fields'].items() if isinstance(v, list) and BORR & set(map(str, v))]
    print(n, len(rs), 'filas · ids borrados presentes:', BORR & {r['id'] for r in rs} or 'ninguno', '· referencias:', refs or 'ninguna')
    if n == 'M_Comunas':
        from collections import Counter
        c = Counter(r['fields'].get('nombre', '').lower() for r in rs)
        print('  nombres repetidos:', {k: v for k, v in c.items() if v > 1} or 'ninguno')
