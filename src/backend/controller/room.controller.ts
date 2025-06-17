import fs from "fs"
import db from "../main/db"
import { TRoomTypeF } from "../../frontend/types/room.types"
import { IWritterF } from "../../frontend/types/message.types"
import { IRepTempB } from "../types/validate.types"
import { convertMessage, minimizeMessage, msgNotValid, normalizeMessage } from "../main/helper"
import { IMessageTempF } from "../../frontend/types/db.types"
import { IMessageKeyB } from "../types/db.types"

const msgValidTypes = ["audio", "file", "video", "image"]

export function sendMessage(uid: string, room_id: string, room_type: TRoomTypeF, s: IWritterF): IRepTempB {
  if (s.text) s.text = s.text.trim()
  const notvalid = msgNotValid(s)
  if (notvalid) return { code: 400, msg: notvalid }
  let isFirst = false
  const cdb = db.ref.c
  let chatkey =
    room_type === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === room_id)
        })
      : Object.keys(cdb).find((k) => k === room_id)
  if (s.edit && !chatkey) return { code: 400 }
  if (s.edit && chatkey) return editMessage(uid, chatkey, room_id, room_type, s)
  if (room_type === "group" && !chatkey) return { code: 404 }
  if (!chatkey) {
    isFirst = true
    chatkey = "u" + Date.now().toString(36)
    db.ref.c[chatkey] = {
      u: [uid, room_id],
      c: chatkey
    }
    db.save("c")
  }

  const dbOld = (db.fileGet(chatkey, "room") || {}) as IMessageKeyB
  const newChat: IMessageTempF = convertMessage(uid, s)

  if (s.type) {
    newChat.type = s.type
    if (msgValidTypes.find((vt) => vt === s.type) || s.type === "voice") {
      const dataurl = decodeURIComponent(s.filesrc as string)
      const buffer = Buffer.from(dataurl.split(",")[1], "base64")
      if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }
      const uniq = Date.now().toString(36)
      const fpath = "./dist/stg/room"
      if (!fs.existsSync(`${fpath}`)) fs.mkdirSync(`${fpath}`)
      if (!fs.existsSync(`${fpath}/${chatkey}`)) fs.mkdirSync(`${fpath}/${chatkey}`)
      const fname = s.type === "voice" ? `VN${uniq.toUpperCase()}.ogg` : `${uniq}_${s.filename}`
      fs.writeFileSync(`${fpath}/${chatkey}/${fname}`, buffer, "base64")
      newChat.source = fname
    }
  }

  const chat_id = "c" + Date.now().toString(36)

  dbOld[chat_id] = minimizeMessage(uid, newChat)
  db.fileSet(chatkey, "room", dbOld)

  return { code: 200, data: { isFirst, roomid: chatkey, chat: { ...newChat, id: chat_id } } }
}

export function editMessage(uid: string, chatkey: string, room_id: string, room_type: TRoomTypeF, s: IWritterF): IRepTempB {
  if (!s.edit) return { code: 404 }
  if (!chatkey) return { code: 404 }
  const cdb = db.ref.c[chatkey]
  if (!cdb) return { code: 404 }

  const dbOld = (db.fileGet(chatkey, "room") || {}) as IMessageKeyB

  if (!dbOld[s.edit]) return { code: 404 }
  if ((!dbOld[s.edit].ty || dbOld[s.edit].ty === "text") && (!s.text || s.text.length < 1)) {
    return { code: 404, msg: "CONTENT_EMPTY" }
  }
  if (dbOld[s.edit].ty === "deleted") {
    return { code: 404, msg: "MSG_EDIT_DELETED" }
  }
  if (dbOld[s.edit].ty === "voice" || dbOld[s.edit].ty === "call") {
    return { code: 404, msg: "MSG_EDIT_OTHER" }
  }
  const oldts = dbOld[s.edit].ts || 761
  if (Date.now() > oldts + 1000 * 60 * 15) {
    return { code: 404, msg: "CONTENT_EDIT_EXPIRED" }
  }

  dbOld[s.edit].txt = s.text
  dbOld[s.edit].e = Date.now()
  db.fileSet(chatkey, "room", dbOld)

  return { code: 200, data: { isFirst: false, roomid: chatkey, chat: { ...normalizeMessage(s.edit, dbOld[s.edit]) } } }
}

export function delMessage(uid: string, room: string, target: string, message_id: string): IRepTempB {
  const cdb = db.ref.c
  const chatkey =
    room === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === target)
        })
      : Object.keys(cdb).find((k) => k === target)

  if (!chatkey) return { code: 404 }

  const roomkey = chatkey as string
  const dbOld = (db.fileGet(roomkey, "room") || {}) as IMessageKeyB
  if (!dbOld[message_id]) return { code: 404 }

  dbOld[message_id].d = true
  dbOld[message_id].txt = "deleted"
  dbOld[message_id].ty = "deleted"
  delete dbOld[message_id].r
  const sources = dbOld[message_id].i

  if (sources) {
    const fpath = "./dist/stg/room"
    if (!fs.existsSync(`${fpath}`)) fs.mkdirSync(`${fpath}`)
    if (!fs.existsSync(`${fpath}/${chatkey}`)) fs.mkdirSync(`${fpath}/${chatkey}`)
    if (fs.existsSync(`${fpath}/${chatkey}/${sources}`)) fs.rmSync(`${fpath}/${chatkey}/${sources}`, { force: true })
  }
  delete dbOld[message_id].i
  db.fileSet(chatkey, "room", dbOld)

  return { code: 200, data: { roomid: chatkey } }
}
