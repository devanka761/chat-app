import db from "../main/db"
import relay from "../main/relay"
import { ISocketB, TSocketHandlerB } from "../types/relay.types"
import { getUser } from "./profile.controller"

const socketMessage: TSocketHandlerB = {
  offer: (uid, from, data) => {
    if (!data.to) return
    const udb = db.ref.u[data.to as string]
    if (!udb || !udb.socket) return
    const peerid = udb.socket
    const target = relay.get(peerid)
    const user = getUser(data.to as string, uid)
    if (target && target.socket.readyState === WebSocket.OPEN) {
      target.socket.send(JSON.stringify({ ...data, from, user }))
    }
  },
  answer: (uid, from, data) => {
    socketMessage.offer(uid, from, data)
  },
  candidate: (uid, from, data) => {
    socketMessage.offer(uid, from, data)
  }
}

export default function processSocketMessages(data: Partial<ISocketB>): void {
  if (!data.type || !data.from || !data.uid) return
  if (!socketMessage[data.type]) return
  socketMessage[data.type](data.uid, data.from, data)
}
