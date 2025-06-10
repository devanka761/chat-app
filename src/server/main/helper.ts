import crypto, { Cipher, Decipher } from "crypto"
import cfg from "./cfg"
import { IRepBack, IRepBackRec } from "../types/validate.types"

export const peerKey: string = crypto.randomBytes(16).toString("hex")

export const isProd: boolean = cfg.APP_PRODUCTION?.toString() === "true"

export function genhex(): string {
  return crypto.randomBytes(8).toString("hex") + Date.now().toString(36)
}

export function rep(options: IRepBackRec): IRepBack {
  const repdata: IRepBack = Object.assign(
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
  const cipher: Cipher = crypto.createCipheriv("aes-256-cbc", chatkey, iv)
  const encrypted: string = cipher.update(plaintext, "utf-8", "hex")
  const dataResult: string = encrypted + cipher.final("hex")
  return `${iv.toString("hex")}:${dataResult}`
}

export function decryptData(ciphertext: string): string {
  const chatkey: Buffer = Buffer.from(cfg.CHAT_KEY as string, "hex")
  const [ivHex, encrypted]: string[] = ciphertext.split(":")
  const iv: Buffer = Buffer.from(ivHex, "hex")
  const decipher: Decipher = crypto.createDecipheriv("aes-256-cbc", chatkey, iv)
  const decrypted: string = decipher.update(encrypted, "hex", "utf-8")
  const dataResult: string = decrypted + decipher.final("utf-8")
  return dataResult
}
