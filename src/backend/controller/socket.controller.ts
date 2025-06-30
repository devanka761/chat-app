import db from "../main/db"
import relay from "../main/relay"
import zender from "../main/zender"
import { IMessageKeyB } from "../types/db.types"
import { ISocketB, TSocketHandlerB } from "../types/relay.types"
import { getUser } from "./profile.controller"

const socketMessage: TSocketHandlerB = {
  calls: (uid, from, data) => {
    if (!data.to) return
    const udb = db.ref.u[data.to as string]
    if (!udb || !udb.socket) {
      const sender = relay.get(from)
      if (sender) {
        const user = getUser(uid, data.to as string)
        sender.socket.send(JSON.stringify({ type: "calloffline", user }))
      }
      return
    }
    const peerid = udb.socket
    const target = relay.get(peerid)
    const user = getUser(data.to as string, uid)
    if (target && target.socket.readyState === WebSocket.OPEN) {
      target.socket.send(JSON.stringify({ ...data, user }))
    }
  },
  offer: (uid, from, data) => {
    socketMessage.calls(uid, from, data)
  },
  answer: (uid, from, data) => {
    socketMessage.calls(uid, from, data)
  },
  candidate: (uid, from, data) => {
    socketMessage.calls(uid, from, data)
  },
  hangup: (uid, from, data) => {
    socketMessage.calls(uid, from, data)
  },
  reject: (uid, from, data) => {
    socketMessage.calls(uid, from, data)
  },
  readAllMessages: (uid, from, data) => {
    const { roomid, roomtype } = data
    if (!roomid || !roomtype) return
    const cdb = db.ref.c
    const chatkey =
      roomtype === "user"
        ? Object.keys(cdb).find((k) => {
            return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === roomid)
          })
        : Object.keys(cdb).find((k) => cdb[k].t === "group" && k === roomid && cdb[k].u.find((usr) => usr === uid))
    if (!chatkey) return
    const dbOld = (db.fileGet(chatkey, "room") || {}) as IMessageKeyB
    Object.keys(dbOld).forEach((k) => {
      if (dbOld[k].u !== uid && (!dbOld[k].w || !dbOld[k].w.find((usr) => usr === uid))) {
        if (!dbOld[k].w) dbOld[k].w = []
        dbOld[k].w.push(uid)
      }
    })
    db.fileSet(chatkey, "room", dbOld)
    const dataZender = { roomid }
    cdb[chatkey].u.forEach((usr) => zender(uid, usr, "readAllMessages", dataZender))
  }
}

export default function processSocketMessages(data: Partial<ISocketB>): void {
  if (!data.type || !data.from || !data.uid) return
  if (!socketMessage[data.type]) return
  socketMessage[data.type](data.uid, data.from, data)
}
