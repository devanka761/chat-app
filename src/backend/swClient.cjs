const path = require("path")
const fs = require("fs")
const webpack = require("webpack")
const curPackage = require("../../package.json")

function writeDeps() {
  const depList = {
    dependencies: Object.keys(curPackage.dependencies),
    devDependencies: Object.keys(curPackage.devDependencies),
    others: [
      { id: "cerbot", url: "https://github.com/certbot/certbot#readme" },
      { id: "coturn", url: "https://github.com/coturn/coturn#readme" }
    ]
  }
  fs.writeFileSync("./dist/db/deps.json", JSON.stringify(depList), "utf-8")
}

async function compileServiceWorkers() {
  writeDeps()
  console.log("compiling service worker")
  webpack({
    entry: "./src/frontend/sw.ts",
    output: {
      path: path.resolve(__dirname, "../../public"),
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
      console.error(err)
      return
    }
    console.log("service worker compiled successfully")
  })
}
compileServiceWorkers()
