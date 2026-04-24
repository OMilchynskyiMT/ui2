import { defineNumberExtension, NumberSchema } from '@/features/validation'

export const leaseTime = defineNumberExtension<[maxLeaseTime?: number, message?: string]>(
  (maxLeaseTime = 365 * 24 * 60 * 60, message = 'Must be a valid lease time') =>
    (schema: NumberSchema<number>) =>
      schema.refine(value => value >= 0 && value <= maxLeaseTime, {
        code: 'number.leaseTime',
        message,
      })
)
