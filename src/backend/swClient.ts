import path from "path"
import fs from "fs"
import webpack from "webpack"

function writeDeps() {
  const curPackage = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
  const depList = {
    prodPackages: Object.keys(curPackage.dependencies),
    devPackages: Object.keys(curPackage.devDependencies),
    sysPackages: [
      { id: "cerbot", url: "https://github.com/certbot/certbot#readme" },
      { id: "coturn", url: "https://github.com/coturn/coturn#readme" },
      { id: "ffmpeg", url: "https://ffmpeg.org" }
    ]
  }
  fs.writeFileSync("./dist/db/deps.json", JSON.stringify(depList), "utf-8")
}

async function compileServiceWorkers() {
  writeDeps()
  console.log("compiling service worker")
  const wp = webpack({
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
  })
  if (!wp) {
    console.log("service worker failed to compile")
    return
  }
  wp.run((err, _) => {
    if (err) {
      console.error(err)
      return
    }
    console.log("service worker compiled successfully")
  })
}
compileServiceWorkers()
