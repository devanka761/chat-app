import push from "web-push"
import serverConfig from "../../config/server.config.json"
import db from "./db"
import logger from "./logger"

export function getServerReady(): void {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendPushNotification(userid: string, content: any): void {
  const subs = db.ref.u[userid].zzz
  const client = db.ref.u[userid].socket
  if (!subs || client) return
  push.sendNotification(subs, JSON.stringify(content)).catch((err) => {
    logger.error(err)
    delete db.ref.u[userid].zzz
    db.save("u")
  })
}
