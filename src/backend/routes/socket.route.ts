import { Request } from "express"
import { Application } from "express-ws"
import { RawData, WebSocket } from "ws"
import logger from "../main/logger"
import db from "../main/db"
import { TRelay } from "../types/relay.types"
import relay from "../main/relay"
import webhookSender from "../main/webhook"
import processSocketMessages from "../controller/socket.controller"
import { forceExitCall } from "../controller/call.controller"

function router(app: Application) {
  app.ws("/socket", (ws: WebSocket, req: Request) => {
    const { id: clientId } = req.query
    // console.log(clientId)
    const udb = db.ref.u[req.user?.id || "null"]
    if (!clientId || !udb) {
      logger.info("❌ Connection rejected: no client ID")
      ws.close()
      return
    }

    if (udb.socket !== clientId) {
      logger.info(`❌ Connection rejected: client with id ${clientId} is not found`)
      ws.close()
      return
    }

    const client: TRelay = relay.add(clientId, ws)
    logger.info(`Online   ${udb.id} ${client.id}`)

    webhookSender.userLog({ userid: udb.id, online: true })

    ws.on("error", (err: Error) => {
      console.error(err)
    })

    ws.on("close", () => {
      webhookSender.userLog({ userid: udb.id, online: false })
      if (udb.socket === clientId) delete db.ref.u[udb.id].socket
      forceExitCall(udb.id)

      relay.remove(clientId)
      logger.info(`Offline  ${udb.id} ${client.id}`)
    })

    ws.on("message", (data: RawData) => {
      try {
        const msg = JSON.parse(data.toString())
        processSocketMessages({ ...msg, from: clientId, uid: udb.id })
      } catch (err) {
        console.error("Failed to parse JSON.", err)
      }
    })
  })
}

export default router
