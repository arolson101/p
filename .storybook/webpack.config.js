var genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');
const path = require('path');
const fs = require("fs");

module.exports = function (config, env) {
    var config = genDefaultConfig(config, env);

    config.target = 'electron-renderer';

    config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        include: [/stories/, /components/, /src/],
        use: [
            'babel-loader',
            'awesome-typescript-loader'
        ]
    })

    config.module.rules.push({
        test:/\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: [/stories/, /components/],
        query: {
            presets: ['react', 'es2015', "stage-0"]
        }
    })

    config.resolve.extensions.push(".tsx");
    config.resolve.extensions.push(".ts");
    config.resolve.extensions.push(".js");

    config.externals = {
        'ws': true,
        'sqlite3': 'commonjs cross-sqlcipher',
        'pouchdb': 'commonjs pouchdb',
        'leveldown': 'commonjs leveldown',
        'leveldown/package': 'commonjs leveldown/package',
    };

    fs.readdirSync(path.join(__dirname, '..', 'node_modules'))
        .filter(function(x) {
            return ['.bin'].indexOf(x) === -1;
        })
        .forEach(function(mod) {
            config.externals[mod] = 'commonjs ' + mod;
    });

    return config;
};
