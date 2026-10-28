const DEVICE_DATE_TIME = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/

export const parseDeviceDateTime = (value: string): Date => {
  const match = DEVICE_DATE_TIME.exec(value)
  if (!match) throw new RangeError('Invalid device date/time')

  const month = Number(match[1])
  const day = Number(match[2])
  const year = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])

  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(hour, minute, second, 0)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    throw new RangeError('Invalid device date/time')
  }

  return date
}
