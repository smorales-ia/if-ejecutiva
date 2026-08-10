import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

/**
 * Configuración mínima de vitest. Su única razón de existir es el alias `@/`
 * que declara `tsconfig.json` en `compilerOptions.paths`: sin él, cualquier test
 * que alcance un módulo de `lib/` que importe con `@/lib/...` falla con
 * `Cannot find package '@/lib/…'`. Los tres tests previos del repo no lo
 * necesitaban porque sólo importaban módulos hoja con rutas relativas.
 *
 * No agrega dependencias: `vitest` ya estaba en `devDependencies`.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
