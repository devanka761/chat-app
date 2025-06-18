import crypto, { Cipheriv, Decipheriv } from "crypto"
import cfg from "./cfg"
import { IRepB, IRepTempB } from "../types/validate.types"
import { IWritterF } from "../../frontend/types/message.types"
import { IMessageF, IMessageTempF, IRoomDataF } from "../../frontend/types/db.types"
import { IMessageB } from "../types/db.types"
import db from "./db"

export const peerKey: string = crypto.randomBytes(16).toString("hex")

export const isProd: boolean = cfg.APP_PRODUCTION?.toString() === "true"

export function genhex(): string {
  return crypto.randomBytes(8).toString("hex") + Date.now().toString(36)
}

export function rep(options: IRepTempB): IRepB {
  const repdata: IRepB = Object.assign(
    {},
    {
      ok: false,
      code: 400,
      msg: "ERROR"
    },
    typeof options === "string" ? {} : options
  )
  if (options.data && typeof options.data === "object") repdata.data = options.data
  if (options.code === 200) {
    repdata.ok = true
    repdata.msg = "OK"
  }

  return repdata
}

export function rString(n: number = 8): string {
  return crypto.randomBytes(n).toString("hex")
}

export function rNumber(n: number = 6): number {
  let a: string = ""
  for (let i: number = 1; i < n; i++) {
    a += "0"
  }
  return Math.floor(Math.random() * Number("9" + a)) + Number("1" + a)
}

export function encryptData(plaintext: string): string {
  const chatkey: Buffer = Buffer.from(<string>cfg.CHAT_KEY, "hex")
  const iv: Buffer = crypto.randomBytes(16)
  const cipher: Cipheriv = crypto.createCipheriv("aes-256-cbc", chatkey, iv)
  const encrypted: string = cipher.update(plaintext, "utf-8", "hex")
  const dataResult: string = encrypted + cipher.final("hex")
  return `${iv.toString("hex")}:${dataResult}`
}

export function decryptData(ciphertext: string): string {
  const chatkey: Buffer = Buffer.from(cfg.CHAT_KEY as string, "hex")
  const [ivHex, encrypted]: string[] = ciphertext.split(":")
  const iv: Buffer = Buffer.from(ivHex, "hex")
  const decipher: Decipheriv = crypto.createDecipheriv("aes-256-cbc", chatkey, iv)
  const decrypted: string = decipher.update(encrypted, "hex", "utf-8")
  const dataResult: string = decrypted + decipher.final("utf-8")
  return dataResult
}

const msgValidTypes = ["audio", "file", "video", "image"]

export function msgNotValid(s: IWritterF): string | null {
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

export function convertMessage(uid: string, s: IWritterF): IMessageTempF {
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
export function normalizeMessage(message_id: string, s: IMessageB): IMessageF {
  return {
    id: message_id,
    userid: s.u,
    timestamp: s.ts,
    type: s.d ? "deleted" : s.ty,
    text: s.txt,
    reply: s.r,
    edited: s.e,
    source: s.i,
    readers: s.w
  }
}
export function minimizeMessage(uid: string, s: IMessageTempF): IMessageB {
  const co: IMessageB = { u: uid, ts: s.timestamp }
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

export function convertUser(user_id: string): IRoomDataF {
  const user = db.ref.u[user_id]
  return {
    id: user_id,
    short: user.uname,
    long: user.dname,
    image: user.img,
    badges: user.b,
    type: "user"
  }
}
export function convertGroup(group_id: string): IRoomDataF {
  const group = db.ref.c[group_id]
  return {
    id: group_id,
    long: group.n || "unamed",
    short: group_id,
    badges: group.b,
    image: group.i,
    type: "group"
  }
}
