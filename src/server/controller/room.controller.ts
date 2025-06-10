// import fs from "fs"
import { ChatDB } from "../../client/types/db.types"
import { IMessageWriter } from "../../client/types/message.types"
import { IRoomFind } from "../../client/types/room.types"
import db from "../main/db"
import { DBPerKey } from "../types/db.types"
// import db from "../main/db"
// import cfg from "../main/cfg"
import { IRepBackRec } from "../types/validate.types"

export function sendMessage(uid: string, room: IRoomFind, s: IMessageWriter): IRepBackRec {
  // console.log(uid)
  // console.log(s)
  const fkey = room.type === "user" ? "c" : "g"
  const cdb = db.ref[fkey]
  let chatkey =
    room.type === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === room.id)
        })
      : Object.keys(cdb).find((k) => k === room.id)
  if (room.type === "group" && !chatkey) return { code: 404 }
  if (room.type === "user" && !chatkey) {
    chatkey = "c" + Date.now().toString(36)
    db.ref.c[chatkey] = {
      u: [uid, room.id],
      c: chatkey
    }
    db.save("c")
  }
  const roomkey = chatkey as string
  const oldChat = db.fileGet(roomkey, room.type)
  const roomChat: { [key: string]: IMessageWriter } = oldChat ? { ...oldChat } : {}

  const chat_id = "c" + Date.now().toString(36)
  roomChat[chat_id] = s

  db.fileSet(roomkey, room.type, roomChat as DBPerKey)

  return { code: 200, data: { roomid: chatkey as string, chat: { ...normalizeMessage(chat_id, roomChat[chat_id]) } } }
}

export function normalizeMessage(msgid: string, oldmsg: IMessageWriter): ChatDB {
  return { ...oldmsg, id: msgid } as ChatDB
}
