import fs from "fs"
import nodemailer, { Transporter } from "nodemailer"
import { isProd, rNumber, rUid } from "../main/helper"
import validate from "../main/validate"
import cfg from "../main/cfg"
import * as haccount from "./account.controller"
import { IRepTempB, SivalKeyType } from "../types/validate.types"
import Auth from "../models/Auth.Model"
import { AccountProvider, IAccountData, IAccountProvider, IAccountTemp } from "../types/account.types"
import Account from "../models/Account.Model"
import User from "../models/User.Model"

export async function isUserLogged(uid?: string): Promise<IRepTempB> {
  if (!uid) return { code: 401, msg: "UNAUTHORIZED" }
  return await haccount.getMe(uid)
}

export async function authLogin(s: SivalKeyType): Promise<IRepTempB> {
  if (!validate(["email"], s)) return { code: 400 }
  const email = s.email.toString().toLowerCase()
  const mailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!email.match(mailValid)) return { code: 400, msg: "AUTH_ERR_02" }

  const existingAuth = await Auth.findOne({ email: email })

  if (existingAuth && (existingAuth.rate >= 3 || (existingAuth.cd || 0) >= 3)) {
    if (existingAuth.rate >= 3) {
      setTimeout(async () => {
        await Auth.deleteOne({ email: email })
      }, 1000 * 30)
    }
    return { code: 429, msg: "AUTH_RATE_LIMIT" }
  }

  const gencode: number = rNumber(6)
  const expiry = Date.now() + 1000 * 60 * 10

  await Auth.findOneAndUpdate(
    { email: email },
    {
      $set: {
        email: email,
        otp: { code: gencode, expiry: expiry }
      },
      $inc: { rate: 1 },
      $setOnInsert: { cd: 0 }
    },
    { upsert: true }
  )

  if (isProd) {
    emailCode(email, gencode.toString())
  } else {
    console.log(`[DEV] OTP for ${email} is: ${gencode}`)
  }
  return { code: 200, msg: "OK", data: { email: email } }
}

export async function authVerify(s: SivalKeyType): Promise<IRepTempB> {
  if (!validate(["email", "code"], s)) return { code: 404 }
  const email = s.email.toString().toLowerCase()
  const mailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g
  if (!email.match(mailValid)) return { code: 404, msg: "AUTH_ERR_02" }
  const code = Number(s.code)

  const authDoc = await Auth.findOne({ email })
  if (!authDoc) return { code: 400, msg: "AUTH_ERR_04" }

  if ((authDoc.cd || 0) >= 4) return { code: 429, msg: "AUTH_RATE_LIMIT" }
  authDoc.cd = (authDoc.cd || 0) + 1
  await authDoc.save()

  if (authDoc.otp.code !== code) return { code: 400, msg: "AUTH_ERR_04" }
  if (authDoc.otp.expiry < Date.now()) return { code: 400, msg: "AUTH_ERR_05", data: { restart: 1 } }

  return await processUser(email)
}

export async function processUser(email: string): Promise<IRepTempB> {
  const provider: AccountProvider = AccountProvider.Kirimin

  const account = await Account.findOne({
    "data.email": email,
    "data.provider": provider
  })

  const data: { user: IAccountTemp; first?: boolean } = {
    user: { data: { provider, email } }
  }

  let ukey: string

  if (account) {
    ukey = account.id
  } else {
    ukey = rUid()
    const newUser = new User({
      id: ukey,
      username: `u${ukey}`,
      displayName: `User ${ukey}`
    })

    const newAccount = new Account({
      id: ukey,
      data: [
        {
          id: ukey,
          email: email,
          provider: provider
        }
      ]
    })

    await Promise.all([newUser.save(), newAccount.save()])

    data.first = true
  }

  data.user.id = ukey
  data.user.data.id = ukey

  await Auth.deleteOne({ email: email })

  return { code: 200, data: data }
}

export async function processThirdParty(s: { user: IAccountData; provider: IAccountProvider | AccountProvider }): Promise<IRepTempB> {
  const userInfo: IAccountData = {
    email: s.user.email,
    id: s.user.id,
    provider: s.provider
  }

  const data: { user: IAccountTemp; first?: boolean } = { user: { data: userInfo } }

  const account = await Account.findOne({
    "data.provider": userInfo.provider,
    "data.id": userInfo.id
  })

  let ukey: string

  if (account) {
    ukey = account.id
  } else {
    ukey = rUid()

    const newUser = new User({ id: ukey, username: `u${ukey}`, displayName: `User ${ukey}` })
    const newAccount = new Account({ id: ukey, data: [userInfo as IAccountData] })

    await Promise.all([newUser.save(), newAccount.save()])
    data.first = true
  }

  data.user.id = ukey
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
      console.error(err)
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
