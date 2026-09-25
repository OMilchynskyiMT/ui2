export type NetworkBridgeCardProperties = Readonly<{
  name: string
  mac: string
  ipv4?: string
  mask?: string
  dhcpState?: string
  leaseRange?: string
  interfaces: readonly string[]
}>

export type NetworkAdapterSignal = Readonly<{
  level: number
  steps?: number
  value: string
  title?: string
}>

type NetworkAdapterIdentity = Readonly<{
  name: string
}>

type WanAdapterRole = Readonly<{
  role: 'wan'
  current?: boolean
}>

type LanAdapterRole = Readonly<{
  role: 'lan'
  current?: never
}>

type SwitchableNetworkAdapter = NetworkAdapterIdentity & (WanAdapterRole | LanAdapterRole)

export type EthernetAdapterCardProperties = SwitchableNetworkAdapter &
  Readonly<{
    kind: 'ethernet'
    state: string
    bridge?: string
    mac: string
  }>

export type WifiAdapterCardProperties = SwitchableNetworkAdapter &
  Readonly<{
    kind: 'wifi'
    state: string
    mode?: string
    mac?: string
  }>

export type CellularAdapterCardProperties = NetworkAdapterIdentity &
  WanAdapterRole &
  Readonly<{
    kind: 'cellular'
    state: string
    service?: string
    networkRegistration?: string
    signal?: NetworkAdapterSignal
    connected?: string
    apn?: string
    ipv4?: string
    dns?: string
    phoneNumber?: string
    tower?: string
  }>

export type NetworkAdapterCardProperties =
  EthernetAdapterCardProperties | WifiAdapterCardProperties | CellularAdapterCardProperties
