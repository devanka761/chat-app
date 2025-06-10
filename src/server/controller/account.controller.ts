import fs from "fs"
import { ChatDB, ChatsDB, MeDB, PeerDB } from "../../client/types/db.types"
import db from "../main/db"
import * as hprofile from "./profile.controller"
import * as hroom from "./room.controller"
import { AccountDB } from "../types/account.types"
import { genhex, isProd, peerKey } from "../main/helper"
import cfg from "../main/cfg"
import { IRepBackData, IRepBackRec } from "../types/validate.types"

function initPeer(uid: string): PeerDB {
  const peerid = genhex()
  db.ref.u[uid].peer = peerid
  const data: PeerDB = {
    peerid,
    peerConfig: {
      host: <string>(isProd ? cfg.TURN_HOST : cfg.APP_HOST),
      port: <number>cfg.APP_PORT,
      key: peerKey,
      path: "cloud"
    }
  }
  if (isProd) {
    delete data.peerConfig.port
    data.peerConfig.config = {
      iceServers: [
        { urls: `stun:${cfg.TURN_HOST}:${cfg.TURN_PORT}` },
        {
          urls: `turn:${cfg.TURN_HOST}:${cfg.TURN_PORT}`,
          username: <string>cfg.TURN_USERNAME,
          credential: <string>cfg.TURN_PASSWORD
        }
      ]
    }
  }
  return data
}

export function getMe(uid: string): IRepBackRec {
  const udb = db.ref.u[uid]
  if (!udb) return { code: 400 }

  const meData: MeDB = {
    id: udb.id,
    username: udb.uname as string,
    displayname: udb.dname as string
  }
  meData.image = udb.img
  meData.bio = udb.bio
  meData.badges = udb.b
  meData.email = udb.data.map((usr) => {
    return { email: <string>usr.email, provider: <string>usr.provider }
  })

  const data: AccountDB = {
    me: meData,
    peer: initPeer(uid)
  }

  const cdb = db.ref.c
  const meChatList: ChatsDB[] = Object.keys(cdb)
    .filter((k) => {
      return cdb[k].c && cdb[k].u.find((usr) => usr === uid)
    })
    .map((k) => {
      const chatFile = db.fileGet(cdb[k].c as string, "user") || {}
      return {
        id: k,
        u: [{ ...hprofile.getUser(uid, cdb[k].u.find((usr) => usr !== uid) as string) }],
        c: Object.keys(chatFile).map((msgkey) => {
          // const rawData = chatFile[msgkey]
          // const chatData = {
          //   ...rawData,
          //   id: msgkey
          // }
          // return chatData as ChatDB
          const rawData = chatFile[msgkey]
          return { ...hroom.normalizeMessage(msgkey, rawData) }
        })
      }
    })

  data.c = meChatList

  return { code: 200, data: data as IRepBackData }
}

const dvnkzName = ["dvnkz", "dvnkz_", "devanka", "devanka761", "devanka7", "devanka76"]

export function setUsername(uid: string, s: { uname: string }): IRepBackRec {
  const udb = db.ref.u[uid]
  if (udb.lu && udb.lu > Date.now()) return { code: 429, data: { timestamp: udb.lu } }
  if (s.uname.length < 4 && s.uname.length > 20) return { code: 400, msg: "ACC_FAIL_UNAME_LENGTH" }
  const unamevalid = /^[A-Za-z0-9._]+$/
  const unamedeny = /^user/
  if (!s.uname.match(unamevalid)) return { code: 400, msg: "ACC_FAIL_UNAME_FORMAT" }
  if (s.uname.match(unamedeny)) return { code: 400, msg: "ACC_FAIL_CLAIMED" }
  if (dvnkzName.find((usr) => usr === s.uname)) return { code: 400, msg: "ACC_FAIL_CLAIMED" }
  if (s.uname === udb.uname) return { code: 200, data: { text: s.uname } }

  db.ref.u[uid].uname = s.uname
  db.ref.u[uid].lu = Date.now() + 1000 * 60 * 60 * 24 * 7
  db.save("u")
  return { code: 200, data: { text: s.uname } }
}
export function setDisplayname(uid: string, s: { dname: string }): IRepBackRec {
  s.dname = s.dname.trim()
  const udb = db.ref.u[uid]
  if (udb.ld && udb.ld > Date.now()) return { code: 429, data: { timestamp: udb.ld } }
  if (s.dname.length > 35) return { code: 400, msg: "ACC_FAIL_DNAME_LENGTH" }
  if (s.dname === udb.uname) return { code: 200, data: { text: s.dname } }

  db.ref.u[uid].dname = s.dname
  db.ref.u[uid].ld = Date.now() + 1000 * 60 * 60 * 2
  db.save("u")
  return { code: 200, data: { text: s.dname } }
}

export function setBio(uid: string, s: { bio: string }): IRepBackRec {
  s.bio = s.bio.trim()
  const udb = db.ref.u[uid]
  if (udb.lb && udb.lb > Date.now()) return { code: 429, data: { timestamp: udb.lb } }
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

export function setImg(uid: string, s: { img: string; name: string }): IRepBackRec {
  const dataurl = decodeURIComponent(s.img)
  const buffer = Buffer.from(dataurl.split(",")[1], "base64")
  if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }

  if (!fs.existsSync(`./dist/stg/user`)) fs.mkdirSync(`./dist/stg/user`)

  const udb = db.ref.u[uid]
  if (udb.img) {
    if (fs.existsSync(`./dist/stg/user/${udb.img}`)) fs.unlinkSync(`./dist/stg/user/${udb.img}`)
  }

  const imgExt = /\.([a-zA-Z0-9]+)$/
  const imgName = `${uid}${Date.now().toString(35)}.${s.name.match(imgExt)?.[1]}`
  fs.writeFileSync(`./dist/stg/user/${imgName}`, buffer)

  db.ref.u[uid].img = imgName
  db.save("u")

  return { code: 200, data: { text: imgName } }
}
