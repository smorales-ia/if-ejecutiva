"""Cliente REST mínimo de Airtable (fallback RO-30: conector MCP sin autorizar).
Lee AIRTABLE_TOKEN de .env.local del repo (ruta como argv o cwd)."""
import json, os, sys, time, urllib.request, urllib.parse

BASE = 'app9G7lLkIV3CpeLa'
REPO = r'C:\Users\Sergio\Documents\GitHub\if-ejecutiva'


def token():
    with open(os.path.join(REPO, '.env.local'), encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('AIRTABLE_TOKEN='):
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise SystemExit('sin AIRTABLE_TOKEN')


TOK = token()


def req(method, url, body=None):
    data = json.dumps(body).encode('utf-8') if body is not None else None
    r = urllib.request.Request(url, data=data, method=method, headers={
        'Authorization': f'Bearer {TOK}',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 vproperty-saneo',
    })
    for intento in range(5):
        try:
            with urllib.request.urlopen(r, timeout=60) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2 + intento)
                continue
            raise SystemExit(f'HTTP {e.code}: {e.read().decode("utf-8", "replace")}')
    raise SystemExit('429 persistente')


def list_all(table, fields=None, cell_format=None):
    out, offset = [], None
    while True:
        q = [('pageSize', '100')]
        if fields:
            q += [('fields[]', f) for f in fields]
        if cell_format:
            q += [('cellFormat', cell_format), ('timeZone', 'America/Santiago'), ('userLocale', 'es-CL')]
        if offset:
            q.append(('offset', offset))
        d = req('GET', f'https://api.airtable.com/v0/{BASE}/{table}?' + urllib.parse.urlencode(q))
        out += d['records']
        offset = d.get('offset')
        if not offset:
            return out
        time.sleep(0.22)


def schema():
    return req('GET', f'https://api.airtable.com/v0/meta/bases/{BASE}/tables')
