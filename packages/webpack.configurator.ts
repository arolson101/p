import * as webpack from 'webpack'
import * as fs from 'fs'
import * as path from 'path'

export interface Config {
  name: string
  entry: string[]
  lib?: boolean
  dll?: boolean
  target?: string
}

const makeName = (name: string, dev: boolean) => `${dev ? 'dev_' : ''}${name}`

export const configurator = (dirname: string, config: Config, dev: boolean = true): webpack.Configuration => ({
  // context: path.join(dirname, 'src'),
  entry: {
    [makeName(config.name, dev)]: config.entry
  },
  output: {
    // devtoolModuleFilenameTemplate: (info) => `file:///${path.normalize(info.absoluteResourcePath).replace(/\\/g, '/')}`,
    path: path.join(__dirname, '..', 'dist'),
    filename: '[name].js',
    ...(config.lib ? { library: config.name } : {}),
    publicPath: '/'
  },

  target: config.target || 'web',

  // Enable sourcemaps for debugging webpack's output.
  devtool: dev ? 'eval' : 'source-map',

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
      { test: /\.tsx?$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'] },
      { test: /\.(svg|woff|woff2|ttf|eot)($|\?)/, loader: 'file?name=fonts/[name].[ext]' },
      { test: /\.(png|gif|jpg)($|\?)/, loader: 'file?name=images/[name].[ext]' }
    ],
  },

  plugins: [
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
