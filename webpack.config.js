const path = require("path")
const fs = require("fs")

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      crypto: false,
    },
  },
  plugins: [new DtsBundlePlugin()],
  output: {
    filename: "index.js",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "dist"),
  },
}

function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function (compiler) {
  compiler.hooks.done.tap("bundle-types", () => {
    var dts = require("dts-bundle")

    dts.bundle({
      name: "tdr",
      main: "src/index.d.ts",
      out: "../dist/index.d.ts",
      removeSource: true,
      outputAsModuleFolder: true, // to use npm in-package typings
    })
  })
}
