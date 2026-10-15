"""Aprobado por Sergio en el chat (15-oct-2026): en M_Tasadores rec7Pwbf7vPAIm8lO (Juan Perez Gonzalez)
reemplazar Nunoa (recejBIZUOI1NQepO) por Ñuñoa (recX1OpI66nVAjbPy) en zonas_cobertura. Un solo registro."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import at
URL = f'https://api.airtable.com/v0/{at.BASE}/tblEi5jp18c1j00bQ/rec7Pwbf7vPAIm8lO'
NUNOA, NUNOA_OK = 'recejBIZUOI1NQepO', 'recX1OpI66nVAjbPy'
antes = at.req('GET', URL)['fields'].get('zonas_cobertura', [])
assert NUNOA in antes, antes
nueva = [NUNOA_OK if x == NUNOA else x for x in antes]
nueva = list(dict.fromkeys(nueva))
d = at.req('PATCH', URL, {'fields': {'zonas_cobertura': nueva}})
res = {'antes': antes, 'despues': d['fields'].get('zonas_cobertura')}
json.dump(res, open(os.path.join(sys.argv[1], 'cobertura-juan-perez.json'), 'w', encoding='utf-8'), indent=1)
print(res)
