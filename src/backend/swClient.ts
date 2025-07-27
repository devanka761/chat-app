import path from "path"
import webpack from "webpack"
import logger from "./main/logger"

function compileServiceWorkers() {
  console.log("compiling service worker")
  webpack({
    entry: "./src/frontend/sw.ts",
    output: {
      path: path.resolve(__dirname, "../../public/bundle"),
      filename: "sw.js",
      clean: false
    },
    resolve: {
      extensions: [".ts", ".js", ".scss"]
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
                      ie: "11",
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
        }
      ]
    }
  }).run((err, _) => {
    if (err) {
      logger.error(err)
      return
    }
    console.log("service worker compiled successfully")
  })
}
compileServiceWorkers()
