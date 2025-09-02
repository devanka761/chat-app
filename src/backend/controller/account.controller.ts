import fs from "fs"
import { getUser } from "./profile.controller"
import { convertGroup, convertUser, escapeWhiteSpace, isProd, normalizeMessage, rUid } from "../main/helper"
import cfg from "../main/cfg"
import { IChatsF, IRoomDataF, MeDB, SocketDB } from "../../frontend/types/db.types"
import { IRepTempB } from "../types/validate.types"
import { IAccountB } from "../types/account.types"
import { PEER_CONFIG } from "../../config/peer.config.json"
import relay from "../main/relay"
import { version } from "../../config/version.json"
import { PushSubscription } from "web-push"
import User, { IUserDocument } from "../models/User.Model"
import Account from "../models/Account.Model"
import Metadata from "../models/Metadata.Model"
import Chat from "../models/Chat.Model"
import Message from "../models/Message.Model"
import { Document } from "mongoose"
import { UpdateQuery } from "mongoose"

async function initSocketClient(uid: string): Promise<SocketDB> {
  const id = rUid()
  await User.updateOne({ id: uid }, { $set: { socket: id } })
  const host = (isProd ? cfg.APP_HOST : `localhost:${cfg.APP_PORT}`) as string
  return { id, host }
}

export async function getMe(uid: string): Promise<IRepTempB> {
  const userDoc = await User.findOne({ id: uid })
  if (!userDoc) return { code: 400, msg: "USER_NOT_FOUND" }

  const accountDoc = await Account.findOne({ id: uid })
  const metadataDoc = await Metadata.findOne({ id: "761" })

  const meData: MeDB = {
    id: userDoc.id,
    username: userDoc.username,
    displayname: userDoc.displayname,
    image: userDoc.image,
    bio: userDoc.bio,
    badges: userDoc.badges
  }
  if (accountDoc) {
    meData.email = accountDoc.data.map((usr) => {
      return { email: usr.email, provider: usr.provider }
    })
  }

  if (userDoc.req && userDoc.req.length >= 1) {
    meData.req = await Promise.all(userDoc.req.map(async (userid) => await getUser(uid, userid)))
  }

  if (userDoc.socket) {
    const client = relay.get(userDoc.socket)?.socket
    if (client) client.send(JSON.stringify({ type: "newLoggedIn", uid }))
  }

  const data: IAccountB = {
    me: meData,
    socket: await initSocketClient(uid),
    v: metadataDoc?.version,
    package: version,
    publicKey: metadataDoc?.publicKey as string
  }

  const chatList = await Chat.find({ users: uid })

  const meChatList: IChatsF[] = await Promise.all(
    chatList.map(async (chat) => {
      const messages = await Message.find({ roomId: chat.id }).sort({ ts: 1 }).limit(1000)
      const isUser = chat.type === "user"
      const rdb: IRoomDataF = isUser ? await convertUser(chat.users.find((usr) => usr !== uid) as string) : await convertGroup(chat.id)
      return {
        u: await Promise.all(chat.users.map(async (usr) => await getUser(uid, usr))),
        m: messages.map((msg) => {
          return normalizeMessage(msg.id, msg.toJSON())
        }),
        r: rdb
      }
    })
  )

  data.c = meChatList
  data.peer = PEER_CONFIG || null
  return { code: 200, data: data }
}

const dvnkzName = ["dvnkz", "dvnkz_", "devanka", "devanka761", "devanka7", "devanka76"]

export async function setUsername(uid: string, s: { uname: string }): Promise<IRepTempB> {
  const userDoc = await User.findOne({ id: uid })
  if (!userDoc) return { code: 404 }

  if (userDoc.lastUsername && userDoc.lastUsername > Date.now()) {
    return { code: 429, msg: "ACC_FAIL_UNAME_COOLDOWN", data: { timestamp: userDoc.lastUsername } }
  }

  if (s.uname.length < 4 || s.uname.length > 20) return { code: 400, msg: "ACC_FAIL_UNAME_LENGTH" }
  const unamevalid = /^[A-Za-z0-9._]+$/
  const unamedeny = /^user/
  if (!s.uname.match(unamevalid)) return { code: 400, msg: "ACC_FAIL_UNAME_FORMAT" }

  const lowerUname = s.uname.toLowerCase()
  if (lowerUname.match(unamedeny)) return { code: 400, msg: "ACC_FAIL_CLAIMED" }
  if (lowerUname.includes("admin")) return { code: 400, msg: "ACC_FAIL_CLAIMED" }
  if (dvnkzName.find((usr) => usr === lowerUname)) return { code: 400, msg: "ACC_FAIL_CLAIMED" }

  if (s.uname === userDoc.username) return { code: 200, data: { text: s.uname } }

  const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${s.uname}$`, "i") } })
  if (existingUser) return { code: 400, msg: "ACC_FAIL_CLAIMED" }

  await User.updateOne({ id: uid }, { $set: { username: s.uname, lastUsername: Date.now() + 1000 * 60 * 60 * 24 * 7 } })
  return { code: 200, data: { text: s.uname } }
}
export async function setDisplayname(uid: string, s: { dname: string }): Promise<IRepTempB> {
  s.dname = escapeWhiteSpace(s.dname)
  const userDoc = await User.findOne({ id: uid })
  if (!userDoc) return { code: 404 }

  if (userDoc.lastDisplayname && userDoc.lastDisplayname > Date.now()) {
    return { code: 429, msg: "ACC_FAIL_DNAME_COOLDOWN", data: { timestamp: userDoc.lastDisplayname } }
  }
  if (s.dname.length > 35) return { code: 400, msg: "ACC_FAIL_DNAME_LENGTH" }
  if (s.dname === userDoc.displayname) return { code: 200, data: { text: s.dname } }

  await User.updateOne({ id: uid }, { $set: { displayname: s.dname, lastDisplayname: Date.now() + 1000 * 60 * 60 * 2 } })
  return { code: 200, data: { text: s.dname } }
}

export async function setBio(uid: string, s: { bio: string }): Promise<IRepTempB> {
  s.bio = escapeWhiteSpace(s.bio)
  const userDoc = await User.findOne({ id: uid })
  if (!userDoc) return { code: 404 }

  if (userDoc.lastBio && userDoc.lastBio > Date.now()) {
    return { code: 429, msg: "ACC_FAIL_BIO_COOLDOWN", data: { timestamp: userDoc.lastBio } }
  }
  if (s.bio.length > 200) return { code: 400, msg: "ACC_FAIL_BIO_LENGTH" }

  const updateData: UpdateQuery<Document<IUserDocument>> = { $set: { lastBio: Date.now() + 1000 * 60 * 3 } }
  if (s.bio.length < 1) {
    updateData.$unset = { bio: "" }
  } else {
    updateData.$set.bio = s.bio
  }

  await User.updateOne({ id: uid }, updateData)
  return { code: 200, data: { text: s.bio } }
}

export async function setImg(uid: string, s: { img: string; name: string }): Promise<IRepTempB> {
  const dataurl = decodeURIComponent(s.img)
  const buffer = Buffer.from(dataurl.split(",")[1], "base64")
  if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }

  const fpath = "./dist/stg/user"
  if (!fs.existsSync(fpath)) fs.mkdirSync(fpath)

  const userDoc = await User.findOne({ id: uid })
  if (!userDoc) return { code: 404 }

  if (userDoc.image) {
    if (fs.existsSync(`${fpath}/${userDoc.image}`)) fs.unlinkSync(`${fpath}/${userDoc.image}`)
  }

  const imgExt = /\.([a-zA-Z0-9]+)$/
  const imgName = `${uid}${Date.now().toString(35)}.${s.name.match(imgExt)?.[1]}`
  fs.writeFileSync(`${fpath}/${imgName}`, buffer)

  await User.updateOne({ id: uid }, { $set: { image: imgName } })

  return { code: 200, data: { text: imgName } }
}

export async function subscribeToPush(uid: string, subscription: PushSubscription) {
  await User.updateOne({ id: uid }, { $set: { push: subscription } })
}
