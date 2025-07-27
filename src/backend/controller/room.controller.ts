import fs from "fs"
import Ffmpeg from "fluent-ffmpeg"
import db from "../main/db"
import { TRoomTypeF } from "../../frontend/types/room.types"
import { IWritterF } from "../../frontend/types/message.types"
import { IRepTempB } from "../types/validate.types"
import { convertGroup, convertMessage, convertUser, escapeWhiteSpace, minimizeMessage, msgNotValid, msgValidTypes, normalizeMessage } from "../main/helper"
import { IMessageTempF } from "../../frontend/types/db.types"
import { IMessageKeyB } from "../types/db.types"
import zender from "../main/zender"
import { getUser } from "./profile.controller"
import { getGlobalMembers } from "./group.controller"
import { KirAIRoom } from "../../frontend/helper/AccountKirAI"
import { clearAIChat, sendAIChat } from "./genai.controller"
import { sendPushNotification } from "../main/prepare"

export async function sendMessage(uid: string, room_id: string, room_type: TRoomTypeF, s: IWritterF): Promise<IRepTempB> {
  if (s.text) s.text = escapeWhiteSpace(s.text)
  const notvalid = msgNotValid(s)
  if (notvalid) return { code: 404, msg: notvalid }
  if (room_id === KirAIRoom.id) return sendAIChat(uid, s.text)
  const cdb = db.ref.c
  let chatkey =
    room_type === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === room_id)
        })
      : Object.keys(cdb).find((k) => room_id === "696969" || (cdb[k].t === "group" && k === room_id && cdb[k].u.find((usr) => usr === uid)))
  if (s.edit && !chatkey) {
    if (room_type === "group") return { code: 403, msg: "GRP_KICKED" }
    return { code: 400 }
  }
  if (s.edit && chatkey) return editMessage(uid, chatkey, room_id, room_type, s)
  if (room_type === "group" && !chatkey) return { code: 403, msg: "GRP_KICKED" }
  if (!chatkey) {
    if (!db.ref.u[room_id]) return { code: 404, msg: "FIND_NOTFOUND" }
    chatkey = `${uid}u${room_id}`
    db.ref.c[chatkey] = {
      u: [uid, room_id],
      c: chatkey,
      t: "user"
    }
    db.save("c")
  }
  if (!db.ref.c[chatkey].c) {
    db.ref.c[chatkey].c = chatkey
    db.save("c")
  }

  const dbOld = (db.fileGet(chatkey, "room") || {}) as IMessageKeyB
  const newChat: IMessageTempF = convertMessage(uid, s)

  if (s.type) {
    newChat.type = s.type
    if (msgValidTypes.find((vt) => vt === s.type)) {
      const dataurl = decodeURIComponent(s.filesrc as string)
      const buffer = Buffer.from(dataurl.split(",")[1], "base64")
      if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }
      const uniq = Date.now().toString(36)
      const fpath = "./dist/stg/room"
      if (!fs.existsSync(`${fpath}`)) fs.mkdirSync(`${fpath}`)
      if (!fs.existsSync(`${fpath}/${chatkey}`)) fs.mkdirSync(`${fpath}/${chatkey}`)
      let fname = s.type === "voice" ? `voice-${uniq}-${uid}.ogg` : `${uniq}_${s.filename}`
      fs.writeFileSync(`${fpath}/${chatkey}/${fname}`, buffer, "base64")

      if (s.type === "voice") {
        const covPath = `${fpath}/${chatkey}`
        const covFname = fname.replace(".ogg", ".mp3")
        const convertAudio: boolean = await new Promise((resolve) => {
          Ffmpeg(`${covPath}/${fname}`)
            .toFormat("mp3")
            .save(`${covPath}/${covFname}`)
            .on("end", () => {
              resolve(true)
            })
            .on("error", () => {
              resolve(false)
            })
        })
        if (convertAudio === true) {
          fs.rmSync(`${fpath}/${chatkey}/${fname}`)
          fname = covFname
        }
      }

      newChat.source = fname
    }
  }

  const chat_id = "c" + Date.now().toString(36)
  newChat.timestamp = Date.now()

  dbOld[chat_id] = minimizeMessage(uid, newChat)
  db.fileSet(chatkey, "room", dbOld)

  const users = room_id === "696969" ? getGlobalMembers(uid, dbOld) : cdb[chatkey].u

  const chatData = { ...newChat, id: chat_id }
  const dataZender = {
    chat: chatData,
    roomdata: cdb[chatkey].t === "user" ? convertUser(uid) : convertGroup(chatkey),
    users: users.map((usr) => getUser(usr, uid))
  }
  const dataRep = {
    chat: chatData,
    roomdata: cdb[chatkey].t === "user" ? convertUser(room_id) : convertGroup(chatkey),
    users: users.map((usr) => getUser(uid, usr))
  }

  if (room_type === "user") {
    sendPushNotification(room_id, {
      title: `@${dataZender.roomdata.short}`,
      text: `Kirimin - New Message - @${dataZender.roomdata.short}`,
      tag: "new-message",
      url: `/app?chat=${room_id}`
    })
  }

  const onlineUsers = room_id === "696969" ? getAllOnlineUsers() : users
  onlineUsers.forEach((usr) => zender(uid, usr, "sendmessage", dataZender))

  return { code: 200, data: dataRep }
}

export function editMessage(uid: string, chatkey: string, room_id: string, room_type: TRoomTypeF, s: IWritterF): IRepTempB {
  if (!s.edit) return { code: 400 }
  if (!chatkey) return { code: 403, msg: "GRP_KICKED" }
  const cdb = db.ref.c[chatkey]
  if (!cdb) return { code: 400 }

  const dbOld = (db.fileGet(chatkey, "room") || {}) as IMessageKeyB

  if (!dbOld[s.edit]) return { code: 400 }
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

  const chatData = { ...normalizeMessage(s.edit, dbOld[s.edit]) }

  const users = room_id === "696969" ? getGlobalMembers(uid, dbOld) : cdb.u

  const dataZender = {
    chat: chatData,
    roomdata: cdb.t === "user" ? convertUser(uid) : convertGroup(chatkey),
    users: users.map((usr) => getUser(usr, uid))
  }
  const dataRep = {
    chat: chatData,
    roomdata: cdb.t === "user" ? convertUser(room_id) : convertGroup(chatkey),
    users: users.map((usr) => getUser(uid, usr))
  }
  const onlineUsers = room_id === "696969" ? getAllOnlineUsers() : users
  onlineUsers.forEach((usr) => zender(uid, usr, "editmessage", dataZender))

  return { code: 200, data: dataRep }
}

export function delMessage(uid: string, target: string, room: string, message_id: string): IRepTempB {
  const cdb = db.ref.c
  const chatkey =
    room === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === target)
        })
      : Object.keys(cdb).find((k) => target === "696969" || (cdb[k].t === "group" && k === target && cdb[k].u.find((usr) => usr === uid)))

  if (!chatkey) return { code: 403, msg: "GRP_KICKED" }

  const roomkey = chatkey as string
  const dbOld = (db.fileGet(roomkey, "room") || {}) as IMessageKeyB
  if (!dbOld[message_id]) return { code: 400 }

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

  const chatData = { ...normalizeMessage(message_id, dbOld[message_id]) }

  const users = target === "696969" ? getGlobalMembers(uid, dbOld) : cdb[chatkey].u

  const dataZender = {
    chat: chatData,
    roomdata: cdb[chatkey].t === "user" ? convertUser(uid) : convertGroup(chatkey),
    users: users.map((usr) => getUser(usr, uid))
  }
  const dataRep = {
    chat: chatData,
    roomdata: cdb[chatkey].t === "user" ? convertUser(target) : convertGroup(chatkey),
    users: users.map((usr) => getUser(uid, usr))
  }

  const onlineUsers = target === "696969" ? getAllOnlineUsers() : users

  onlineUsers.forEach((usr) => zender(uid, usr, "deletemessage", dataZender))

  return { code: 200, data: dataRep }
}

function getAllOnlineUsers(): string[] {
  const udb = db.ref.u

  const usr = Object.keys(udb)
    .filter((k) => {
      return udb[k].socket
    })
    .map((k) => udb[k].id)

  return usr
}

export function clearHistory(uid: string, room_type: string, room_id: string): IRepTempB {
  if (room_id === KirAIRoom.id) return clearAIChat(uid)
  const cdb = db.ref.c
  const ckey =
    room_type === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === room_id)
        })
      : Object.keys(cdb).find((k) => room_id === "696969" || (cdb[k].t === "group" && k === room_id && cdb[k].u.find((usr) => usr === uid)))

  if (!ckey) return { code: 400 }

  if (room_type === "group" && cdb[ckey].o !== uid) return { code: 403, msg: "GRPS_OWNER_FEATURE" }
  if (room_id === "696969") return { code: 403, msg: "GRPS_OWNER_FEATURE" }
  if (!cdb[ckey].c) return { code: 200 }

  const roompath = "./dist/stg/room"
  const mediapath = `${roompath}/${cdb[ckey].c}`
  const dbpath = "./dist/db/room"
  const chatpath = `./dist/db/room/${cdb[ckey].c}.json`

  if (fs.existsSync(roompath) || cdb[ckey].c || fs.existsSync(mediapath)) {
    fs.rmSync(mediapath, { recursive: true, force: true })
  }

  if (fs.existsSync(dbpath) && cdb[ckey].c && fs.existsSync(chatpath)) {
    fs.rmSync(chatpath, { recursive: true, force: true })
  }

  cdb[ckey].u.forEach((usr) => {
    zender(uid, usr, "clearhistory", { roomid: cdb[ckey].t === "user" ? uid : ckey })
  })

  db.fileSet(cdb[ckey].c, "room", {})
  db.save("c")

  return { code: 200 }
}
