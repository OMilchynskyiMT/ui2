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
    name: 'architecture/lib',
    files: ['src/lib/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/api/**',
                '@/components/**',
                '@/composables/**',
                '@/layouts/**',
                '@/models/**',
                '@/router/**',
                '@/state/**',
                '@/views/**',
              ],
              message: 'src/lib must not depend on application layers',
            },
          ],
        },
      ],
    },
  },

  {
    name: 'architecture/composables',
    files: ['src/composables/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/api/**', '@/components/**', '@/layouts/**', '@/models/**', '@/state/**', '@/views/**'],
              message: 'generic composables must not depend on application domains or UI',
            },
          ],
        },
      ],
    },
  },

  {
    name: 'architecture/state',
    files: ['src/state/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/api/**',
                '@/components/**',
                '@/composables/**',
                '@/layouts/**',
                '@/models/**',
                '@/router/**',
                '@/views/**',
              ],
              message: 'state must not depend on API, models, router, and UI layers',
            },
          ],
        },
      ],
    },
  },

  {
    name: 'architecture/api',
    files: ['src/api/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/**', '@/layouts/**', '@/models/**', '@/router/**', '@/views/**'],
              message: 'API modules must not depend on models, router, or UI components',
            },
          ],
        },
      ],
    },
  },

  {
    name: 'architecture/models',
    files: ['src/models/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/**', '@/layouts/**', '@/router/**', '@/views/**'],
              message: 'models must not depend on router or UI things',
            },
          ],
        },
      ],
    },
  },

  {
    name: 'architecture/ui',
    files: ['src/components/**/*.{ts,vue}', 'src/layouts/**/*.{ts,vue}', 'src/views/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/api/**', '@/router/**'],
              message: 'UI must use models for API access and vue-router APIs for navigation',
            },
          ],
        },
      ],
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
      'unicorn/prefer-number-coercion': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    rules: {
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            pascalCase: true,
          },
          checkDirectories: false,
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
          },
          checkDirectories: false,
        },
      ],
    },
  },
  {
    files: ['@types/**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },

  eslintConfigPrettier
)
