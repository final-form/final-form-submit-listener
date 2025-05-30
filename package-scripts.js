import { series, concurrent, rimraf } from 'nps-utils'

export default {
  scripts: {
    test: {
      default: 'cross-env NODE_ENV=test jest --coverage',
      update: 'cross-env NODE_ENV=test jest --coverage --updateSnapshot',
      watch: 'cross-env NODE_ENV=test jest --watch',
      size: {
        description: 'check the size of the bundle',
        script: 'bundlesize'
      }
    },
    build: {
      description: 'delete the dist directory and run all builds',
      default: series(
        rimraf('dist'),
        concurrent.nps(
          'build.es',
          'build.cjs',
          'build.umd.main',
          'build.umd.min',
          'build.types'
        )
      ),
      es: {
        description: 'run the build with ES modules',
        script: 'rollup --config --environment FORMAT:es'
      },
      cjs: {
        description: 'run the build with CommonJS',
        script: 'rollup --config --environment FORMAT:cjs'
      },
      umd: {
        min: {
          description: 'run the build with UMD and minify it',
          script: 'rollup --config --sourcemap --environment MINIFY,FORMAT:umd'
        },
        main: {
          description: 'run the build with UMD',
          script: 'rollup --config --sourcemap --environment FORMAT:umd'
        }
      },
      types: {
        description: 'build the TypeScript type definitions',
        script: 'tsc --emitDeclarationOnly'
      },
      andTest: series.nps('build', 'test.size')
    },
    docs: {
      description: 'Generates table of contents in README',
      script: 'doctoc README.md'
    },
    lint: {
      description: 'lint the entire project',
      script: 'eslint .'
    },
    prettier: {
      description: 'Runs prettier on everything',
      script: 'prettier --write "**/*.([jt]s*)"'
    },
    validate: {
      description:
        'This runs several scripts to make sure things look good before committing or on clean install',
      default: concurrent.nps('lint', 'build.andTest', 'test')
    }
  },
  options: {
    silent: false
  }
}
