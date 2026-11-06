import type { Validator, ValidatorOptions } from '../types'
const datePattern = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(\d{4})$/
const timePattern = /^(0?\d|1\d|2[0-3]):(0?\d|[1-5]\d):(0?\d|[1-5]\d)$/

export const date = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.date',
    message: options?.message ?? 'Must be a date in MM/DD/YYYY format',
    validate: value => {
      const match = datePattern.exec(value)
      if (!match) return false

      const month = Number(match[1])
      const day = Number(match[2])
      const year = Number(match[3])
      const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
      const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      return day <= daysInMonth[month - 1]!
    },
  }
}

export const time = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.time',
    message: options?.message ?? 'Must be a 24-hour time in HH:MM:SS format',
    validate: value => timePattern.test(value),
  }
}

export const backoffTimings = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'format.backoffTimings',
    message: options?.message ?? 'Must be a comma-separated list of positive numbers',
    validate: value =>
      !value.split(',').some(part => {
        const timing = Number(part.trim())
        return !Number.isFinite(timing) || timing <= 0
      }),
  }
}
