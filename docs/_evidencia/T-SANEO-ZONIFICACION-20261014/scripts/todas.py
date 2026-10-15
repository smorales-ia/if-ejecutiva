"""Sólo lectura local: para cada comuna, filas de la fórmula vieja vs la nueva sobre el estado después."""
import json, os, sys
D = sys.argv[1]
zon = json.load(open(os.path.join(D, 'M_Zonificacion-despues.json'), encoding='utf-8'))
com = json.load(open(os.path.join(D, 'M_Comunas-antes.json'), encoding='utf-8'))
nombre = {c['id']: c['fields'].get('nombre', '') for c in com}
cambios = {}
for n in sorted(set(nombre.values())):
    vieja = {r['id'] for r in zon if r['fields'].get('zona') and (r['fields'].get('clave_zona') or '').lower() == (n + r['fields']['zona']).lower()}
    link = {r['id'] for r in zon if r['fields'].get('zona') and ', '.join(nombre[i] for i in r['fields'].get('comuna', [])).lower() == n.lower()}
    nueva = vieja | link
    if nueva != vieja:
        cambios[n] = (len(vieja), len(nueva))
    if vieja - link:
        print('fila por clave sin Link a su comuna:', n, len(vieja - link))
print('comunas que cambian:', cambios)
