var genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');
const path = require('path');

module.exports = function (config, env) {
    var config = genDefaultConfig(config, env);

    config.module.rules.push({
        test: /\.tsx?$/,
        exclude: /node_modules/,
        include: [/stories/, /components/],
        loader: 'ts-loader'
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

    return config;
};
