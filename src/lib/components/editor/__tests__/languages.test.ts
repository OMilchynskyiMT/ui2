import { CompletionContext } from '@codemirror/autocomplete'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'

import { languageExtensions } from '../languages'
import { openVpnCompletions } from '../languages/openvpn'

const suggest = (document: string, isExplicit = true) => {
  const state = EditorState.create({ doc: document, extensions: [languageExtensions('openvpn')] })
  return openVpnCompletions(new CompletionContext(state, document.length, isExplicit))
}

describe('OpenVPN completions', () => {
  it('offers directives at the beginning of a line', () => {
    expect(suggest('per')?.options.some(option => option.label === 'persist-tun')).toBe(true)
  })

  it('offers contextual values after known directives', () => {
    const result = suggest('proto ud')
    expect(result?.options.some(option => option.label === 'udp4')).toBe(true)
    expect(result?.options.some(option => option.label === 'client')).toBe(false)
  })

  it('offers paired inline blocks without suggesting them in comments', () => {
    const result = suggest('<ca')
    expect(result?.options.some(option => option.label === '<ca>' && typeof option.apply === 'function')).toBe(true)
    expect(suggest('# <ca')).toBeNull()
  })

  it('never offers completions inside certificate or secret data', () => {
    expect(suggest('<key>\nMIIEvQ')).toBeNull()
    expect(suggest('<key>\nMIIEvQ\n</ke')?.options.map(option => option.label)).toEqual(['</key>'])
    expect(suggest('<ca>\ncertificate\n</ca>\nproto ud')?.options.some(option => option.label === 'udp')).toBe(true)
  })

  it('avoids popping suggestions at an empty implicit cursor', () => {
    expect(suggest('', false)).toBeNull()
  })
})
