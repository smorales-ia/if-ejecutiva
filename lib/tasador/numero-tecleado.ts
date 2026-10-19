/**
 * Normaliza lo que el tasador escribe en un campo numérico del formulario.
 *
 * Pedido de Sergio, 19-oct-2026: los campos numéricos de la UI del tasador ya
 * no usan `<input type="number">`, cuyas flechas y la rueda del mouse cambiaban
 * el valor sin que el tasador lo notara (una «Bodegas» en -5, una servidumbre
 * corrida en 1 m²). Ahora son texto, y esta función deja el valor en la forma
 * que el servidor espera (`Number(v)` en `numeroDeInput`): dígitos y, si
 * corresponde, un punto decimal y un signo menos inicial.
 *
 * Separadores, como se escriben en Chile:
 * - **Entero**: todo lo que no es dígito se descarta, así que «3.300.000» → «3300000».
 * - **Decimal con coma**: la coma es el decimal y los puntos son de miles,
 *   «3.622,51» → «3622.51». Funciona también tecleando: «3.622» y luego «,»
 *   reinterpreta el punto como de miles.
 * - **Decimal sin coma**: el primer punto es el decimal, «3622.51» se respeta.
 */
export function normalizarNumeroTecleado(
  texto: string,
  { entero = false, negativo = false }: { entero?: boolean; negativo?: boolean } = {},
): string {
  const crudo = texto.trim()
  const signo = negativo && crudo.startsWith('-') ? '-' : ''

  if (entero) return signo + crudo.replace(/\D/g, '')

  let t = crudo
  if (t.includes(',')) t = t.replace(/\./g, '').replace(/,/g, '.')
  t = t.replace(/[^\d.]/g, '')

  const punto = t.indexOf('.')
  if (punto !== -1) t = t.slice(0, punto + 1) + t.slice(punto + 1).replace(/\./g, '')

  return signo + t
}
