import fs from "fs"
import { IChatsF } from "../../frontend/types/db.types"
import db from "../main/db"
import { convertGroup, rNumber } from "../main/helper"
import { IChatB } from "../types/db.types"
import { IRepTempB } from "../types/validate.types"
import { getUser } from "./profile.controller"
import zender from "../main/zender"

export function createGroup(uid: string, s: { name: string }): IRepTempB {
  const cdb = db.ref.c
  const hasMany = Object.keys(cdb).filter((k) => cdb[k].o === uid)
  if (hasMany.length >= 20) return { code: 400, msg: "GRPS_OWN_MAX" }

  s.name = s.name.trim()

  if (s.name.length > 35) return { code: 400, msg: "GRPS_DNAME_LENGTH" }
  if (!db.ref.k.g) db.ref.k.g = 0
  db.ref.k.g++

  const chat_id = "6" + rNumber(5).toString() + db.ref.k.g.toString()
  const invite_link = rNumber(1) + (Number(chat_id) + rNumber(6)).toString(36).substring(1) + Date.now().toString(36)

  const roomData: IChatB = {
    u: [uid],
    o: uid,
    n: s.name.trim(),
    t: "group",
    c: chat_id,
    l: invite_link
  }
  db.ref.c[chat_id] = { ...roomData }
  db.save("c", "k")
  db.fileSet(chat_id, "room", {})
  const groupData: IChatsF = {
    m: [],
    u: [getUser(uid, uid)],
    r: convertGroup(chat_id)
  }

  return { code: 200, data: { roomid: chat_id, group: groupData } }
}

export function setGroupname(uid: string, s: { gname: string; id: string }): IRepTempB {
  const cdb = db.ref.c
  const gkey = Object.keys(cdb).find((k) => k === s.id)

  if (!gkey) return { code: 404, msg: "GRPS_404" }
  if (!cdb[gkey].o || cdb[gkey].o !== uid) return { code: 400, msg: "GRPS_OWNER_FEATURE" }
  if (cdb[gkey].lg && cdb[gkey].lg > Date.now()) {
    return { code: 429, msg: "GRPS_DNAME_COOLDOWN", data: { timestamp: cdb[gkey].lg } }
  }
  s.gname = s.gname.trim()

  if (s.gname === cdb[gkey].n) return { code: 200, data: { text: s.gname } }
  if (s.gname.length > 35) return { code: 400, msg: "GRPS_DNAME_LENGTH" }

  db.ref.c[gkey].n = s.gname
  db.ref.c[gkey].lg = Date.now() + 1000 * 60 * 15

  db.save("c")
  return { code: 200, data: { text: s.gname } }
}

export function setImg(uid: string, s: { img: string; name: string; id: string }): IRepTempB {
  const gkey = Object.keys(db.ref.c).find((k) => k === s.id)
  if (!gkey) return { code: 404, msg: "GRPS_404" }
  const cdb = db.ref.c[gkey]
  if (!cdb) return { code: 404, msg: "GRPS_404" }

  if (!cdb.o || cdb.o !== uid) return { code: 400, msg: "GRPS_OWNER_FEATURE" }

  const dataurl = decodeURIComponent(s.img)
  const buffer = Buffer.from(dataurl.split(",")[1], "base64")
  if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }

  const fpath = "./dist/stg/group"

  if (!fs.existsSync(fpath)) fs.mkdirSync(fpath)

  if (cdb.i) {
    if (fs.existsSync(`${fpath}/${cdb.i}`)) fs.unlinkSync(`${fpath}/${cdb.i}`)
  }

  const imgExt = /\.([a-zA-Z0-9]+)$/
  const imgName = `${gkey}_${Date.now().toString(35)}.${s.name.match(imgExt)?.[1]}`
  fs.writeFileSync(`${fpath}/${imgName}`, buffer)

  db.ref.c[gkey].i = imgName
  db.save("c")

  return { code: 200, data: { text: imgName } }
}

export function resetLink(uid: string, s: { id: string }): IRepTempB {
  const { id } = s
  const cdb = db.ref.c[id]
  if (!cdb || cdb.t !== "group") return { code: 404, msg: "GRPS_404" }
  if (cdb.o !== uid) return { code: 400 }
  const invite_link = rNumber(1) + (Number(id) + rNumber(6)).toString(36).substring(1) + Date.now().toString(36)
  db.ref.c[id].l = invite_link
  db.save("c")

  return { code: 200, data: { text: invite_link } }
}

export function setLeave(uid: string, roomid: string): IRepTempB {
  const cdb = db.ref.c[roomid]
  if (!cdb) return { code: 200, msg: "GRPS_404" }
  if (cdb.o === uid) return setDisband(uid, roomid)

  if (!cdb.u.find((usr) => usr === uid)) return { code: 400 }

  cdb.u.forEach((usr) => {
    zender(uid, usr, "memberleave", { groupid: roomid })
  })

  db.ref.c[roomid].u = cdb.u.filter((usr) => usr !== uid)
  db.save("c")
  return { code: 200 }
}
function setDisband(uid: string, roomid: string): IRepTempB {
  const cdb = db.ref.c[roomid]
  if (!cdb) return { code: 404, msg: "GRPS_404" }
  if (cdb.o !== uid) return { code: 400, msg: "GRPS_OWNER_FEATURE" }

  const roompath = "./dist/stg/room"
  const mediapath = `${roompath}/${cdb.c}`
  const grouppath = "./dist/stg/group"
  const dbpath = "./dist/db/room"
  const chatpath = `./dist/db/room/${cdb.c}.json`

  if (fs.existsSync(roompath) || cdb.c || fs.existsSync(mediapath)) {
    fs.rmSync(mediapath, { recursive: true, force: true })
  }

  if (fs.existsSync(grouppath) && cdb.i && fs.existsSync(`${grouppath}/${cdb.i}`)) {
    fs.rmSync(`${grouppath}/${cdb.i}`, { recursive: true, force: true })
  }

  if (fs.existsSync(dbpath) && cdb.c && fs.existsSync(chatpath)) {
    fs.rmSync(chatpath, { recursive: true, force: true })
  }

  cdb.u.forEach((usr) => {
    zender(uid, usr, "memberkick", { groupid: roomid })
  })

  delete db.ref.c[roomid]
  db.save("c")

  return { code: 200 }
}

export function kickMember(uid: string, userid: string, roomid: string): IRepTempB {
  const gdb = db.ref.c[roomid]
  if (!gdb) return { code: 404, msg: "GRPS_404" }
  if (gdb.o !== uid) return { code: 404, msg: "GRPS_OWNER_FEATURE" }
  if (!gdb.u.find((usr) => usr === userid)) return { code: 404, msg: "FIND_NOTFOUND" }
  zender(uid, userid, "memberkick", { groupid: roomid })
  gdb.u
    .filter((usr) => usr !== uid)
    .forEach((usr) => {
      zender(userid, usr, "memberleave", { groupid: roomid })
    })
  db.ref.c[roomid].u = db.ref.c[roomid].u.filter((usr) => usr !== userid)
  db.save("c")
  return { code: 200 }
}
