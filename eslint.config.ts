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
      'vue/require-default-prop': 'off',
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],

      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    },
  },

  {
    name: 'app/test-rules',
    files: ['src/**/__tests__/**/*.ts'],
    rules: {
      'unicorn/no-useless-undefined': 'off',
      'unicorn/filename-case': 'off',
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
            ['^.+\\.s?css$'],
            ['^vue$', '^@?\\w'],
            ['^@/lib/', '^@/components/', '^@/'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'unicorn/no-top-level-assignment-in-function': 'off',
    },
  },

  eslintConfigPrettier
)
