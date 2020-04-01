const path = require('path')
const fs = require('fs')

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [new DtsBundlePlugin()],
    output: {
        filename: 'index.js',
        libraryTarget: "umd",
        path: path.resolve(__dirname, 'dist'),
    },
}

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function(compiler) {
    compiler.plugin('done', function() {
        var dts = require('dts-bundle')

        dts.bundle({
            name: 'tdr',
            main: 'src/index.d.ts',
            out: '../dist/index.d.ts',
            removeSource: true,
            outputAsModuleFolder: true, // to use npm in-package typings
        })
    })
}
