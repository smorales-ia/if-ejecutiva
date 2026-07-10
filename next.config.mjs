/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
