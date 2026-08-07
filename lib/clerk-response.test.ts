import { describe, expect, it } from 'vitest'

import { esRespuestaDeClerkSinSesion } from './clerk-response'

/** Construye una `Response` con el status HTTP y los headers de un caso real. */
function respuesta(
  status: number,
  headers: Record<string, string>,
  body = ''
): Response {
  return new Response(body, { status, headers })
}

/** 404 de HTML que emite `auth.protect()` al reescribir una petición sin sesión. */
function respuestaDeClerk(estado: string): Response {
  return respuesta(
    404,
    {
      'content-type': 'text/html; charset=utf-8',
      'x-clerk-auth-status': estado,
      'x-clerk-auth-reason': 'protect-rewrite',
    },
    '<!DOCTYPE html><html><body>404</body></html>'
  )
}

describe('esRespuestaDeClerkSinSesion · estados de Clerk', () => {
  it('signed-out → true', () => {
    expect(esRespuestaDeClerkSinSesion(respuestaDeClerk('signed-out'))).toBe(true)
  })

  it('handshake → true (token expirado, sesión no utilizable)', () => {
    expect(esRespuestaDeClerkSinSesion(respuestaDeClerk('handshake'))).toBe(true)
  })

  it('signed-in → false: pasó por Clerk y hay sesión', () => {
    // Un 404 con sesión activa es un 404 de verdad: la ruta o el registro no
    // existen, y el mensaje que corresponde es el genérico.
    expect(esRespuestaDeClerkSinSesion(respuestaDeClerk('signed-in'))).toBe(false)
  })

  it('un valor futuro desconocido cae del lado seguro', () => {
    // La condición está por negación, así que no hace falta enumerar los
    // estados inválidos: cualquier cosa que no sea `signed-in` lo es.
    expect(esRespuestaDeClerkSinSesion(respuestaDeClerk('needs-refresh'))).toBe(true)
  })
})

describe('esRespuestaDeClerkSinSesion · sin header Clerk', () => {
  it('404 de routing de Next.js con body HTML → false', () => {
    const res = respuesta(
      404,
      { 'content-type': 'text/html; charset=utf-8' },
      '<!DOCTYPE html><html><body>404</body></html>'
    )
    expect(esRespuestaDeClerkSinSesion(res)).toBe(false)
  })

  it('200 normal con JSON → false', () => {
    const res = respuesta(200, { 'content-type': 'application/json' }, '{"data":[]}')
    expect(esRespuestaDeClerkSinSesion(res)).toBe(false)
  })
})

describe('esRespuestaDeClerkSinSesion · regresiones', () => {
  /**
   * Regresión de la heurística vieja de content-type.
   *
   * `esRespuestaDeClerk` devolvía `true` para cualquier respuesta cuyo
   * `content-type` no fuera JSON. Eso marcaba como "sesión expirada" a los 404
   * de routing y a los 500 de Next.js —que también responden HTML—, y el sheet
   * pedía a la Ejecutiva recargar la página para arreglar un bug del servidor.
   */
  it('content-type HTML sin header Clerk nunca es Clerk, sea cual sea el status', () => {
    const html = { 'content-type': 'text/html; charset=utf-8' }
    for (const status of [404, 500, 200]) {
      expect(esRespuestaDeClerkSinSesion(respuesta(status, html, '<html></html>'))).toBe(
        false
      )
    }
  })

  /**
   * Regresión de la heurística vieja de content-type, en el sentido inverso.
   *
   * Un endpoint que responde JSON detrás de un middleware que ya invalidó la
   * sesión daba `false` con la heurística vieja —era JSON, luego "lo emitió la
   * app"— y el fallo de sesión se mostraba como error de datos. El header manda
   * sobre el `content-type` en las dos direcciones.
   */
  it('header signed-out con content-type JSON sí es Clerk', () => {
    const res = respuesta(
      401,
      { 'content-type': 'application/json', 'x-clerk-auth-status': 'signed-out' },
      '{"error":"unauthorized"}'
    )
    expect(esRespuestaDeClerkSinSesion(res)).toBe(true)
  })
})

describe('esRespuestaDeClerkSinSesion · normalización', () => {
  it('el nombre del header es case-insensitive', () => {
    // `Headers` normaliza las claves, pero el test fija la garantía: si algún
    // día se leyera el header de otra estructura, el contrato es el mismo.
    const res = respuesta(404, { 'X-Clerk-Auth-Status': 'signed-out' })
    expect(esRespuestaDeClerkSinSesion(res)).toBe(true)
  })

  it('el valor se normaliza con trim + lowercase antes de comparar', () => {
    // Sin normalizar, esto se leería como sesión inválida y mandaría a recargar
    // la página a alguien que sí tiene sesión.
    const res = respuesta(404, { 'x-clerk-auth-status': ' Signed-In ' })
    expect(esRespuestaDeClerkSinSesion(res)).toBe(false)
  })
})
