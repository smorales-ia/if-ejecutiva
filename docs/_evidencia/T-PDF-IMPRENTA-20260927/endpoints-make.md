# Endpoints Make usados — T-PDF-IMPRENTA-20260927 (sin tokens)

Base: `https://eu1.make.com/api/v2` · auth `Authorization: Token <MAKE_API_TOKEN>` · team 1594725.

| Método | Endpoint | Uso | Status |
|---|---|---|---|
| GET | `/users/me` | identidad + validación token | 200 |
| GET | `/users/{userId}/user-team-roles` | descubrir teamId (organizationId da 403 con este token) | 200 |
| GET | `/scenarios?teamId=1594725&pg[limit]=100` | inventario + isActive | 200 |
| GET | `/scenarios/{id}/blueprint` | export E2 5750023 / E3 5791413 (rollback) | 200 |
| GET | `/scenarios/{id}/logs?pg[limit]=N` | corridas (E2/E3) | 200 |
| GET | `/scenarios/{id}/logs/{executionId}` | detalle del error de E3 run 1 (executionId SIN el prefijo timestamp del imtId) | 200 |
| POST | `/hooks` | crear `wh_SC-Textos` (3797464) y hook temporal del echo-test (borrado) | 200 |
| POST | `/scenarios` | crear SC-Textos v0.2 (7650070) y echo-test temporal (borrado) | 200 |
| PATCH | `/scenarios/{id}` | blueprint v2 de E2/E3 (blueprint como STRING en el body) | 200 |
| POST | `/scenarios/{id}/start` · `/stop` | activar/apagar E2, E3, SC-Textos | 200 |
| DELETE | `/scenarios/{id}` · `/hooks/{id}` | borrar el par temporal del echo-test | 200 |

Hallazgos de API útiles:
- El blueprint en POST/PATCH `/scenarios` va **stringificado** dentro de `blueprint`; `scheduling` también como string.
- Al interpolar una **colección** en un campo de texto de un módulo, Make la serializa como **JSON** (verificado empíricamente con un escenario echo webhook→respond) — por eso el body de E2 puede ser `{"data": {{1.contexto}}, …}` sin módulo intermedio.
- Módulo válido de share link Dropbox: `dropbox:createShareLink` (verificado por validación de blueprint); falló en runtime con `[401] missing_scope` porque la conexión 7553318 no tiene `sharing.write` → Gate de re-autorización.
- Tras un PATCH de blueprint el escenario queda detenido: hay que re-`/start`. Al re-encender, Make **reprocesa bundles incompletos** de la corrida fallida anterior (por eso hubo una fila DocGen duplicada, ya saneada).

Carbone (api.carbone.io, header `carbone-version: 4`, token PROD):
- POST `/template` (multipart) → templateId · DELETE `/template/{id}` (se borró el v1.0) · POST `/render/{templateId}` → renderId · GET `/render/{renderId}` → binario.
