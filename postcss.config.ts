import type { AcceptedPlugin, AtRule, Declaration, PluginCreator } from 'postcss'
import { containerTokens } from './@postcss/container-tokens.ts'

const tokenPattern = /container-token\(\s*(--[\w-]+)\s*\)/g

const replaceDesignTokens = (value: string, node: Declaration | AtRule) => {
  return value.replace(tokenPattern, (_, tokenName: keyof typeof containerTokens) => {
    const tokenValue = containerTokens[tokenName]

    if (tokenValue === undefined) {
      throw node.error(`Unknown container token: ${tokenName}`)
    }

    return tokenValue
  })
}

const containerTokensPlugin: PluginCreator<unknown> = () => {
  return {
    postcssPlugin: 'container-tokens',
    AtRule: rule => {
      rule.params = replaceDesignTokens(rule.params, rule)
    },
    Declaration: declaration => {
      declaration.value = replaceDesignTokens(declaration.value, declaration)
    },
  }
}
containerTokensPlugin.postcss = true

export default {
  plugins: [containerTokensPlugin()] as AcceptedPlugin[],
}
