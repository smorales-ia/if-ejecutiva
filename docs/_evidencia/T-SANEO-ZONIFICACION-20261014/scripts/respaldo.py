"""Respaldo previo (sólo lectura): M_Zonificacion completa, M_Comunas y schema de ambas."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import at

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

sch = at.schema()
tablas = {t['id']: t for t in sch['tables']}
keep = {k: tablas[k] for k in ('tbltr5VN2NGuTtbc1', 'tblyggAfQfq682XHK')}
json.dump(keep, open(os.path.join(OUT, 'schema-antes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

zon = at.list_all('tbltr5VN2NGuTtbc1')
json.dump(zon, open(os.path.join(OUT, 'M_Zonificacion-antes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
com = at.list_all('tblyggAfQfq682XHK')
json.dump(com, open(os.path.join(OUT, 'M_Comunas-antes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('zonificacion', len(zon), 'comunas', len(com))
for tid, t in keep.items():
    print('==', t['name'])
    for f in t['fields']:
        print(' ', f['id'], f['name'], f['type'], json.dumps(f.get('options', {}), ensure_ascii=False)[:160])
