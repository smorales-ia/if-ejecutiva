"""Sólo lectura: los tres registros a borrar no deben tener Links."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import at
B = f'https://api.airtable.com/v0/{at.BASE}'
for t, rid in [('tblyggAfQfq682XHK', 'recejBIZUOI1NQepO'), ('tblyggAfQfq682XHK', 'recNgsqC5V7Ayeg3M'), ('tbltr5VN2NGuTtbc1', 'recMlkFlMhbG6yWVy')]:
    try:
        f = at.req('GET', f'{B}/{t}/{rid}')['fields']
    except SystemExit as e:
        print(rid, 'no existe (¿ya borrado?)', e); continue
    links = {k: v for k, v in f.items() if isinstance(v, list) and v and str(v[0]).startswith('rec')}
    print(rid, f.get('nombre') or f.get('clave_zona'), '· links:', links or 'ninguno')
