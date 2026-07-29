# SC13 — correo de asignación al tasador: NO implementado

> Tanda de cierre · 29-jul-2026 · decisión explícita, no un olvido

## Estado

El flujo **Asignar Tasador** quedó operativo end-to-end (Regla A): picker real
contra `M_Tasadores`, `POST /api/solicitudes/[id]/asignar` firmado con HMAC,
SC-Asignar escribiendo en Airtable. **Lo que no ocurre es el envío del correo al
tasador.**

Está fuera de alcance por dos motivos que se refuerzan:

1. `CLAUDE.md` marca **SC13 como fuera de alcance de CU-002** ("las acciones de
   reasignación, cambio de prioridad y pausa actualizan Airtable + `A_Eventos`
   pero **no envían email** en este CU").
2. Implementarlo toca el blueprint de Make con un módulo de correo y una
   plantilla, que es trabajo de una tanda propia.

## Qué hay hoy en la UI, y por qué puede confundir

`components/console/solicitud-detail.tsx` tiene una **vista previa simulada** del
correo (`mockEmailAsignacion`) y un estado `estadoCorreo` que pasa a `"enviado"`
al confirmar la asignación. Es de la maqueta v0: **nada de eso manda un correo**.

Riesgo concreto: tras asignar, la pantalla dice "Correo de asignación enviado al
tasador" y el tasador no recibe nada. Si alguien hace smoke test de la
asignación, va a dar por bueno un envío que no existe.

**Pendiente menor recomendado antes de que esto llegue a usuarios reales**:
cambiar ese literal por algo que no afirme el envío (p. ej. "Vista previa del
correo — envío pendiente de habilitar"), o esconder el bloque tras un flag. Es un
cambio de una línea y evita una promesa falsa en producción.

## Qué haría falta para cerrarlo

1. Módulo de correo en `SC-Asignar` (o un escenario SC13 aparte) tras el
   `Update` del tasador.
2. Plantilla del correo: asunto `Nueva asignación {codigo_solicitud}` y cuerpo
   con dirección, comuna, contactos de visita y fecha programada. El
   `mockEmailAsignacion` de la maqueta sirve de borrador de contenido.
3. Destinatario: `M_Tasadores.email` (`fldsUu1pJ92HdYQUD`), ya disponible en el
   payload del picker.
4. Registrar el envío en `TX_Notificaciones` (`tbldgLQgjdgsOSZnt`) y
   `A_Eventos`, para que `estadoCorreo` refleje algo real y no un optimismo del
   cliente ([[E-082]]).
5. Recién entonces, cablear `estadoCorreo` a ese dato.
