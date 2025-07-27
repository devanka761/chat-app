import push from "web-push"
import serverConfig from "../../config/server.config.json"
import db from "./db"
import logger from "./logger"

export default function getServerReady() {
  db.load()

  if (!db.ref.k.v) {
    db.ref.k.v = 1
    db.save("k")
  }

  if (serverConfig.update) {
    db.ref.k.v++
    db.save("k")
  }

  console.log("--------")
  if (!db.ref.k.privateKey || !db.ref.k.publicKey || db.ref.k.publicKey.length < 16 || db.ref.k.privateKey.length < 16) {
    logger.info("Vapid Keys: Regenerated")
    const vapidKeys = push.generateVAPIDKeys()
    db.ref.k.publicKey = vapidKeys.publicKey
    db.ref.k.privateKey = vapidKeys.privateKey
    db.save("k")
  }
  logger.success("Vapid Keys: Loaded")
  push.setVapidDetails("mailto:contact@devanka.id", db.ref.k.publicKey, db.ref.k.privateKey)
}
