const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  mode: "production",
  target: "node",
  entry: "./src/server/server.ts",
  output: {
    path: path.resolve(__dirname, "dist/bundle"),
    filename: "bundle.js"
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  devtool: false
}
