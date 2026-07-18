/** Formats the backend's string-typed property price (kept as a string on
 * the wire for currency precision) as a PHP display value. */
export function formatPrice(price: string) {
  const value = Number(price)
  if (Number.isNaN(value)) return price
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value)
}
