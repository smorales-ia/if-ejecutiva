"""Pedido por Sergio en el chat (15-oct-2026, «hacelo tu»): borrar 3 registros basura sin Links.
Respaldo completo previo en duplicados-antes.json. Re-verifica que sigan sin Links antes de borrar."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import at
B = f'https://api.airtable.com/v0/{at.BASE}'
OBJ = [('tbltr5VN2NGuTtbc1', 'recMlkFlMhbG6yWVy'), ('tblyggAfQfq682XHK', 'recNgsqC5V7Ayeg3M'), ('tblyggAfQfq682XHK', 'recejBIZUOI1NQepO')]
log = []
for t, rid in OBJ:
    f = at.req('GET', f'{B}/{t}/{rid}')['fields']
    links = [k for k, v in f.items() if isinstance(v, list) and v and str(v[0]).startswith('rec')]
    assert not links, (rid, links)
    d = at.req('DELETE', f'{B}/{t}/{rid}')
    log.append(d)
    print(d)
json.dump(log, open(os.path.join(sys.argv[1], 'borrado-duplicados.json'), 'w', encoding='utf-8'), indent=1)
