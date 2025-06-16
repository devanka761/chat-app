import fs from "fs"
import db from "../main/db"
import { IMessageTempF } from "../../interfaces/dbclient.interfaces"
import { IWriteF } from "../../interfaces/message.interfaces"
import { IRepTempB } from "../../interfaces/validate.interfaces"
import { RoomType } from "../../types/messages.types"
import { IChatKeyB } from "../../interfaces/dbserver.interfaces"
import { convertMessage, minimizeMessage, normalizeMessage } from "../main/helper"

const msgValidTypes = ["audio", "file", "video", "image"]

function msgNotValid(s: IWriteF): string | null {
  if ((!s.type || s.type === "text") && (!s.text || s.text.length < 1)) {
    return "MSG_TEXT_REQUIRED"
  } else if (msgValidTypes.find((vt) => vt === s.type) && (!s.filename || !s.filesrc)) {
    return "MSG_NO_FILE_SENT"
  } else if (s.type === "voice" && !s.filesrc) {
    return "MSG_NO_AUDIO_SENT"
  }
  if (s.text && s.text.length > 500) return "MSG_TEXT_LENGTH"
  if (s.filename && s.filename.length > 100) return "FILENAME_LENGTH"
  return null
}

export function sendMessage(uid: string, room: RoomType, target: string, s: IWriteF): IRepTempB {
  if (s.text) s.text = s.text.trim()
  const notvalid = msgNotValid(s)
  if (s.edit) return editMessage(uid, room, target, s)
  if (notvalid) return { code: 400, msg: notvalid }
  let isFirst = false
  const cdb = db.ref.c
  let chatkey =
    room === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === target)
        })
      : Object.keys(cdb).find((k) => k === target)

  if (s.edit && !chatkey) return { code: 400 }
  if (room === "group" && !chatkey) return { code: 404 }
  if (!chatkey) {
    isFirst = true
    chatkey = "u" + Date.now().toString(36)
    db.ref.c[chatkey] = {
      u: [uid, target],
      c: [chatkey],
      t: "user"
    }
    db.save("c")
  }

  const dbOld = (db.fileGet(chatkey, "room") || {}) as IChatKeyB
  const newChat: IMessageTempF = { ...convertMessage(uid, s) }

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

export function editMessage(uid: string, room: RoomType, target: string, s: IWriteF): IRepTempB {
  if (!s.edit) return { code: 404 }
  const cdb = db.ref.c
  const chatkey =
    room === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === target)
        })
      : Object.keys(cdb).find((k) => k === target)

  if (!chatkey) return { code: 404 }

  const dbOld = (db.fileGet(chatkey, "room") || {}) as IChatKeyB
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
  const dbOld = (db.fileGet(roomkey, "room") || {}) as IChatKeyB
  if (!dbOld[message_id]) return { code: 404 }

  dbOld[message_id].d = true
  dbOld[message_id].txt = ""
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
