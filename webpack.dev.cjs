const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const appConfig = {
  entry: {
    app: "./src/client/app.ts",
    home: "./src/client/home.ts"
  },
  entries: {
    app: {
      title: "app",
      filename: "app.ejs",
      template: "app.ejs",
      chunks: ["app"]
    },
    home: {
      title: "home",
      filename: "home.ejs",
      template: "home.ejs",
      chunks: ["home"]
    }
  }
}
const plugins = [
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: "[name].css"
  })
]
Object.values(appConfig.entries).forEach((entryInfo, entryName) => {
  plugins.push(
    new HtmlWebpackPlugin({
      title: entryInfo.title,
      filename: path.join(__dirname, "./views/" + entryInfo.filename),
      template: "!!raw-loader!./templates/" + entryInfo.template,
      chunks: entryInfo.chunks,
      publicPath: "/bundle",
      chunksSortMode: "manual",
      inject: "body",
      scriptLoading: "module"
    })
  )
})

const entry = Object.keys(appConfig.entry).reduce((entries, entry, entryName) => {
  entries[entry] = appConfig.entry[entry]
  return entries
}, {})

module.exports = {
  mode: "development",
  target: ["web", "es6"],
  entry,
  output: {
    path: path.resolve(__dirname, "public/bundle"),
    filename: "[name].js",
    clean: true
  },
  plugins,
  resolve: {
    extensions: [".ts", ".js", ".scss"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }], "@babel/preset-typescript"]
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      }
    ]
  },
  devtool: false,
  watch: true
}
