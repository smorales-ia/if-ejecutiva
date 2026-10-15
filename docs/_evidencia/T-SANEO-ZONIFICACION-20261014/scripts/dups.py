"""Sólo lectura: estado actual de los duplicados y de quién depende de ellos."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import at
B = f'https://api.airtable.com/v0/{at.BASE}'
OUT = sys.argv[1]
snap = {}
for t, rid in [('tblyggAfQfq682XHK', 'recNgsqC5V7Ayeg3M'), ('tblyggAfQfq682XHK', 'recKT9mUJkeq3YuBu'),
               ('tblyggAfQfq682XHK', 'recejBIZUOI1NQepO'), ('tblyggAfQfq682XHK', 'recX1OpI66nVAjbPy'),
               ('tbltr5VN2NGuTtbc1', 'recMlkFlMhbG6yWVy')]:
    r = at.req('GET', f'{B}/{t}/{rid}')
    snap[rid] = r
    print(rid, {k: (v if not isinstance(v, list) else v) for k, v in r['fields'].items() if k not in ('TX_Comparables',)})
    print()
# tasadores de Nunoa
for tid in snap['recejBIZUOI1NQepO']['fields'].get('M_Tasadores', []):
    t = at.req('GET', f'{B}/tblEi5jp18c1j00bQ/{tid}')
    print('tasador de Nunoa', tid, t['fields'].get('nombre') or t['fields'].get('nombre_completo'), '· en Ñuñoa:', tid in snap['recX1OpI66nVAjbPy']['fields'].get('M_Tasadores', []))
json.dump(snap, open(os.path.join(OUT, 'duplicados-antes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
