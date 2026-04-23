import type { LiteralValue } from '../schema/literal'

export function formatLiteral(value: LiteralValue): string {
  return typeof value === 'string' ? `"${value}"` : String(value)
}

export function formatLiteralList(values: readonly LiteralValue[]): string {
  return values.map(value => formatLiteral(value)).join(', ')
}
