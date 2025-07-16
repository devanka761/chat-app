const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const appConfig = {
  entry: {
    app: "./src/frontend/app.ts",
    // home: "./src/frontend/home.ts",
    invite: "./src/frontend/invite.ts"
  },
  entries: {
    app: {
      title: "app",
      filename: "app.ejs",
      template: "app.ejs",
      chunks: ["app"]
    },
    //   home: {
    //     title: "home",
    //     filename: "home.ejs",
    //     template: "home.ejs",
    //     chunks: ["home"]
    //   },
    invite: {
      title: "invite",
      filename: "invite.ejs",
      template: "invite.ejs",
      chunks: ["invite"]
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
      inject: "head",
      scriptLoading: "defer"
    })
  )
})

const entry = Object.keys(appConfig.entry).reduce((entries, entry, entryName) => {
  entries[entry] = appConfig.entry[entry]
  return entries
}, {})

module.exports = {
  mode: "development",
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
            presets: ["@babel/preset-typescript"]
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      }
    ]
  },
  watch: true
}
