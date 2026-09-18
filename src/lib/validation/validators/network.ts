import type { Validator, ValidatorOptions } from '../types'
import { type ContextValue, resolveContextValue } from './context'

const ipv4Pattern = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/
const ipv6Pattern =
  /^((([\dA-Fa-f]{1,4}:){7}([\dA-Fa-f]{1,4}|:))|(([\dA-Fa-f]{1,4}:){6}(:[\dA-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([\dA-Fa-f]{1,4}:){5}(((:[\dA-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([\dA-Fa-f]{1,4}:){4}(((:[\dA-Fa-f]{1,4}){1,3})|((:[\dA-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([\dA-Fa-f]{1,4}:){3}(((:[\dA-Fa-f]{1,4}){1,4})|((:[\dA-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([\dA-Fa-f]{1,4}:){2}(((:[\dA-Fa-f]{1,4}){1,5})|((:[\dA-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([\dA-Fa-f]{1,4}:)(((:[\dA-Fa-f]{1,4}){1,6})|((:[\dA-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[\dA-Fa-f]{1,4}){1,7})|((:[\dA-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?$/
const hostNamePattern = /^(([\dA-Za-z]|[A-Za-z][\dA-Za-z-]*[\dA-Za-z])\.)*([A-Za-z]|[A-Za-z][\dA-Za-z-]*[\dA-Za-z])$/
const domainNamePattern = /^((?:(?:\w[+.-]?)*\w)+)((?:(?:\w[+.-]?){0,62}\w)+)\.(\w{2,6})$/
const macAddressPattern = /^([\dA-Fa-f]{2}[:-]){5}([\dA-Fa-f]{2})$/
const phoneNumberPattern = /^\+*\({0,1}\d{1,3}\){0,1}[\d\s./-]*$/
const leaseTimePattern = /^\d{1,3}(?:-\d{1,2}){2}$/
const publicUrlPattern =
  /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|[\da-z\u{A1}-\u{FFFF}]+(?:-[\da-z\u{A1}-\u{FFFF}]+)*(?:\.[\da-z\u{A1}-\u{FFFF}]+(?:-[\da-z\u{A1}-\u{FFFF}]+)*)*\.[a-z\u{A1}-\u{FFFF}]{2,})(?::\d{2,5})?(?:\/\S*)?([^/])$/iu

const reservedPorts = new Map<string, number>([
  ['FCGI ', 8888],
  ['FCGI', 9000],
  ['TFTP', 69],
  ['DHCP ', 68],
  ['DHCP', 67],
  ['DNS', 53],
  ['SMTP', 57],
])

const ipv4ToNumber = (value: string): number | undefined => {
  if (!ipv4Pattern.test(value)) return undefined
  const parts = value.split('.').map(Number)
  return (((parts[0]! * 256 + parts[1]!) * 256 + parts[2]!) * 256 + parts[3]!) >>> 0
}

const prefixToMask = (prefix: number): number => {
  if (prefix === 0) return 0
  return (0xff_ff_ff_ff << (32 - prefix)) >>> 0
}

const netmaskToNumber = (value: string): number | undefined => {
  const mask = ipv4ToNumber(value)
  if (mask === undefined) return undefined
  const inverse = ~mask >>> 0
  return (inverse & (inverse + 1)) === 0 ? mask : undefined
}

const isIntegerString = (value: string): boolean => {
  const parsed = Number.parseInt(value, 10)
  return parsed.toString() === value
}

const maskToNumber = (value: string | number): number | undefined => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 && value <= 32 ? prefixToMask(value) : undefined
  }

  const netmask = netmaskToNumber(value)
  if (netmask !== undefined) return netmask
  return isIntegerString(value) && Number(value) >= 0 && Number(value) <= 32 ? prefixToMask(Number(value)) : undefined
}

const isIpv4Mask = (value: string | number): boolean => {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 0 && value <= 32
  if (netmaskToNumber(value) !== undefined) return true
  return isIntegerString(value) && Number(value) >= 0 && Number(value) <= 32
}

const isNetworkIpv4Number = (value: number): boolean => {
  const firstOctet = value >>> 24
  const lastOctet = value & 0xff
  return firstOctet !== 127 && firstOctet >= 1 && firstOctet <= 222 && lastOctet <= 254
}

const isNetworkIpv4Address = (value: string): boolean => {
  const parsed = ipv4ToNumber(value)
  return parsed !== undefined && isNetworkIpv4Number(parsed)
}

const isLegacyNetworkMaskValid = (networkValue: number, maskValue: number): boolean => {
  const lastNetworkOctet = networkValue & 0xff
  const lastMaskOctet = maskValue & 0xff
  if (lastNetworkOctet === 0 && lastMaskOctet === 255) return false

  const normalizedNetwork = (networkValue & maskValue) >>> 0
  if (networkValue === normalizedNetwork && lastMaskOctet !== 255) return true

  const broadcast = (normalizedNetwork | (~maskValue >>> 0)) >>> 0
  return networkValue !== broadcast
}

const checkIpv4InNetwork = (address: string, network: string, mask: string | number): boolean | undefined => {
  const addressValue = ipv4ToNumber(address)
  const networkValue = ipv4ToNumber(network)
  const maskValue = maskToNumber(mask)
  if (addressValue === undefined || networkValue === undefined || maskValue === undefined) return undefined

  // A syntactically valid network/mask pair can still be invalid for the legacy
  // relation (for example a host address used as the network with /0). That is
  // part of isIpInNetwork() itself, not a prerequisite syntax error.
  if (!isNetworkIpv4Address(network) || !isLegacyNetworkMaskValid(networkValue, maskValue)) return false

  // Preserve the legacy isIpInNetwork() contract: its `network` argument is used
  // as the beginning of the usable range and is not normalized implicitly.
  // Preserve the signed 32-bit complement used by the legacy implementation.
  // In particular, /0 produces a negative usable range and therefore contains no hosts.
  const range = ~maskValue - 1
  const start = networkValue + 1
  const end = start + range - 1
  return addressValue >= start && addressValue <= end
}

const parseCidr = (value: string): Readonly<{ network: number; mask: number }> | undefined => {
  const [address, prefixText, ...rest] = value.split('/')
  if (!address || !prefixText || rest.length > 0 || !/^\d{1,2}$/.test(prefixText)) return undefined

  const addressValue = ipv4ToNumber(address)
  const prefix = Number(prefixText)
  if (addressValue === undefined || !Number.isSafeInteger(prefix) || prefix < 0 || prefix > 32) return undefined

  const mask = prefixToMask(prefix)
  return { network: (addressValue & mask) >>> 0, mask }
}

const areNetworksOverlap = (left: string, right: string): boolean => {
  const first = parseCidr(left)
  const second = parseCidr(right)
  if (!first || !second) return false

  const commonMask = Math.min(first.mask, second.mask)
  return (first.network & commonMask) === (second.network & commonMask)
}

export const ipv4Address = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv4Address',
    message: options?.message ?? 'Must be a valid IPv4 address',
    validate: value => ipv4Pattern.test(value),
  }
}

export const ipv4Cidr = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv4Cidr',
    message: options?.message ?? 'Must be a valid IPv4 CIDR network',
    validate: value => parseCidr(value) !== undefined,
  }
}

export const ipv4Netmask = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv4Netmask',
    message: options?.message ?? 'Must be a valid IPv4 network mask',
    validate: value => netmaskToNumber(value) !== undefined,
  }
}

export const ipv4Mask = (options?: ValidatorOptions): Validator<string | number> => {
  return {
    code: 'network.ipv4Mask',
    message: options?.message ?? 'Must be an IPv4 prefix between 0 and 32 or a valid dotted-decimal netmask',
    validate: isIpv4Mask,
  }
}

export const ipv4Gateway = (
  address: ContextValue<string>,
  mask: ContextValue<string | number>,
  options?: ValidatorOptions
): Validator<string> => {
  return {
    code: 'network.ipv4Gateway',
    message: options?.message ?? 'Must be a usable gateway in the same IPv4 network',
    validate: (value, context) => {
      const gateway = ipv4ToNumber(value)
      const addressValue = ipv4ToNumber(resolveContextValue(address, context))
      const maskValue = maskToNumber(resolveContextValue(mask, context))
      if (gateway === undefined || addressValue === undefined || maskValue === undefined) return true

      const network = (addressValue & maskValue) >>> 0
      if (!isNetworkIpv4Number(network) || !isLegacyNetworkMaskValid(network, maskValue)) return false

      const broadcast = (network | (~maskValue >>> 0)) >>> 0
      return gateway > network && gateway < broadcast
    },
  }
}

export const ipv4InNetwork = (
  network: ContextValue<string>,
  mask: ContextValue<string | number>,
  options?: ValidatorOptions
): Validator<string> => {
  return {
    code: 'network.ipv4InNetwork',
    message: options?.message ?? 'Must be a usable IPv4 address in the selected network',
    validate: (value, context) =>
      checkIpv4InNetwork(value, resolveContextValue(network, context), resolveContextValue(mask, context)) ?? true,
  }
}

export const ipv4RangeEnd = (start: ContextValue<string>, options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv4RangeEnd',
    message: options?.message ?? 'Must not be lower than the range start address',
    validate: (value, context) => {
      const startValue = ipv4ToNumber(resolveContextValue(start, context))
      const endValue = ipv4ToNumber(value)
      if (startValue === undefined || endValue === undefined) return true
      return startValue <= endValue
    },
  }
}

export const nonOverlappingIpv4Network = (
  existingNetworks: ContextValue<readonly string[]>,
  options?: ValidatorOptions
): Validator<string> => {
  return {
    code: 'network.nonOverlappingIpv4Network',
    message: options?.message ?? 'Must not overlap an existing IPv4 network',
    validate: (value, context) => {
      if (!parseCidr(value)) return true
      return resolveContextValue(existingNetworks, context).every(network => !areNetworksOverlap(value, network))
    },
  }
}

export const ipv6Address = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv6Address',
    message: options?.message ?? 'Must be a valid IPv6 address',
    validate: value => ipv6Pattern.test(value),
  }
}

const parseIpv6WithPrefix = (value: string): Readonly<{ address: string; prefix: number }> | undefined => {
  // Preserve the legacy split(..., 2) + parseInt behavior. Existing configurations
  // may therefore contain suffix text after a numeric prefix or an extra slash.
  const [address, prefixText] = value.split('/', 2)
  if (!address || prefixText === undefined) return undefined
  const prefix = Number.parseInt(prefixText, 10)
  if (!ipv6Pattern.test(address) || !Number.isSafeInteger(prefix) || prefix < 0 || prefix > 128) return undefined
  return { address, prefix }
}

export const ipv6WithPrefix = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv6WithPrefix',
    message: options?.message ?? 'Must be a valid IPv6 address with prefix',
    validate: value => parseIpv6WithPrefix(value) !== undefined,
  }
}

const isIpv6LinkLocal = (value: string): boolean => {
  if (!ipv6Pattern.test(value) || value.length < 4 || value[3] === ':') return false
  return /^[Ff][Ee][89ABab]/.test(value)
}

export const ipv6LinkLocalAddress = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv6LinkLocalAddress',
    message: options?.message ?? 'Must be an IPv6 link-local address',
    validate: isIpv6LinkLocal,
  }
}

export const ipv6LinkLocalWithPrefix = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv6LinkLocalWithPrefix',
    message: options?.message ?? 'Must be an IPv6 link-local address with prefix',
    validate: value => {
      const parsed = parseIpv6WithPrefix(value)
      return parsed !== undefined && isIpv6LinkLocal(parsed.address)
    },
  }
}

const isIpv6InterfaceApplicable = (value: string): boolean => {
  if (!ipv6Pattern.test(value)) return false

  // Keep the legacy applicability rules exactly: unspecified (::), loopback (::1),
  // and multicast (ff00::/8) addresses are not valid interface addresses.
  let position = 0
  for (; position < value.length; position++) {
    const character = value[position]
    if (character !== '0' && character !== ':' && character !== '.') break
  }

  if (position === value.length) return false
  if (position === value.length - 1 && value[position] === '1') return false

  const address = value.toLowerCase()
  return (
    !(address.length > 5 && address.startsWith('f') && address[1] === 'f') || address[2] === ':' || address[3] === ':'
  )
}

export const ipv6InterfaceAddress = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv6InterfaceAddress',
    message: options?.message ?? 'Must be an applicable IPv6 interface address',
    validate: isIpv6InterfaceApplicable,
  }
}

export const ipv6InterfaceAddressWithPrefix = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ipv6InterfaceAddressWithPrefix',
    message: options?.message ?? 'Must be an applicable IPv6 interface address with prefix',
    validate: value => {
      const parsed = parseIpv6WithPrefix(value)
      return parsed !== undefined && isIpv6InterfaceApplicable(parsed.address)
    },
  }
}

export const trapIpv4Address = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.trapIpv4Address',
    message: options?.message ?? 'Must not be in 127.0.0.0/8 or 224.0.0.0/3',
    validate: value => {
      // NOTE: checks only the legacy trap-address restriction.
      // Use it with ipv4Address() when full IPv4 syntax validation is required
      const first = Number.parseInt(value.split('.', 1)[0] ?? '', 10)
      return first !== 127 && !(first >= 224 && first <= 255)
    },
  }
}

export const macAddress = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.macAddress',
    message: options?.message ?? 'Must be a valid MAC address',
    validate: value => macAddressPattern.test(value),
  }
}

export const phoneNumber = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.phoneNumber',
    message: options?.message ?? 'Must be a valid phone number',
    validate: value => phoneNumberPattern.test(value),
  }
}

export const leaseTime = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.leaseTime',
    message: options?.message ?? 'Must use DDD-HH-MM lease-time format',
    validate: value => leaseTimePattern.test(value),
  }
}

export const availableServerPort = (serviceName: string, options?: ValidatorOptions): Validator<number> => {
  const conflictingService = (value: number): string | undefined => {
    for (const [service, reservedPort] of reservedPorts) {
      if (value === reservedPort && service !== serviceName) return service.trim()
    }
    return undefined
  }

  return {
    code: 'network.availableServerPort',
    message:
      options?.message ??
      ((value: number): string => {
        const service = conflictingService(value)
        return service ? `Port ${value} is reserved for ${service}` : 'Port is reserved for another service'
      }),
    validate: value => conflictingService(value) === undefined,
  }
}

const isPortRange = (value: string | number): boolean => {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value >= 1 && value <= 65_535

  const ports = value.split(/[:-]/).map(Number)
  if (ports.some(candidate => !Number.isSafeInteger(candidate) || Number.isNaN(candidate))) return false
  if (ports.length === 1) return ports[0]! >= 1 && ports[0]! <= 65_535
  if (ports.length !== 2) return false
  return ports[0]! >= 1 && ports[0]! <= 65_535 && ports[1]! >= 1 && ports[1]! <= 65_535 && ports[0]! <= ports[1]!
}

export const portRange = (options?: ValidatorOptions): Validator<string | number> => {
  return {
    code: 'network.portRange',
    message: options?.message ?? 'Must be a valid port or ascending port range',
    validate: value => isPortRange(value),
  }
}

export const portCsv = (options?: ValidatorOptions): Validator<string | number> => {
  return {
    code: 'network.portCsv',
    message: options?.message ?? 'Must be a comma-separated list of ports or port ranges',
    validate: value =>
      typeof value === 'number' ? isPortRange(value) : value.split(',').every(element => isPortRange(element)),
  }
}

export const domainName = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.domainName',
    message: options?.message ?? 'Must be a valid domain name',
    validate: value => domainNamePattern.test(value),
  }
}

export const domainOrIpAddress = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.domainOrIpAddress',
    message: options?.message ?? 'Must be a valid hostname, IPv4 address, or IPv6 address',
    validate: value => ipv4Pattern.test(value) || hostNamePattern.test(value) || ipv6Pattern.test(value.trim()),
  }
}

export const publicUrl = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.publicUrl',
    message: options?.message ?? 'Must be a valid public HTTP, HTTPS, or FTP URL',
    validate: value => publicUrlPattern.test(value),
  }
}

export const ssid = (options?: ValidatorOptions): Validator<string> => {
  return {
    code: 'network.ssid',
    message: options?.message ?? 'Must be a valid SSID',
    validate: value => !/["$+?[\\\]]/.test(value) && !/^[!#;]/.test(value) && value.trim().length > 0,
  }
}
