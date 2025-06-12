import fs from "fs"
import { ChatDB, CIChatObject, IChatCl } from "../../client/types/db.types"
import { IMessageWriter } from "../../client/types/message.types"
import { IRoomFind } from "../../client/types/room.types"
import db from "../main/db"
import { ChatObject, IChatDBAPI } from "../types/db.types"
// import cfg from "../main/cfg"
import { IRepBackRec } from "../types/validate.types"

const msgValidTypes = ["audio", "file", "video", "image"]

function msgNotValid(s: IMessageWriter): string | null {
  if (s.type === "text" && (!s.text || s.text.length < 1)) {
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

export function sendMessage(uid: string, room: IRoomFind, s: IMessageWriter): IRepBackRec {
  if (s.text) s.text = s.text.trim()
  const notvalid = msgNotValid(s)
  if (notvalid) return { code: 400, msg: notvalid }
  let isFirst = false
  const fkey = room.type === "user" ? "c" : "g"
  const cdb = db.ref[fkey]
  let chatkey =
    room.type === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === room.id)
        })
      : Object.keys(cdb).find((k) => k === room.id)

  if (s.edit && !chatkey) return { code: 400 }
  if (room.type === "group" && !chatkey) return { code: 404 }
  if (room.type === "user" && !chatkey) {
    isFirst = true
    chatkey = "u" + Date.now().toString(36)
    db.ref.c[chatkey] = {
      u: [uid, room.id],
      c: chatkey
    }
    db.save("c")
  }

  const roomkey = chatkey as string
  const dbOld = (db.fileGet(roomkey, room.type) || {}) as IChatDBAPI
  const roomChat: IChatCl = {}
  const newChat: CIChatObject = { userid: uid, timestamp: Date.now() }

  Object.keys(dbOld).forEach((k) => {
    roomChat[k] = normalizeMessage(k, dbOld[k])
  })

  if (s.edit) {
    if (roomChat[s.edit].type === "deleted") {
      return { code: 404, msg: "MSG_EDIT_DELETED" }
    }
    if (roomChat[s.edit].type === "voice" || roomChat[s.edit].type === "call") {
      return { code: 404, msg: "MSG_EDIT_OTHER" }
    }
    const oldts = roomChat[s.edit].timestamp || 761
    if (Date.now() > oldts + 1000 * 60 * 15) {
      return { code: 404, msg: "CONTENT_EDIT_EXPIRED" }
    }

    newChat.edited = Date.now()
  }

  if (s.text) newChat.text = s.text
  if (s.reply) newChat.reply = s.reply
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
  roomChat[chat_id] = { ...newChat, id: chat_id }

  dbOld[chat_id] = minimizeMessage(uid, newChat)
  db.fileSet(roomkey, room.type, dbOld)

  return { code: 200, data: { isFirst, roomid: chatkey as string, chat: { ...newChat, id: chat_id } } }
}

export function convertMessage(uid: string, s: IMessageWriter): CIChatObject {
  return {
    userid: uid,
    timestamp: s.timestamp || Date.now(),
    edited: s.timestamp || Date.now(),
    reply: s.reply,
    text: s.text,
    type: s.type,
    source: s.filesrc
  }
}
export function normalizeMessage(message_id: string, s: ChatObject): ChatDB {
  return {
    id: message_id,
    userid: s.u,
    timestamp: s.ts,
    type: s.ty,
    text: s.txt,
    reply: s.r,
    edited: s.e,
    source: s.i,
    readers: s.w
  }
}
export function minimizeMessage(uid: string, s: CIChatObject): ChatObject {
  const co: ChatObject = { u: uid, ts: s.timestamp }
  if (s.text) co.txt = s.text
  if (s.edited) co.e = s.edited
  if (s.reply) co.r = s.reply
  if (msgValidTypes.find((vt) => vt === s.type) && s.source) {
    co.ty = s.type
    co.i = s.source
  } else if (s.type === "voice") {
    co.ty = "voice"
  }
  return co
}
