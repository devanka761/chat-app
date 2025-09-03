import fs from "fs"
import db from "../main/db"
import { getUser } from "./profile.controller"
import { convertGroup, convertUser, escapeWhiteSpace, isProd, normalizeMessage, rUid } from "../main/helper"
import cfg from "../main/cfg"
import { IChatsF, IRoomDataF, MeDB, SocketDB } from "../../frontend/types/db.types"
import { IRepTempB } from "../types/validate.types"
import { IAccountB } from "../types/account.types"
import { PEER_CONFIG } from "../../config/peer.config.json"
import relay from "../main/relay"
import { version } from "../../config/version.json"

function initSocketClient(uid: string): SocketDB {
  const id = rUid()
  db.ref.u[uid].socket = id
  const host = (isProd ? cfg.APP_HOST : `localhost:${cfg.APP_PORT}`) as string
  return { id, host }
}

export function getMe(uid: string): IRepTempB {
  const udb = db.ref.u[uid]
  if (!udb) return { code: 400 }

  const meData: MeDB = {
    id: udb.id,
    username: udb.uname as string,
    displayname: udb.dname as string,
    image: udb.img,
    bio: udb.bio,
    badges: udb.b
  }
  meData.email = udb.data.map((usr) => {
    return { email: <string>usr.email, provider: <string>usr.provider }
  })

  if (udb.req && udb.req.length >= 1) {
    meData.req = udb.req.map((userid) => {
      return getUser(uid, userid)
    })
  }

  if (udb.socket) {
    const client = relay.get(udb.socket)?.socket
    if (client) client.send(JSON.stringify({ type: "newLoggedIn", uid }))
  }

  const data: IAccountB = {
    me: meData,
    socket: initSocketClient(uid),
    v: db.ref.k.v,
    package: version,
    publicKey: db.ref.k.publicKey
  }

  const cdb = db.ref.c
  const meChatList: IChatsF[] = Object.keys(cdb)
    .filter((k) => {
      return cdb[k].u.find((usr) => usr === uid) && (cdb[k].c || cdb[k].f === 1)
    })
    .map((k) => {
      const chatFile = db.fileGet(cdb[k].c as string, "room") || {}
      const isUser = cdb[k].t === "user" ? true : false
      const rdb: IRoomDataF = isUser ? convertUser(cdb[k].u.find((usr) => usr !== uid) as string) : convertGroup(k)
      return {
        u: cdb[k].u.map((usr) => getUser(uid, usr)),
        m: Object.keys(chatFile).map((msgkey) => {
          const rawData = chatFile[msgkey]
          return normalizeMessage(msgkey, rawData)
        }),
        r: rdb
      }
    })

  data.c = meChatList
  data.peer = PEER_CONFIG || null

  return { code: 200, data: data }
}

const dvnkzName = ["dvnkz", "dvnkz_", "devanka", "devanka761", "devanka7", "devanka76"]

export function setUsername(uid: string, s: { uname: string }): IRepTempB {
  const udb = db.ref.u[uid]
  if (udb.lu && udb.lu > Date.now()) return { code: 429, msg: "ACC_FAIL_UNAME_COOLDOWN", data: { timestamp: udb.lu } }
  if (s.uname.length < 4 && s.uname.length > 20) return { code: 400, msg: "ACC_FAIL_UNAME_LENGTH" }
  const unamevalid = /^[A-Za-z0-9._]+$/
  const unamedeny = /^user/
  if (!s.uname.match(unamevalid)) return { code: 400, msg: "ACC_FAIL_UNAME_FORMAT" }
  if (s.uname.toLowerCase().match(unamedeny)) return { code: 400, msg: "ACC_FAIL_CLAIMED" }
  if (s.uname.toLowerCase().includes("admin")) return { code: 400, msg: "ACC_FAIL_CLAIMED" }
  if (dvnkzName.find((usr) => usr === s.uname)) return { code: 400, msg: "ACC_FAIL_CLAIMED" }
  if (s.uname === udb.uname) return { code: 200, data: { text: s.uname } }

  const otherUsernames = Object.keys(db.ref.u).map((k) => db.ref.u[k].uname.toLowerCase())
  if (otherUsernames.find((usr) => usr === s.uname.toLowerCase())) return { code: 400, msg: "ACC_FAIL_CLAIMED" }

  db.ref.u[uid].uname = s.uname
  db.ref.u[uid].lu = Date.now() + 1000 * 60 * 60 * 24 * 7
  db.save("u")
  return { code: 200, data: { text: s.uname } }
}
export function setDisplayname(uid: string, s: { dname: string }): IRepTempB {
  s.dname = escapeWhiteSpace(s.dname)
  const udb = db.ref.u[uid]
  if (udb.ld && udb.ld > Date.now()) return { code: 429, msg: "ACC_FAIL_DNAME_COOLDOWN", data: { timestamp: udb.ld } }
  if (s.dname.length > 35) return { code: 400, msg: "ACC_FAIL_DNAME_LENGTH" }
  if (s.dname === udb.dname) return { code: 200, data: { text: s.dname } }

  db.ref.u[uid].dname = s.dname
  db.ref.u[uid].ld = Date.now() + 1000 * 60 * 60 * 2
  db.save("u")
  return { code: 200, data: { text: s.dname } }
}

export function setBio(uid: string, s: { bio: string }): IRepTempB {
  s.bio = escapeWhiteSpace(s.bio)
  const udb = db.ref.u[uid]
  if (udb.lb && udb.lb > Date.now()) return { code: 429, msg: "ACC_FAIL_BIO_COOLDOWN", data: { timestamp: udb.lb } }
  if (s.bio.length > 200) return { code: 400, msg: "ACC_FAIL_BIO_LENGTH" }
  if (s.bio.length < 1) {
    delete db.ref.u[uid].bio
  } else {
    db.ref.u[uid].bio = s.bio
  }

  db.ref.u[uid].lb = Date.now() + 1000 * 60 * 3
  db.save("u")

  return { code: 200, data: { text: s.bio } }
}

export function setImg(uid: string, s: { img: string; name: string }): IRepTempB {
  const dataurl = decodeURIComponent(s.img)
  const buffer = Buffer.from(dataurl.split(",")[1], "base64")
  if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }

  const fpath = "./dist/stg/user"

  if (!fs.existsSync(fpath)) fs.mkdirSync(fpath)

  const udb = db.ref.u[uid]
  if (udb.img) {
    if (fs.existsSync(`${fpath}/${udb.img}`)) fs.unlinkSync(`${fpath}/${udb.img}`)
  }

  const imgExt = /\.([a-zA-Z0-9]+)$/
  const imgName = `${uid}${Date.now().toString(35)}.${s.name.match(imgExt)?.[1]}`
  fs.writeFileSync(`${fpath}/${imgName}`, buffer)

  db.ref.u[uid].img = imgName
  db.save("u")

  return { code: 200, data: { text: imgName } }
}
