import { Instance, WebSocketWithHeartbeat } from "express-ws"
import logger from "../main/logger"
import { TRelay } from "../types/relay.types"
import relay from "../main/relay"
import webhookSender from "../main/webhook"
import processSocketMessages from "../controller/socket.controller"
import { forceExitCall } from "../controller/call.controller"
import User from "../models/User.Model"

function router(server: Instance) {
  const { app, getWss } = server
  app.ws("/socket", async (wsClient, req) => {
    const ws = wsClient as WebSocketWithHeartbeat
    const { id: clientId } = req.query

    const udb = await User.findOne({ id: req.user?.id || "null" })
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
    ws.isAlive = true

    webhookSender.userLog({ userid: udb.id, online: true })

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString())
        processSocketMessages({ ...msg, from: clientId, uid: udb.id })
      } catch (err) {
        console.error("Failed to parse JSON.", err)
      }
    })

    ws.on("close", async () => {
      webhookSender.userLog({ userid: udb.id, online: false })
      if (udb.socket === clientId) {
        await User.updateOne({ id: udb.id }, { $unset: { socket: "" } })
      }
      forceExitCall(udb.id)

      relay.remove(clientId)
      logger.info(`Offline  ${udb.id} ${client.id}`)
    })

    ws.on("error", (err: Error) => {
      console.error(err)
    })
    ws.on("pong", () => {
      ws.isAlive = true
    })
  })

  const interval = setInterval(() => {
    getWss().clients.forEach((client) => {
      const ws = client as WebSocketWithHeartbeat
      if (ws.isAlive === false) {
        return ws.terminate()
      }

      ws.isAlive = false
      ws.ping()
    })
  }, 7000)

  getWss().on("close", () => clearInterval(interval))
}

export default router
