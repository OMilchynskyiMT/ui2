import type { Validator, ValidatorOptions } from '../types'
import { digits } from './format'
import { inRange as stringInRange, startsWith } from './string'

const iccidDigits = digits()
const iccidLength = stringInRange(19, 20)
const iccidPrefix = startsWith('89')

export const simIccid = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'cellular.simIccid',
    message: options?.message ?? 'Must be ANY or a 19- or 20-digit ICCID beginning with 89',
    validate: (value, context) =>
      value === 'ANY' ||
      (iccidPrefix.validate(value, context) &&
        iccidLength.validate(value, context) &&
        iccidDigits.validate(value, context)),
  }
}
