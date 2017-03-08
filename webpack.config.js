var webpack = require("webpack");
var fs = require("fs");
var path = require("path");
var CopyWebpackPlugin = require('copy-webpack-plugin');

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}
const __DEVELOPMENT__ = (process.env.NODE_ENV == 'development');


var externals = {
  'ws': true,
  'sqlite3': 'commonjs cross-sqlcipher',
  'pouchdb': 'commonjs pouchdb',
  'leveldown': 'commonjs leveldown',
  'leveldown/package': 'commonjs leveldown/package',
};

if (__DEVELOPMENT__) {
  fs.readdirSync(path.join(__dirname, 'node_modules'))
    .filter(function(x) {
      return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
      externals[mod] = 'commonjs ' + mod;
    });
}

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: {
    p: ["./index.tsx"]
  },
  output: {
    devtoolModuleFilenameTemplate: (info) => `file:///${path.normalize(info.absoluteResourcePath).replace(/\\/g, '/')}`,
    path: path.join(__dirname, "app"),
    filename: "[name].js",
    library: "p",
    publicPath: "/"
  },
  devServer: {
    contentBase: path.join(__dirname, 'app'),
    port: 3003
  },

  externals: externals,

  target: 'electron-renderer',

  // Enable sourcemaps for debugging webpack's output.
  devtool: "eval",
  // devtool: "sourcemaps",

  resolve: {
      extensions: [".ts", ".tsx", ".js"]
  },

  module: {
    rules: [
      { enforce: 'pre', test: /\.tsx?$/, loader: "tslint-loader", exclude: /(node_modules)/ },
      { enforce: 'pre', test: /\.js?$/, loader: "source-map-loader", exclude: [
        /intl-messageformat/,
        /intl-relativeformat/,
        /intl-format-cache/ ]
      },

      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
      { test: /\.tsx?$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader'] },
      { test: /\.(svg|woff|woff2|ttf|eot)($|\?)/, loader: "file?name=fonts/[name].[ext]" },
      { test: /\.(png|gif|jpg)($|\?)/, loader: "file?name=images/[name].[ext]" }
    ],
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
        options: {
            tslint: {
                // emitErrors: true,
                // failOnHint: true
            }
        }
    }),

    new CopyWebpackPlugin([
      { from: '../node_modules/bootstrap/dist', to: 'lib/bootstrap' },
      { from: '../node_modules/metro-ui/build', to: 'lib/metro-ui' },
      { from: '../node_modules/metro-bootstrap/dist', to: 'lib/metro-bootstrap' },
      { from: '../node_modules/font-awesome/css', to: 'lib/font-awesome/css' },
      { from: '../node_modules/font-awesome/fonts', to: 'lib/font-awesome/fonts' },
    ]),

    // globals
    new webpack.ProvidePlugin({
      //_: "lodash",
      //$: "jquery",
      //jQuery: "jquery",
      //"window.jQuery": "jquery",
      "React": "react",
      "ReactBootstrap": "react-bootstrap",
      //"ofx4js": "ofx4js",
    }),

    // production defines
    new webpack.DefinePlugin({
      __DEVELOPMENT__,
      __TEST__: 0
    }),
  ],

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  // externals: {
  //     "react": "React",
  //     "react-dom": "ReactDOM"
  // },
};


if (__DEVELOPMENT__) {
  module.exports.entry.p.push('webpack/hot/only-dev-server')
  module.exports.entry.p.push('react-hot-loader/patch')
	module.exports.plugins.push(new webpack.NamedModulesPlugin())
} else {
  module.exports.devtool = "sourcemaps"
	// module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
	// 	compress: {
	// 		warnings: false
	// 	},
	// 	test: /\.jsx?($|\?)/i
	// }));
}
