export type HardwareCapabilities = {
  bluetooth: boolean
  cell: boolean
  din: boolean
  dout: boolean
  ethSwitch: boolean
  extUsb: boolean
  gps: boolean
  lora: boolean
  serial: boolean
  wifi: boolean
}

export type SoftwareCapabilities = {
  customUserRoles: boolean
  ddns: boolean
  docker: boolean
  licensing: boolean
  loraCloudConnector: boolean
  loraNetworkServer: boolean
  modbusSlave: boolean
  mqttBridge: boolean
  nodeRed: boolean
  notifications: boolean
  packageManagement: boolean
  radius: boolean
  resetButton: boolean
  scada: boolean
  smtp: boolean
  snmp: boolean
  staticRoutes: boolean
  trustedIp: boolean
  tunnels: {
    gre: boolean
    ipsec: boolean
    openvpn: boolean
  }
}

export type DeviceSystem = {
  capabilities: HardwareCapabilities
  softCapabilities: SoftwareCapabilities
}

type BooleanPaths<T> = {
  [K in keyof T & string]: T[K] extends boolean ? K : T[K] extends object ? `${K}.${BooleanPaths<T[K]>}` : never
}[keyof T & string]

// paths point to boolean leaves, regardless of nesting
export type Capability =
  `hardware.${BooleanPaths<HardwareCapabilities>}` | `software.${BooleanPaths<SoftwareCapabilities>}`
