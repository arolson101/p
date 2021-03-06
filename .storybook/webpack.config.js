var webpack = require("webpack");
var genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');
const path = require('path');
const fs = require("fs");

module.exports = function (config, env) {
    var config = genDefaultConfig(config, env);

    config.target = 'web';

    config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        include: [/stories/, /components/, /src/],
        loaders: [
            'react-hot-loader/webpack',
            'ts-loader?configFile=tsconfig.app.json'
        ]
    })

    // config.module.rules.push({
    //     test:/\.js$/,
    //     loader: 'babel-loader',
    //     exclude: /node_modules/,
    //     include: [/stories/, /components/],
    //     query: {
    //         presets: ['react', 'es2015', "stage-0"]
    //     }
    // })

    config.resolve.extensions.push(".tsx");
    config.resolve.extensions.push(".ts");
    config.resolve.extensions.push(".js");

    config.resolve.modules = [
        path.resolve(__dirname, "..", "src"),
        "node_modules",
    ]

    config.plugins.push(
        // new webpack.DllReferencePlugin({
        //     context: path.resolve(__dirname, ".."),
        //     name: 'electron_dll',
        //     manifest: require("../app/dev_electron_dll.json"),
        //     sourceType: "commonsjs2"
        //   }),

        // production defines
        new webpack.DefinePlugin({
            __DEVELOPMENT__: true,
            __TEST__: 1
        })
    )

    config.externals = {
        'jsdom': 'window',
        'cheerio': 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': 'window',
        'react/addons': true,
    }

    // config.externals = {
    //     'ws': true,
    //     'sqlite3': 'commonjs cross-sqlcipher',
    //     'pouchdb': 'commonjs pouchdb',
    //     'leveldown': 'commonjs leveldown',
    //     'leveldown/package': 'commonjs leveldown/package',
    // };

    // fs.readdirSync(path.join(__dirname, '..', 'node_modules'))
    //     .filter(function(x) {
    //         return ['.bin'].indexOf(x) === -1;
    //     })
    //     .forEach(function(mod) {
    //         config.externals[mod] = 'commonjs ' + mod;
    // });

    return config;
};
