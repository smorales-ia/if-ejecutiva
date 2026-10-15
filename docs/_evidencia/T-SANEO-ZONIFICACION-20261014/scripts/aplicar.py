"""Aplica plan-escrituras.json a M_Zonificacion (ESCRIBE en producción: sólo con aprobación).

Uso: python aplicar.py <carpeta_evidencia> [--link-grupos AB] [--activo true|no]
  --link-grupos  grupos cuyo Link `comuna` se puebla (por defecto AB)
  --activo true  pone activo=true en A+B+C+D; `no` no toca activo
Sólo escribe filas cuyo Link actual está vacío (no pisa nada ya poblado).
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import at

D = sys.argv[1]
args = sys.argv[2:]
grupos_link = args[args.index('--link-grupos') + 1] if '--link-grupos' in args else 'AB'
activo = (args[args.index('--activo') + 1] if '--activo' in args else 'no') == 'true'

TABLA = 'tbltr5VN2NGuTtbc1'
F_COMUNA, F_ACTIVO = 'fldNcL5XUGoF7e7sM', 'fld4TkgjRhaeeni6Q'

plan = json.load(open(os.path.join(D, 'plan-escrituras.json'), encoding='utf-8'))
antes = {r['id']: r for r in json.load(open(os.path.join(D, 'M_Zonificacion-antes.json'), encoding='utf-8'))}

updates = []
for f in plan['filas']:
    campos = {}
    if f['grupo'] in grupos_link:
        cid = f.get('comuna_id') or f.get('comuna_propuesta_id')
        assert cid, f
        assert not antes[f['id']]['fields'].get('comuna'), f'{f["id"]} ya tiene Link'
        campos[F_COMUNA] = [cid]
    if activo and f['grupo'] in 'ABCD':
        campos[F_ACTIVO] = True
    if campos:
        updates.append({'id': f['id'], 'fields': campos})

print(f'filas a escribir: {len(updates)} (link {grupos_link}, activo={activo})')
log = []
for i in range(0, len(updates), 10):
    lote = updates[i:i + 10]
    d = at.req('PATCH', f'https://api.airtable.com/v0/{at.BASE}/{TABLA}', {'records': lote})
    log.append({'lote': i // 10, 'ids': [r['id'] for r in d['records']]})
    time.sleep(0.22)
    if (i // 10) % 20 == 0:
        print('  lote', i // 10, 'ok')
json.dump({'grupos_link': grupos_link, 'activo': activo, 'escritas': len(updates), 'lotes': log},
          open(os.path.join(D, 'aplicar-log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('listo', len(updates))
