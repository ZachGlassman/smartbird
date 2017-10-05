const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        main: './index.js'
    },
    output: {
        path: path.resolve('static'),
        filename: 'index_bundle.js'
    },
    plugins: [
        new webpack
            .optimize
            .UglifyJsPlugin({minimize: true})
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.jsx$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ]
    }
};