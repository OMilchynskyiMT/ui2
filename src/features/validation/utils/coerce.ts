export function coerceToString(input: unknown): unknown {
  if (typeof input === 'string' || input === undefined || input === null) {
    return input
  }

  if (typeof input === 'number' || typeof input === 'boolean' || typeof input === 'bigint') {
    return String(input)
  }

  return input
}

export function coerceToNumber(input: unknown): unknown {
  if (typeof input === 'number') {
    return input
  }

  if (typeof input !== 'string') {
    return input
  }

  const value = input.trim()

  if (value === '') {
    return input
  }

  const result = Number(value)

  return Number.isFinite(result) ? result : input
}

export function coerceToBoolean(input: unknown): unknown {
  if (typeof input === 'boolean') {
    return input
  }

  if (typeof input === 'number') {
    if (input === 1) return true
    if (input === 0) return false
    return input
  }

  if (typeof input !== 'string') {
    return input
  }

  switch (input.trim().toLowerCase()) {
    case 'true':
    case '1':
    case 'yes':
    case 'on': {
      return true
    }

    case 'false':
    case '0':
    case 'no':
    case 'off': {
      return false
    }

    default: {
      return input
    }
  }
}

export function emptyStringAsUndefined(input: unknown): unknown {
  return input === '' ? undefined : input
}
