export type ComponentTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger'
export type FeedbackTone = Exclude<ComponentTone, 'primary'>
