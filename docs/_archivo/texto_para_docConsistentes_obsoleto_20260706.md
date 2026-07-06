<!--
  ARCHIVO HISTÓRICO · Movido a docs/_archivo/ el 2026-07-06
  Origen: "texto_para_docConsistentes.txt" (raíz del repo)
  Razón: prompt de trabajo que originó la sesión de auditoría (AUDITORIA_ALINEAMIENTO_v1_2.md).
         No es un artefacto documental del proyecto — es el input de sesión del
         "Paso 4" del flujo de alineamiento de documentación. Conservado como registro histórico.
  El resultado de ejecutar este prompt es docs/AUDITORIA_ALINEAMIENTO_v1_2.md y todos los
  documentos v1.2 en docs/. Plan v1.2 prevalece.
-->

# Prompt original — Alineamiento de documentación (originó este ciclo de trabajo)

Paso 1 — Sube el plan al repo
Guarda el archivo como docs/PLAN_IMPLEMENTACION_IF02_v1_2.md en tu carpeta local del proyecto (/mnt/c/Users/Sergio/Documents/GitHub/if-ejecutiva).

Paso 2 — Abre Claude Code y pega este primer prompt (auditoría, no cambia nada)
Actúa como un panel de: Arquitecto Enterprise, Redactor Técnico y QA Lead.

Objetivo: AUDITAR la consistencia del repositorio contra el plan
en docs/PLAN_IMPLEMENTACION_IF02_v1_2.md (v1.2).

Reglas estrictas de esta sesión:
1. SOLO LECTURA. No modifiques ningún archivo. No ejecutes builds ni instalaciones.
2. No toques /app, /components, /lib, /pages ni ningún archivo .ts/.tsx/.js/.jsx.
3. Recorre: README.md, /docs, /public/docs si existe, CHANGELOG, .env.example,
   package.json (solo lectura de nombres/scripts), y cualquier .md del repo.

Entregable único: un archivo nuevo en docs/AUDITORIA_ALINEAMIENTO_v1_2.md
que contenga una tabla con:
- Archivo revisado
- Estado (Alineado / Desalineado / Faltante / Obsoleto)
- Discrepancia concreta contra el plan v1.2
- Acción propuesta (Actualizar / Crear / Marcar como histórico / Eliminar)

Al final del reporte, lista los archivos de código que NO tocaste
(para confirmar que el software quedó intacto).

No hagas nada más. Espera mi aprobación antes de aplicar cambios.

Paso 3 — Revisa el reporte
Abre docs/AUDITORIA_ALINEAMIENTO_v1_2.md. Si algo no te calza, se lo dices antes de seguir.

Paso 4 — Pega este segundo prompt (aplica cambios, solo en documentación)
Actúa como el mismo panel.

Objetivo: aplicar las acciones aprobadas en docs/AUDITORIA_ALINEAMIENTO_v1_2.md
para dejar TODA la documentación del repo íntegramente alineada al plan v1.2.

Reglas innegociables:
1. NO tocar código: nada en /app, /components, /lib, /pages, /api,
   ni archivos .ts, .tsx, .js, .jsx, .css.
   Si crees que un cambio requiere tocar código, DETENTE y pregúntame.
2. Solo modificar archivos de documentación: README.md, /docs/**, CHANGELOG,
   .env.example (solo agregar variables faltantes con valor vacío y comentario;
    nunca borrar variables existentes).
3. Cuando un archivo cambie, entregar la versión NUEVA COMPLETA, no una adenda.
4. No renumerar IDs existentes (RF-XX, RN-XX, AT##, SC##, D-XX, C-XX, BQ-X).
5. Idioma: español. Terminología: la del plan v1.2 (SC13 fuera de alcance,
   SC07 promovido a RF-09, ruta /consola, HMAC-SHA256, etc.).
6. Los documentos fuente en /docs de VProperty
   (Especificación v1.4, Arquitectura v2.6, Capa de Datos v2.6.2,
   Blueprint v2.7, Motor de Cálculo v2.5) NO se editan. Si están
   desalineados, crear docs/NOTAS_DIVERGENCIA_v1_2.md indicando la
   diferencia y que el plan v1.2 prevalece para IF-02.
7. Si un archivo queda obsoleto, moverlo a docs/_archivo/ con sufijo
   _obsoleto_YYYYMMDD.md; nunca borrar.

Al terminar:
- Genera docs/CHANGELOG_DOC_v1_2.md listando cada archivo tocado y por qué.
- Confirma con un `git status` que no hay archivos de código modificados.
- No hagas commit ni push. Yo los hago desde GitHub Desktop.

Paso 5 — Confirma que el código no fue tocado
Antes de pushear, en GitHub Desktop mira la pestaña Changes: solo deberían aparecer archivos dentro de /docs, README.md, CHANGELOG o .env.example. Si aparece cualquier .ts o .tsx, no aceptes ese cambio y me avisas.
