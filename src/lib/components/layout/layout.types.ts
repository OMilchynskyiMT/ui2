export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch'
export type InlineLayoutAlign = LayoutAlign | 'baseline'
export type LayoutJustify = 'start' | 'center' | 'end' | 'between'

export const resolveLayoutJustify = (value: LayoutJustify): string => (value === 'between' ? 'space-between' : value)
