// eslint-disable unicorn/prefer-regexp-test -- StringStream.match consumes input; RegExp.test is not equivalent
import type { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import { LanguageSupport, StreamLanguage, type StringStream } from '@codemirror/language'
import type { EditorState } from '@codemirror/state'

type OpenVpnState = {
  block: string | null
  seenDirective: boolean
}

const inlineFileBlockNames = [
  'ca',
  'cert',
  'dh',
  'extra-certs',
  'key',
  'pkcs12',
  'secret',
  'crl-verify',
  'http-proxy-user-pass',
  'tls-auth',
  'auth-gen-token-secret',
  'peer-fingerprint',
  'tls-crypt',
  'tls-crypt-v2',
  'verify-hash',
  'auth-user-pass',
] as const

const inlineFileBlocks = new Set<string>(inlineFileBlockNames)

const directiveCompletions: Completion[] = [
  { label: 'client', type: 'keyword', detail: 'client mode' },
  { label: 'server', type: 'keyword', detail: 'server network/mask' },
  { label: 'dev', type: 'keyword', detail: 'tun/tap device' },
  { label: 'dev-type', type: 'keyword', detail: 'tun/tap' },
  { label: 'proto', type: 'keyword', detail: 'transport protocol' },
  { label: 'port', type: 'keyword', detail: 'local port' },
  { label: 'remote', type: 'keyword', detail: 'remote host port proto' },
  { label: 'remote-random', type: 'keyword' },
  { label: 'resolv-retry', type: 'keyword' },
  { label: 'nobind', type: 'keyword' },
  { label: 'persist-key', type: 'keyword' },
  { label: 'persist-tun', type: 'keyword' },

  { label: 'ca', type: 'keyword', detail: 'CA certificate' },
  { label: 'cert', type: 'keyword', detail: 'local certificate' },
  { label: 'key', type: 'keyword', detail: 'private key' },
  { label: 'dh', type: 'keyword', detail: 'DH parameters' },
  { label: 'pkcs12', type: 'keyword' },
  { label: 'crl-verify', type: 'keyword' },

  { label: 'tls-client', type: 'keyword' },
  { label: 'tls-server', type: 'keyword' },
  { label: 'tls-auth', type: 'keyword' },
  { label: 'tls-crypt', type: 'keyword' },
  { label: 'tls-crypt-v2', type: 'keyword' },
  { label: 'remote-cert-tls', type: 'keyword', detail: 'server/client' },
  { label: 'verify-x509-name', type: 'keyword' },

  { label: 'cipher', type: 'keyword' },
  { label: 'data-ciphers', type: 'keyword' },
  { label: 'auth', type: 'keyword' },
  { label: 'auth-nocache', type: 'keyword' },
  { label: 'auth-user-pass', type: 'keyword' },

  { label: 'topology', type: 'keyword' },
  { label: 'ifconfig', type: 'keyword' },
  { label: 'route', type: 'keyword' },
  { label: 'route-gateway', type: 'keyword' },
  { label: 'redirect-gateway', type: 'keyword' },
  { label: 'push', type: 'keyword' },

  { label: 'keepalive', type: 'keyword' },
  { label: 'ping', type: 'keyword' },
  { label: 'ping-restart', type: 'keyword' },
  { label: 'reneg-sec', type: 'keyword' },

  { label: 'user', type: 'keyword' },
  { label: 'group', type: 'keyword' },
  { label: 'verb', type: 'keyword', detail: 'log verbosity' },
  { label: 'mute', type: 'keyword' },
  { label: 'log', type: 'keyword' },
  { label: 'status', type: 'keyword' },

  { label: 'client-to-client', type: 'keyword' },
  { label: 'duplicate-cn', type: 'keyword' },
  { label: 'max-clients', type: 'keyword' },
  { label: 'explicit-exit-notify', type: 'keyword' },
  { label: 'compress', type: 'keyword' },
]

const knownDirectives = new Set(directiveCompletions.map(item => item.label))

const valueCompletions: Record<string, Completion[]> = {
  proto: [
    { label: 'udp', type: 'constant' },
    { label: 'udp4', type: 'constant' },
    { label: 'udp6', type: 'constant' },
    { label: 'tcp-client', type: 'constant' },
    { label: 'tcp-server', type: 'constant' },
    { label: 'tcp', type: 'constant' },
    { label: 'tcp4', type: 'constant' },
    { label: 'tcp6', type: 'constant' },
  ],
  dev: [
    { label: 'tun', type: 'constant' },
    { label: 'tap', type: 'constant' },
  ],
  'dev-type': [
    { label: 'tun', type: 'constant' },
    { label: 'tap', type: 'constant' },
  ],
  'remote-cert-tls': [
    { label: 'server', type: 'constant' },
    { label: 'client', type: 'constant' },
  ],
  topology: [
    { label: 'subnet', type: 'constant' },
    { label: 'net30', type: 'constant' },
    { label: 'p2p', type: 'constant' },
  ],
  auth: [
    { label: 'SHA256', type: 'constant' },
    { label: 'SHA384', type: 'constant' },
    { label: 'SHA512', type: 'constant' },
  ],
  cipher: [
    { label: 'AES-256-GCM', type: 'constant' },
    { label: 'AES-128-GCM', type: 'constant' },
    { label: 'CHACHA20-POLY1305', type: 'constant' },
  ],
  'redirect-gateway': [
    { label: 'def1', type: 'constant' },
    { label: 'bypass-dhcp', type: 'constant' },
    { label: 'ipv6', type: 'constant' },
    { label: 'block-local', type: 'constant' },
  ],
  verb: [
    { label: '3', type: 'constant' },
    { label: '4', type: 'constant' },
    { label: '5', type: 'constant' },
  ],
}

const inlineBlockCompletions: Completion[] = inlineFileBlockNames.map(name => ({
  label: `<${name}>`,
  type: 'type',
  detail: 'inline file block',
  apply: (view, _completion, from, to) => {
    const open = `<${name}>`
    const close = `</${name}>`
    const insert = `${open}\n\n${close}`
    const cursor = from + open.length + 1

    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: cursor },
      scrollIntoView: true,
    })
  },
}))

const inlineBlockCloseCompletions: Completion[] = inlineFileBlockNames.map(name => ({
  label: `</${name}>`,
  type: 'type',
  detail: 'close inline file block',
}))

const escapeRegExp = (value: string): string => value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)

const hasCommentBeforeCursor = (text: string): boolean => {
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if ((char === '#' || char === ';') && (index === 0 || /\s/.test(text[index - 1] ?? ''))) {
      return true
    }
  }

  return false
}

const getInlineBlockCompletions = (
  token: ReturnType<CompletionContext['matchBefore']>,
  beforeToken: string
): CompletionResult | null => {
  if (!token || /\S/.test(beforeToken)) {
    return null
  }

  if (token.text.startsWith('</')) {
    return {
      from: token.from,
      options: inlineBlockCloseCompletions,
      validFor: /^<\/[\w-]*$/,
    }
  }

  if (token.text.startsWith('<')) {
    return {
      from: token.from,
      options: inlineBlockCompletions,
      validFor: /^<[\w-]*$/,
    }
  }

  return null
}

// Find the nearest complete inline-block tag above this line. Reading lines in
// reverse avoids allocating the entire document on every completion request.
const activeInlineBlock = (state: EditorState, lineNumber: number): string | null => {
  for (let number = lineNumber - 1; number >= 1; number--) {
    const tag = /^<(\/?)([\w-]+)>$/.exec(state.doc.line(number).text.trim())
    if (!tag || !inlineFileBlocks.has(tag[2]?.toLowerCase() ?? '')) continue
    return tag[1] === '/' ? null : tag[2]!.toLowerCase()
  }
  return null
}

export const openVpnCompletions = (context: CompletionContext): CompletionResult | null => {
  const line = context.state.doc.lineAt(context.pos)
  const column = context.pos - line.from
  const beforeCursor = line.text.slice(0, column)

  // Inside a certificate/key body only its matching closing tag is meaningful.
  const block = activeInlineBlock(context.state, line.number)
  if (block) {
    const closing = /^(\s*)(<\/[\w-]*)$/.exec(beforeCursor)
    if (!closing) return null
    return {
      from: line.from + (closing[1]?.length ?? 0),
      options: inlineBlockCloseCompletions.filter(item => item.label === `</${block}>`),
      validFor: /^<\/[\w-]*$/,
    }
  }

  if (hasCommentBeforeCursor(beforeCursor)) {
    return null
  }

  const token = context.matchBefore(/[^\s#;]*/)

  if (!token) {
    return null
  }

  const beforeToken = line.text.slice(0, token.from - line.from)
  const inlineBlockResult = getInlineBlockCompletions(token, beforeToken)

  if (inlineBlockResult) {
    return inlineBlockResult
  }

  if (!/\S/.test(beforeToken)) {
    if (token.from === token.to && !context.explicit) {
      return null
    }

    return {
      from: token.from,
      options: directiveCompletions,
      validFor: /^-{0,2}[\w-]*$/,
    }
  }

  const directive = /^-{0,2}([A-Za-z][\w-]*)\b/.exec(beforeToken.trimStart())?.[1]?.toLowerCase()

  if (!directive) {
    return null
  }

  const options = valueCompletions[directive]

  if (!options) {
    return null
  }

  return {
    from: token.from,
    options,
    validFor: /^[^\s#;]*$/,
  }
}

const openVpnLanguage = StreamLanguage.define<OpenVpnState>({
  name: 'openvpn',

  startState: () => ({
    block: null,
    seenDirective: false,
  }),

  token(stream: StringStream, state: OpenVpnState) {
    if (stream.sol()) {
      state.seenDirective = false
    }

    if (state.block) {
      if (stream.eatSpace()) {
        return null
      }

      const close = new RegExp(`</${escapeRegExp(state.block)}>`, 'i')

      if (stream.match(close)) {
        state.block = null
        return 'tagName'
      }

      stream.skipToEnd()
      return 'string'
    }

    if (stream.eatSpace()) {
      return null
    }

    const first = stream.peek()

    if (first === '#' || first === ';') {
      stream.skipToEnd()
      return 'comment'
    }

    const tag = stream.match(/<\/?([A-Za-z][\w-]*)>/i)

    if (tag) {
      const current = stream.current().toLowerCase()
      const open = /^<([a-z][\w-]*)>$/.exec(current)

      if (open && inlineFileBlocks.has(open[1] ?? '')) {
        state.block = open[1] ?? null
      }

      return 'tagName'
    }

    if (!state.seenDirective && stream.match(/-{0,2}[A-Za-z][\w-]*/)) {
      state.seenDirective = true

      const name = stream
        .current()
        .replace(/^-{1,2}/, '')
        .toLowerCase()

      return knownDirectives.has(name) ? 'keyword' : 'variableName'
    }

    if (stream.match(/"(?:[^"\\]|\\.)*"?/) || stream.match(/'(?:[^'\\]|\\.)*'?/)) {
      return 'string'
    }

    if (stream.match(/\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?\b/) || stream.match(/\b\d+(?:\.\d+)?\b/)) {
      return 'number'
    }

    if (stream.match(/\S+/)) {
      return 'atom'
    }

    stream.next()
    return null
  },

  languageData: {
    commentTokens: { line: '#' },
    autocomplete: openVpnCompletions,
    wordChars: '-',
  },
})

const openVpn = (): LanguageSupport => new LanguageSupport(openVpnLanguage)

export { openVpn }
