import push from "web-push"
import serverConfig from "../../config/server.config.json"
import db from "./db"
import logger from "./logger"
import Metadata, { IMetadata, IMetadataDocument } from "../models/Metadata.Model"
import { Document, UpdateQuery } from "mongoose"

export async function getServerReady(): Promise<void> {
  const filter = { id: "761" }

  const hasMetadata: IMetadata = (await Metadata.findOne(filter)) || {}

  const updatePayload: UpdateQuery<Document<IMetadataDocument>> = {
    $setOnInsert: {
      id: "761"
    },
    $set: {
      groups: hasMetadata.groups || 0,
      version: hasMetadata.version || 0
    }
  }

  if (serverConfig.update) {
    updatePayload.$set.version++
  }

  if (hasMetadata.publicKey && hasMetadata.privateKey) {
    updatePayload.$set.publicKey = hasMetadata.publicKey
    updatePayload.$set.privateKey = hasMetadata.privateKey
  } else {
    logger.info("Vapid Keys: Regenerated")
    const vapidKeys = push.generateVAPIDKeys()
    updatePayload.$set.publicKey = vapidKeys.publicKey
    updatePayload.$set.privateKey = vapidKeys.privateKey
  }

  await Metadata.findOneAndUpdate(filter, updatePayload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  })
  logger.success("Vapid Keys: Loaded")
  push.setVapidDetails("mailto:contact@devanka.id", updatePayload.$set.publicKey, updatePayload.$set.privateKey)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sendPushNotification(userid: string, content: any): void {
  const subs = db.ref.u[userid].zzz
  const client = db.ref.u[userid].socket
  if (!subs || client) return
  push.sendNotification(subs, JSON.stringify(content)).catch((_) => {
    delete db.ref.u[userid].zzz
    db.save("u")
  })
}
