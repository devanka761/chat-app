import fs from "fs"
import nodemailer, { Transporter } from "nodemailer"
import db from "../main/db"
import { isProd, rNumber } from "../main/helper"
import validate from "../main/validate"
import cfg from "../main/cfg"
import { UserProcess } from "../types/db.types"
import * as haccount from "./account.controller"
import { IRepTempB, SivalKeyType } from "../types/validate.types"
import { IUserTempB, ValidProviders } from "../types/binder.types"
import logger from "../main/logger"

export function isUserLogged(uid?: string): IRepTempB {
  if (!uid) return { code: 401, msg: "UNAUTHORIZED" }
  return haccount.getMe(uid)
}

export function authLogin(s: SivalKeyType): IRepTempB {
  if (!validate(["email"], s)) return { code: 400 }
  s.email = s.email.toString().toLowerCase()
  const mailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!s.email.match(mailValid)) return { code: 400, msg: "AUTH_ERR_02" }

  const oldEmailKey = Object.keys(db.ref.t).find((key) => db.ref.t[key].email == s.email)
  const tempid = oldEmailKey ? oldEmailKey : "u" + Date.now().toString(32)

  const gencode: number = rNumber(6)
  if (!db.ref.t[tempid])
    db.ref.t[tempid] = {
      email: s.email,
      otp: { code: gencode.toString(), expiry: <number>(Date.now() + 1000 * 60 * 10) },
      rate: 0
    }
  if (db.ref.t[tempid].rate >= 2) {
    setTimeout(() => {
      delete db.ref.t[tempid]
    }, 1000 * 30)
  }
  if (db.ref.t[tempid].rate >= 3 || (db.ref.t[tempid].cd || 0) >= 3) return { code: 429, msg: "AUTH_RATE_LIMIT" }
  db.ref.t[tempid].email = s.email
  db.ref.t[tempid].otp = { code: gencode, expiry: Date.now() + 1000 * 60 * 10 }
  db.ref.t[tempid].rate = db.ref.t[tempid].rate + 1

  if (isProd) {
    emailCode(s.email, gencode.toString())
  } else {
    db.save("t")
  }
  return { code: 200, msg: "OK", data: { email: s.email } }
}

export function authVerify(s: SivalKeyType): IRepTempB {
  if (!validate(["email", "code"], s)) return { code: 404 }
  s.email = s.email.toString().toLowerCase()
  const mailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!s.email.match(mailValid)) return { code: 404, msg: "AUTH_ERR_02" }
  s.code = Number(s.code)

  const tdb = db.ref.t
  const dbkey = Object.keys(tdb).find((key) => tdb[key].email == s.email)
  if (!dbkey) return { code: 400, msg: "AUTH_ERR_04" }
  if ((tdb[dbkey].cd || 0) >= 3) {
    setTimeout(() => {
      delete db.ref.t[dbkey]
    }, 1000 * 10)
  }
  if ((tdb[dbkey].cd || 0) >= 4) return { code: 429, msg: "AUTH_RATE_LIMIT" }
  db.ref.t[dbkey].cd = (db.ref.t[dbkey].cd || 0) + 1

  if (tdb[dbkey].otp.code !== s.code) return { code: 400, msg: "AUTH_ERR_04" }
  if (<number>tdb[dbkey].otp.expiry < Date.now()) return { code: 400, msg: "AUTH_ERR_05", data: { restart: 1 } }

  return processUser(s.email, dbkey)
}

export function processUser(email: string, dbkey: string): IRepTempB {
  const provider: ValidProviders = "kirimin"

  const udb = db.ref.u
  const data: { user: UserProcess; first?: boolean } = { user: { data: { provider, email } } }
  let ukey: string | undefined = Object.keys(udb).find((key) =>
    udb[key].data.find((snap) => {
      return snap.provider === provider && snap.email === email
    })
  )
  if (!ukey) {
    ukey = "7" + rNumber(5).toString() + (Object.keys(udb).length + 1).toString()
    db.ref.u[ukey] = { id: ukey, data: [data.user.data], uname: `u${ukey}`, dname: `User ${ukey}` }
    data.first = true
  }
  data.user.id = ukey
  data.user.data.id = ukey
  delete db.ref.t[dbkey]
  db.save("u")
  return { code: 200, data: data }
}

export function processThirdParty(s: { user: IUserTempB; provider: string }): IRepTempB {
  const udb = db.ref.u
  const userInfo: IUserTempB = {
    email: s.user.email,
    id: s.user.id,
    provider: s.provider as ValidProviders
  }
  const data: { user: { id?: string; data: IUserTempB }; first?: boolean } = { user: { data: userInfo } }

  let ukey = Object.keys(udb).find((key) =>
    udb[key].data.find((snap) => {
      return snap.provider === userInfo.provider && snap.id === userInfo.id
    })
  )
  if (!ukey) {
    ukey = "7" + rNumber(5).toString() + (Object.keys(udb).length + 1).toString()
    db.ref.u[ukey] = { id: ukey, data: [data.user.data], uname: `u${ukey}`, dname: `User ${ukey}` }
    data.first = true
  }
  data.user.id = ukey
  db.ref.u[ukey].data = [data.user.data]
  db.save("u")
  return { code: 200, data: data }
}
const emailQueue: { index: number; done: number } = { index: 0, done: 0 }

function emailCode(user_email: string, gen_code: string): void {
  emailQueue.index++
  sendEmailCode(emailQueue.index, user_email, gen_code)
}

function sendEmailCode(emailIndex: number, user_email: string, gen_code: string) {
  if (emailQueue.done + 1 !== emailIndex) {
    return setTimeout(() => sendEmailCode(emailIndex, user_email, gen_code), 200)
  }

  const transport: Transporter = nodemailer.createTransport({
    host: <string>cfg.SMTP_HOST,
    port: <number>cfg.SMTP_PORT,
    auth: {
      user: <string>cfg.SMTP_USER,
      pass: <string>cfg.SMTP_PASS
    }
  })

  const email_file = fs
    .readFileSync("./src/backend/html/email_code.ejs", "utf-8")
    .replace(/{GEN_CODE}/g, gen_code)
    .replace(/{YEAR}/g, new Date().getFullYear().toString())

  transport
    .sendMail({
      from: `"Kirimin" <${cfg.SMTP_USER}>`,
      to: user_email,
      subject: `Your login code is ${gen_code}`,
      html: email_file
    })
    .catch((err) => {
      logger.error(err)
    })
    .finally(() => {
      transport.close()
      emailQueue.done++
      if (emailQueue.done === emailQueue.index) {
        emailQueue.index = 0
        emailQueue.done = 0
      }
    })
}
