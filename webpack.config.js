var webpack = require("webpack");
var fs = require("fs");
var path = require("path");
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;


if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}
const __DEVELOPMENT__ = (process.env.NODE_ENV == 'development');


var nodeModules = {};
fs.readdirSync(path.join(__dirname, 'node_modules'))
//["sqlite3", "filist", "i18next", "rrule", "faker", "sockjs-client"]
//	.concat(["electron", "fs", "path"])
  .filter(function(x) {
    return ['.bin', 'react-fa'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });


module.exports = {
  context: path.join(__dirname, 'src'),
  entry: [
    "./index.ts"
  ],
  output: {
    devtoolModuleFilenameTemplate: (info) => `file:///${path.normalize(info.resourcePath).replace(/\\/g, '/')}`,
    path: path.join(__dirname, "app"),
    filename: "p.js",
    library: "p"
  },

  //externals: nodeModules,

  target: 'electron',

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
  },

  module: {
    loaders: [
      { test: /\.tsx?$/, loaders: ['react-hot-loader/webpack', 'awesome-typescript-loader?forkChecker=true'] },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.(svg|woff|woff2|ttf|eot)($|\?)/, loader: "file?name=fonts/[name].[ext]" },
      { test: /\.(png|gif|jpg)($|\?)/, loader: "file?name=images/[name].[ext]" },
    ],

    preLoaders: [
      //{ test: /\.tsx?$/, loader: "tslint" },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" }
    ]
  },

  tslint: {
//    emitErrors: true,
//    failOnHint: true
  },

  plugins: [
    new ForkCheckerPlugin(),

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


if (!__DEVELOPMENT__) {
	module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		},
		test: /\.jsx?($|\?)/i
	}));
}
