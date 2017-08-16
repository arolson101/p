import * as webpack from 'webpack'
import * as fs from 'fs'
import * as path from 'path'

export interface Config {
  name: string
  entry: string[]
  lib?: boolean
  target?: 'web' | 'node' | 'electron-renderer'
}

const externals = {
  'ws': true,
  'sqlite3': 'commonjs cross-sqlcipher',
  'pouchdb': 'commonjs pouchdb',
  'leveldown': 'commonjs leveldown',
  'leveldown/package': 'commonjs leveldown/package',
  // 'googleapis': 'commonjs googleapis'
}

const makeName = (name: string, dev: boolean) => `${dev ? 'dev_' : ''}${name}`

const configurator = (dirname: string, config: Config, dev: boolean = true): webpack.Configuration => ({
  // context: path.join(dirname, 'src'),
  entry: {
    [makeName(config.name, dev)]: config.entry
  },
  output: {
    // devtoolModuleFilenameTemplate: (info) => `file:///${path.normalize(info.absoluteResourcePath).replace(/\\/g, '/')}`,
    path: path.join(__dirname, 'app'),
    filename: '[name].js',
    ...(config.lib ? { library: config.name } : {}),
    publicPath: '/'
  },

  target: config.target || 'web',

  // Enable sourcemaps for debugging webpack's output.
  devtool: dev ? 'eval' : 'source-map',

  externals,

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [
      { enforce: 'pre', test: /\.tsx?$/, loader: 'tslint-loader', exclude: /(node_modules)/ },
      { enforce: 'pre', test: /\.js?$/, loader: 'source-map-loader', exclude: [
        /intl-messageformat/,
        /intl-relativeformat/,
        /intl-format-cache/ ]
      },

      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
      { test: /\.tsx?$/, loaders: [
        'react-hot-loader/webpack',
        'ts-loader?configFileName=tsconfig.app.json'
      ] },
      { test: /\.(svg|woff|woff2|ttf|eot)($|\?)/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.(png|gif|jpg)($|\?)/, loader: 'file?name=images/[name].[ext]' }
    ],
  },

  plugins: [
    new webpack.DllPlugin({
      context: __dirname,
      name: '[name]',
      path: path.join(__dirname, 'app', makeName(config.name, dev) + '.json'),
    }),

    new webpack.LoaderOptionsPlugin({
      options: {
        tslint: {
          // typeCheck: true,
          // emitErrors: true,
          // failOnHint: true
        }
      }
    }),

    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
      }
    }),

    ...(dev ? [
      new webpack.NamedModulesPlugin()
    ] : [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        test: /\.jsx?($|\?)/i
      })
    ])
  ],
})

const coreLibs = [
  'docuri',
  'filist/filist.json',
  'history',
  'jsondiffpatch',
  'level-updown',
  'memorystream',
  'moment',
  'numeral',
  'ofx4js',
  'pouch-resolve-conflicts',
  'pouchdb',
  'pouchdb-replication-stream',
  'prop-types',
  'ramda',
  'react-intl',
  'react-intl/locale-data/en', // ?
  'react-router-redux',
  'react-router',
  'react',
  'redux-devtools-extension',
  'redux-form',
  'redux-thunk',
  'redux',
  'reselect',
  'rrule-alt',
  'rxjs/Rx',
  'transform-pouch',
]

const electronLibs = [
  'autobind-decorator',
  'axios',
  'axios/lib/adapters/http',
  'history/createHashHistory',
  'levelup',
  'lodash.debounce',
  'randomcolor',
  'react-addons-perf', // dev?
  'react-bootstrap',
  'react-color',
  'react-datepicker',
  'react-datepicker/dist/react-datepicker.css',
  'react-desktop/macOs',
  'react-desktop/windows',
  'react-dev-utils/webpackHotDevClient', // dev
  'react-dom',
  'react-dom/lib/ReactPerf', // dev
  'react-helmet',
  'react-hot-loader', // dev
  'react-hot-loader/patch', // dev
  'react-hot-loader/lib', // dev
  'react-redux',
  'react-router-dom',
  'react-select',
  'react-select/dist/react-select.css',
  'react-sortable-hoc',
  'react-split-pane',
  'react-virtualized',
  'react-virtualized/styles.css',
  'recompose',
  'recompose/rxjsObservableConfig',
]

const electronCfg = (dev: boolean) => configurator(
  __dirname,
  {
    name: 'electron_dll',
    entry: [...coreLibs, ...electronLibs],
    lib: true,
    target: 'electron-renderer'
  },
  dev
)

export default [
  electronCfg(false),
  electronCfg(true)
]
