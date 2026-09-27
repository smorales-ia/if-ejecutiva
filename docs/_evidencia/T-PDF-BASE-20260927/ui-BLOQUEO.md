# ui.png — NOTA DE BLOQUEO (T7b)

No se pudo capturar screenshot en este entorno WSL: no hay browser instalado (chromium/chrome
ausentes, sin Playwright — `test:e2e` es script huérfano y la regla del repo prohíbe agregar
dependencias de testing). Además las rutas están protegidas por Clerk: una captura sin sesión
solo mostraría el sign-in.

Cobertura alternativa ejecutada (T7a, ver `tests-output.txt`): dev server levantado y smoke por
curl a `/tasaciones/recmMzeu3eWGxyXsf`, `/tasaciones/recmMzeu3eWGxyXsf/informe` y
`GET /api/tasaciones/recmMzeu3eWGxyXsf/informe-data` — criterio: 200 o redirect Clerk = verde;
500 = rojo.

Screenshot pendiente para Sergio (2 capturas, guardarlas en esta carpeta):
1. `http://localhost:3000/tasaciones/recmMzeu3eWGxyXsf/informe` — bloque 6 comparables, fila
   "Tasación v/s promedio de la muestra" (donde aterriza la desviación) + bloque 2 "Valor de tasación".
2. `http://localhost:3000/tasaciones/recmMzeu3eWGxyXsf/estado` — check verde "Informe listo"
   (la solicitud quedó en `calculada` tras la corrida real del motor).
