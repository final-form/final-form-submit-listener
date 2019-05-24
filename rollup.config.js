import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import flow from 'rollup-plugin-flow'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

const minify = process.env.MINIFY
const format = process.env.FORMAT
const es = format === 'es'
const umd = format === 'umd'
const cjs = format === 'cjs'

let output

if (es) {
  output = { file: `dist/final-form-submit-listener.es.js`, format: 'es' }
} else if (umd) {
  if (minify) {
    output = {
      file: `dist/final-form-submit-listener.umd.min.js`,
      format: 'umd'
    }
  } else {
    output = { file: `dist/final-form-submit-listener.umd.js`, format: 'umd' }
  }
} else if (cjs) {
  output = { file: `dist/final-form-submit-listener.cjs.js`, format: 'cjs' }
} else if (format) {
  throw new Error(`invalid format specified: "${format}".`)
} else {
  throw new Error('no format specified. --environment FORMAT:xxx')
}

export default {
  input: 'src/index.js',
  output: Object.assign(
    {
      name: 'final-form-submit-listener',
      exports: 'named'
    },
    output
  ),
  external: umd
    ? []
    : [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
      ],
  plugins: [
    resolve({ jsnext: true, main: true }),
    flow(),
    commonjs({ include: 'node_modules/**' }),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      runtimeHelpers: true,
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            loose: true
          }
        ],
        '@babel/preset-flow'
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', { useESModules: !cjs }],
        '@babel/plugin-transform-flow-strip-types',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-syntax-import-meta',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-json-strings',
        [
          '@babel/plugin-proposal-decorators',
          {
            legacy: true
          }
        ],
        '@babel/plugin-proposal-function-sent',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-numeric-separator',
        '@babel/plugin-proposal-throw-expressions'
      ]
    }),
    umd
      ? replace({
          'process.env.NODE_ENV': JSON.stringify(
            minify ? 'production' : 'development'
          )
        })
      : null,
    minify ? uglify() : null
  ].filter(Boolean)
}
