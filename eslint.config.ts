import eslintConfigPrettier from 'eslint-config-prettier/flat'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/*.config.js',
    '**/*.config.ts',
  ]),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  vueTsConfigs.stylisticTypeChecked,
  eslintPluginUnicorn.configs.recommended,

  {
    name: 'app/rules',
    files: ['**/*.{vue,ts,mts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'vue/max-attributes-per-line': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/valid-attribute-name': 'error',

      'unicorn/no-null': 'off',
      'unicorn/no-typeof-undefined': 'warn',
      'unicorn/no-unreadable-array-destructuring': 'warn',
      'unicorn/no-unsafe-regex': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-number-properties': 'off',
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prefer-structured-clone': 'off',
      'unicorn/no-useless-undefined': 'off',
    },
  },

  {
    files: ['**/*.{ts,vue}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:'],
            ['^vue$', '^@?\\w'],
            ['^@/components/'],
            ['^@/'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  eslintConfigPrettier
)
