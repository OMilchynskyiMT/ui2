import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export type ChangeTrackerOptions<T, TTracked = T> = {
  // Selects the portion of the model that represents persistent state
  project?: (value: T) => TTracked
  // Overrides the default structural comparison
  equals?: (current: TTracked, baseline: TTracked) => boolean
}

const isObject = (value: unknown): value is Record<PropertyKey, unknown> => {
  return typeof value === 'object' && value !== null
}

const isDeepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) {
    return true
  }

  if (!isObject(left) || !isObject(right)) {
    return false
  }

  if (left instanceof Date || right instanceof Date) {
    return left instanceof Date && right instanceof Date && left.getTime() === right.getTime()
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => isDeepEqual(value, right[index]))
    )
  }

  const leftPrototype = Object.getPrototypeOf(left)
  const rightPrototype = Object.getPrototypeOf(right)

  if (leftPrototype !== rightPrototype) return false
  if (leftPrototype !== null && leftPrototype !== Object.prototype) return false

  const leftKeys = Reflect.ownKeys(left)
  const rightKeys = Reflect.ownKeys(right)

  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every(key => Object.prototype.hasOwnProperty.call(right, key) && isDeepEqual(left[key], right[key]))
}

/**
 * Tracks whether the current value differs from an accepted baseline
 *
 * @example
 * const current = ref({
 *   hostname: 'router',
 * })
 *
 * const baseline = ref({
 *   hostname: 'router',
 * })
 *
 * const changes = useChangeTracker(
 *   current,
 *   baseline,
 *   true
 * )
 *
 * current.value.hostname = 'gateway'
 *
 * changes.dirty.value // true
 *
 * Tracks whether meaningful data differs from an accepted baseline
 * @example
 * const changes = useChangeTracker(
 *   data,
 *   baseline,
 *   ready,
 *   {
 *     project: value => ({
 *       hostname: value.hostname,
 *       enabled: value.enabled,
 *     }),
 *   }
 * )
 *
 * changes.dirty.value
 */
export const useChangeTracker = <T, TTracked = T>(
  current: MaybeRefOrGetter<T | undefined>,
  baseline: MaybeRefOrGetter<T | undefined>,
  ready: MaybeRefOrGetter<boolean>,
  options: ChangeTrackerOptions<T, TTracked> = {}
) => {
  const project = options.project ?? ((value: T) => value as unknown as TTracked)
  const equals = options.equals ?? ((left: TTracked, right: TTracked) => isDeepEqual(left, right))

  const isChanged = (currentValue: T, baselineValue: T): boolean => {
    return !equals(project(currentValue), project(baselineValue))
  }

  const dirty = computed(() => {
    if (!toValue(ready)) {
      return false
    }

    const currentValue = toValue(current)
    const baselineValue = toValue(baseline)

    if (currentValue === undefined || baselineValue === undefined) {
      return false
    }

    return isChanged(currentValue, baselineValue)
  })

  return {
    dirty,
    isChanged,
  }
}
