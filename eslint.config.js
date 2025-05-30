import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    files: ['src/**/*.{js,ts}'],
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.build.json']
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        // Node globals
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'import/no-unresolved': 'off',
      'import/named': 'off'
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts']
        }
      }
    }
  },
  {
    files: ['tests/**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.tests.json']
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        // Node globals
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly'
      }
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'off',
      'import/no-unresolved': 'off',
      'import/named': 'off'
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts']
        }
      }
    }
  }
]
