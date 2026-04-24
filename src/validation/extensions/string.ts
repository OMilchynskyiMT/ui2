import { defineStringExtension, StringSchema } from '@/features/validation'

export const base64 = defineStringExtension<[message?: string]>(
  (message = 'Must be a valid base64 string') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /^(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{3}=|[a-z0-9+/]{2}==)?$/i.test(value), {
        code: 'string.base64',
        message,
      })
)

export const noSpaces = defineStringExtension<[message?: string]>(
  (message = 'Must not contain spaces') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => !/\s/.test(value), {
        code: 'string.noSpaces',
        message,
      })
)

export const filename = defineStringExtension<[message?: string]>(
  (message = 'Must be a valid filename') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => !/[<>:"/\\|?*]/.test(value), {
        code: 'string.filename',
        message,
      })
)

export const urlPath = defineStringExtension<[message?: string]>(
  (message = 'Must be a valid URL path') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /^\/[\w#%&+./:=?@~-]*$/.test(value), {
        code: 'string.urlPath',
        message,
      })
)

export const printableAscii = defineStringExtension<[message?: string]>(
  (message = 'Must only contain printable ASCII characters') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /^[\u0020-\u007F]*$/u.test(value), {
        code: 'string.printableAscii',
        message,
      })
)

export const sshPubKey = defineStringExtension<[message?: string]>(
  (message = 'Must be a valid SSH public key') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /(?<method>[a-z0-9-]+) (?<payload>AAAA[a-z0-9+=\-/_]+)( (?<title>.+))?/i.test(value), {
        code: 'string.sshPubKey',
        message,
      })
)

export const alphaNumericSpace = defineStringExtension<[message?: string]>(
  (message = 'Must only contain alpha-numeric characters and spaces') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /^[a-z0-9 ]+$/i.test(value), {
        code: 'string.alphaNumericSpace',
        message,
      })
)

export const apiKey = defineStringExtension<[message?: string]>(
  (message = 'Must be a valid API key') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /^[\da-z]{10,64}$/i.test(value), {
        code: 'string.apiKey',
        message,
      })
)

export const apiSecret = defineStringExtension<[message?: string]>(
  (message = 'Must be a valid API secret') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /^[\da-f]{16,64}$/i.test(value), {
        code: 'string.apiSecret',
        message,
      })
)

export const leaseTime = defineStringExtension<[message?: string]>(
  (message = 'Must be a valid lease time') =>
    (schema: StringSchema<string>) =>
      schema.refine(value => /^\d{1,3}(?:-\d{1,2}){2}$/.test(value), {
        code: 'string.leaseTime',
        message,
      })
)
