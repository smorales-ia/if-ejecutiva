/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // ⚠ NO agregar `watchOptions.pollIntervalMs` acá. Probado el 11-ago-2026 con
  // 1000 ms para compensar que inotify no se propaga sobre /mnt/c (drvfs): el
  // sondeo recorre el árbol completo —`node_modules` incluido— sobre un
  // filesystem de Windows, el servidor se cuelga (HTTP 000 a los 25 s) y el log
  // se llena de `watch error … NotFound`. Next no expone patrón de exclusión
  // para esa opción, así que no hay forma de acotarlo. El HMR poco fiable se
  // maneja reiniciando el dev tras editar módulos de servidor; ver la entrada
  // 2026-08-11 (c) de docs/aprendizajes.md.
  images: {
    unoptimized: true,
  },
  experimental: {
    // middleware.ts protege /api/**, lo que fuerza a Next 16 a bufferear el
    // body antes del Route Handler (limite default 10MB). Un archivo de 7MB
    // en base64 pesa ~9.3MB de JSON -- sube el tope a 12MB para no truncar
    // en silencio (ver docs/aprendizajes.md, Fase Adjuntos 1).
    proxyClientMaxBodySize: '12mb',
  },
}

export default nextConfig
