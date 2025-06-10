import { UserDB } from "../../client/types/db.types"
import db from "../main/db"
import zender from "../main/zender"
import { UserProfile } from "../types/profile.types"
import { IRepBackRec } from "../types/validate.types"

function isFriend(uid: string, userid: string): number {
  const cdb = db.ref.c
  const isfriend = Object.values(cdb).find((ch) => ch.u.includes(uid) && ch.u.includes(userid) && ch.f === 1)
  if (isfriend) return 1
  const udb = db.ref.u
  if (udb[userid].req?.includes(uid)) return 2
  if (udb[uid].req?.includes(userid)) return 3
  return 0
}

export function getUser(uid: string, userid: string): UserDB {
  const udb = db.ref.u[userid]
  const data: UserProfile = {
    id: udb.id,
    username: <string>udb.uname,
    displayname: <string>udb.dname,
    isFriend: isFriend(uid, userid)
  }
  if (udb.b) data.badges = udb.b
  if (udb.bio) data.bio = udb.bio
  if (udb.img) data.image = udb.img
  return { ...data }
}

export function searchUser(uid: string, userid: string) {
  const udb = db.ref.u
  const users = Object.values(udb)
    .filter((usr) => {
      return usr.id !== uid && (usr.id === userid || usr.uname?.includes(userid))
    })
    .map((usr) => {
      return { ...getUser(uid, usr.id) }
    })

  if (users.length < 1) return { code: 404, msg: "FIND_NOTFOUND" }
  return { code: 200, data: { users } }
}

export function addfriend(uid: string, s: { userid: string }): IRepBackRec {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  const mdb = db.ref.u[uid]
  const isfriend = isFriend(uid, s.userid)
  if (isfriend === 1) return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
  if (mdb.req?.includes(s.userid)) return acceptfriend(uid, s)
  if (udb.req?.includes(uid)) return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
  if (!udb.req) {
    db.ref.u[s.userid].req = []
  }
  db.ref.u[s.userid].req?.push(uid)
  db.save("u")
  zender(uid, s.userid, "addfriend", { id: uid })
  return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
}
export function unfriend(uid: string, s: { userid: string }): IRepBackRec {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  if (udb.req?.includes(uid)) db.ref.u[s.userid].req = udb.req.filter((k) => k !== uid)
  const mdb = db.ref.u[uid]
  if (mdb.req?.includes(s.userid)) db.ref.u[uid].req = mdb.req.filter((k) => k !== s.userid)
  const cdb = db.ref.c
  const friendkey = Object.keys(cdb).find((k) => {
    return cdb[k].u.includes(uid) && cdb[k].u.includes(s.userid) && cdb[k].f === 1
  })
  if (!friendkey) return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
  delete db.ref.c[friendkey].f
  db.save("u", "c")

  zender(uid, s.userid, "unfriend", { id: uid })
  return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
}
export function cancelfriend(uid: string, s: { userid: string }): IRepBackRec {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  if (!udb.req || !udb.req.includes(uid)) return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
  db.ref.u[s.userid].req = udb.req.filter((key) => key !== uid)
  db.save("u")

  zender(uid, s.userid, "cancelfriend", { id: uid })
  return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
}
export function acceptfriend(uid: string, s: { userid: string }): IRepBackRec {
  if (uid === s.userid) return { code: 400 }
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  const isfriend = isFriend(uid, s.userid)
  if (isfriend === 1) return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
  if (udb.req?.includes(uid)) db.ref.u[s.userid].req = udb.req.filter((k) => k !== uid)
  const mdb = db.ref.u[uid]
  if (!mdb.req || !mdb.req.includes(s.userid)) return { code: 404, data: { user: { ...getUser(uid, s.userid) } } }
  db.ref.u[uid].req = mdb.req.filter((k) => k !== s.userid)
  const cdb = db.ref.c
  const oldfriendkey = Object.keys(cdb).find((k) => {
    return cdb[k].u.includes(uid) && cdb[k].u.includes(s.userid) && cdb[k].f === 1
  })

  const friendkey = oldfriendkey || "m" + Date.now().toString(36)

  if (!cdb[friendkey])
    db.ref.c[friendkey] = {
      u: [uid, s.userid],
      f: 1
    }
  db.save("u", "c")

  zender(uid, s.userid, "acceptfriend", { id: uid })
  return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
}
export function ignorefriend(uid: string, s: { userid: string }): IRepBackRec {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  if (udb.req?.includes(uid)) db.ref.u[s.userid].req = udb.req.filter((key) => key !== uid)
  const mdb = db.ref.u[uid]
  if (mdb.req?.includes(s.userid)) db.ref.u[uid].req = mdb.req.filter((key) => key !== s.userid)
  db.save("u")

  zender(uid, s.userid, "ignorefriend", { id: uid })
  return { code: 200, data: { user: { ...getUser(uid, s.userid) } } }
}
