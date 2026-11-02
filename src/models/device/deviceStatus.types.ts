export type DeviceStatusMessage = {
  readonly guid: string
  readonly msg: string
  readonly timestamp: string
  readonly type: string
}

export type DeviceStatus = {
  readonly dbDirty: boolean
  readonly messages: readonly DeviceStatusMessage[]
}
