import fs from "fs"
import app from "./app"
import { startModelRemover } from "./controller/genai.controller"
import cfg from "./main/cfg"
import logger from "./main/logger"
import { getServerReady } from "./main/prepare"
import { terminateAllCalls } from "./controller/call.controller"
import MongoConnection from "./main/database"

const PORT: number = cfg.APP_PORT as number

async function startServer() {
  await getServerReady()
  await terminateAllCalls()
  app.listen(PORT, () => {
    startModelRemover()
    console.log("--------")
    logger.success(`HOMEPAGE >> http://localhost:${PORT}`)
    logger.success(`APP >> http://localhost:${PORT}/app`)
    logger.success("Running ✔✔✔")
    console.log(" ")
    console.log(" ")
    console.log("Kirimin Chat App is licensed under")
    console.log("The GNU General Public License v3.0")
    console.log(" ")
    console.log("https://www.gnu.org/licenses/gpl-3.0.html#license-text")
    console.log(" ")
    console.log(" ")
  })
}

console.log("--------")
if (!fs.existsSync("./dist")) fs.mkdirSync("./dist")
if (!fs.existsSync("./dist/sessions")) {
  fs.mkdirSync("./dist/sessions")
  logger.info("Sessions Reloaded!")
  console.log("--------")
}

const mongoConnection = new MongoConnection(cfg.DB_URI)
mongoConnection.connect(() => startServer())
