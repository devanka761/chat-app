import path from "path"
import { Configuration } from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import { CleanWebpackPlugin } from "clean-webpack-plugin"

const appConfig = {
  entry: {
    app: "./src/frontend/app.ts",
    home: "./src/frontend/home.ts",
    invite: "./src/frontend/invite.ts",
    privacy: "./src/frontend/legal.ts",
    terms: "./src/frontend/legal.ts",
    404: "./src/frontend/404.ts"
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
    },
    invite: {
      title: "invite",
      filename: "invite.ejs",
      template: "invite.ejs",
      chunks: ["invite"]
    },
    privacy: {
      title: "privacy",
      filename: "privacy.ejs",
      template: "privacy.ejs",
      chunks: ["privacy"]
    },
    terms: {
      title: "terms",
      filename: "terms.ejs",
      template: "terms.ejs",
      chunks: ["terms"]
    },
    404: {
      title: "404",
      filename: "404.ejs",
      template: "404.ejs",
      chunks: ["404"]
    }
  }
}
const plugins: (CleanWebpackPlugin | MiniCssExtractPlugin | HtmlWebpackPlugin)[] = [
  new CleanWebpackPlugin(),
  new MiniCssExtractPlugin({
    filename: "[name]-[contenthash].css"
  })
]

Object.values(appConfig.entries).forEach((entryInfo, _entryName) => {
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

const entry: { [key: string]: string } = Object.keys(appConfig.entry).reduce((entries, entry, _entryName) => {
  entries[entry] = appConfig.entry[entry]
  return entries
}, {})

const config: Configuration = {
  mode: "production",
  entry,
  output: {
    path: path.resolve(__dirname, "public/bundle"),
    filename: "[name]-[contenthash].js",
    clean: true
  },
  plugins,
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".scss"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    firefox: "60",
                    chrome: "58",
                    safari: "10",
                    edge: "18"
                  }
                }
              ],
              "@babel/preset-typescript"
            ]
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      }
    ]
  }
}

export default config
