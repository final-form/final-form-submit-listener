import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import terser from '@rollup/plugin-terser'
import replace from 'rollup-plugin-replace'
import typescript from 'rollup-plugin-typescript2'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return (id) => pattern.test(id)
}

const minify = process.env.MINIFY
const format = process.env.FORMAT
const es = format === 'es'
const umd = format === 'umd'
const cjs = format === 'cjs'

let output

if (es) {
  output = { file: pkg.module, format: 'es' }
} else if (umd) {
  if (minify) {
    output = {
      file: 'dist/final-form-submit-listener.umd.min.js',
      format: 'umd'
    }
  } else {
    output = { file: 'dist/final-form-submit-listener.umd.js', format: 'umd' }
  }
} else if (cjs) {
  output = { file: pkg.main, format: 'cjs' }
} else if (format) {
  throw new Error(`invalid format specified: "${format}".`)
} else {
  throw new Error('no format specified. --environment FORMAT:xxx')
}

export default {
  input: 'src/index.ts',
  output: Object.assign(
    {
      name: 'final-form-submit-listener',
      exports: 'named',
      globals: {
        'final-form': 'finalForm',
        '@babel/runtime/helpers/': 'babelHelpers'
      }
    },
    output
  ),
  external: makeExternalPredicate([
    ...(umd
      ? Object.keys(pkg.peerDependencies || {})
      : [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {})
        ]),
    /@babel\/runtime\/helpers\//
  ]),
  plugins: [
    typescript({
      typescript: require('typescript'),
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true,
      clean: true
    }),
    resolve({
      mainFields: ['module'],
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }),
    commonjs({
      include: 'node_modules/**',
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      runtimeHelpers: true,
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            regenerator: true,
            helpers: true,
            useESModules: true
          }
        ]
      ]
    }),
    umd
      ? replace({
          'process.env.NODE_ENV': JSON.stringify(
            minify ? 'production' : 'development'
          )
        })
      : null,
    minify ? terser() : null
  ].filter(Boolean)
}
