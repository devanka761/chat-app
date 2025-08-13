import { IUserF } from "../../frontend/types/db.types"
import db from "../main/db"
import { convertUser } from "../main/helper"
import { sendPushNotification } from "../main/prepare"
import zender from "../main/zender"
import { IRepTempB } from "../types/validate.types"

function isFriend(uid: string, userid: string): number {
  const cdb = db.ref.c
  const isfriend = Object.values(cdb).find((ch) => ch.u.includes(uid) && ch.u.includes(userid) && ch.f === 1)
  if (isfriend) return 1
  const udb = db.ref.u
  if (udb[userid]?.req?.find((usr) => usr === uid)) return 2
  if (udb[uid]?.req?.find((usr) => usr === userid)) return 3
  return 0
}

export function getUser(uid: string, userid: string): IUserF {
  const udb = db.ref.u[userid]
  const data: IUserF = {
    id: udb?.id || "-1",
    username: <string>udb?.uname || "Former Member",
    displayname: <string>udb?.dname || "Former Member",
    isFriend: isFriend(uid, userid) || 0
  }
  if (udb?.b) data.badges = udb.b
  if (udb?.bio) data.bio = udb.bio
  if (udb?.img) data.image = udb.img
  return data
}

export function searchUser(uid: string, userid: string): IRepTempB {
  userid = userid.toLowerCase()
  if (userid === "user" || userid === "user7") return searchRandom(uid)
  const udb = db.ref.u

  const users = Object.values(udb)
    .filter((usr) => {
      return usr.id !== uid && (usr.id === userid || usr.uname?.toLowerCase().includes(userid))
    })
    .slice(0, 20)
    .map((usr) => {
      return getUser(uid, usr.id)
    })

  if (users.length < 1) return { code: 404, msg: "FIND_NOTFOUND" }
  return { code: 200, data: { users } }
}

function userRandom(users: string[]): string {
  return users[Math.floor(Math.random() * users.length)]
}

function searchRandom(uid: string): IRepTempB {
  const udb = db.ref.u
  const users = Object.values(udb)
    .filter((usr) => {
      return usr.id !== uid
    })
    .map((usr) => usr.id)

  const maxlength = users.length > 20 ? 20 : users.length
  const findArr: string[] = []

  for (let i = 0; i < maxlength; i++) {
    findArr.push(userRandom(users.filter((k) => !findArr.includes(k))))
  }

  const userlist = findArr.map((k) => getUser(uid, k))

  return { code: 200, data: { users: userlist } }
}

export function addfriend(uid: string, s: { userid: string }): IRepTempB {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  const mdb = db.ref.u[uid]
  const isfriend = isFriend(uid, s.userid)
  if (isfriend === 1) return { code: 200, data: { user: getUser(uid, s.userid) } }
  if (mdb.req?.includes(s.userid)) return acceptfriend(uid, s)
  if (udb.req?.includes(uid)) return { code: 200, data: { user: getUser(uid, s.userid) } }
  if (!udb.req) {
    db.ref.u[s.userid].req = []
  }
  db.ref.u[s.userid].req?.push(uid)
  db.save("u")
  zender(uid, s.userid, "addfriend", { user: getUser(s.userid, uid) })

  sendPushNotification(s.userid, {
    title: `@${mdb.uname}`,
    text: `Kirimin - Friend Request - @${mdb.uname}`,
    tag: "new-friend-request",
    url: `/app?user=${uid}`
  })
  return { code: 200, data: { user: getUser(uid, s.userid) } }
}
export function unfriend(uid: string, s: { userid: string }): IRepTempB {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  if (udb.req?.includes(uid)) db.ref.u[s.userid].req = udb.req.filter((k) => k !== uid)
  const mdb = db.ref.u[uid]
  if (mdb.req?.includes(s.userid)) db.ref.u[uid].req = mdb.req.filter((k) => k !== s.userid)
  const cdb = db.ref.c
  const friendkey = Object.keys(cdb).find((k) => {
    return cdb[k].u.includes(uid) && cdb[k].u.includes(s.userid) && cdb[k].f === 1
  })
  if (!friendkey) return { code: 200, data: { user: getUser(uid, s.userid) } }
  delete db.ref.c[friendkey].f
  db.save("u", "c")

  zender(uid, s.userid, "unfriend", { user: getUser(s.userid, uid) })
  return { code: 200, data: { user: getUser(uid, s.userid) } }
}
export function cancelfriend(uid: string, s: { userid: string }): IRepTempB {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  if (!udb.req || !udb.req.includes(uid)) return { code: 200, data: { user: getUser(uid, s.userid) } }
  db.ref.u[s.userid].req = udb.req.filter((key) => key !== uid)
  db.save("u")

  zender(uid, s.userid, "cancelfriend", { user: getUser(s.userid, uid) })
  return { code: 200, data: { user: getUser(uid, s.userid) } }
}
export function acceptfriend(uid: string, s: { userid: string }): IRepTempB {
  if (uid === s.userid) return { code: 400 }
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  const isfriend = isFriend(uid, s.userid)
  if (isfriend === 1) return { code: 200, data: { user: getUser(uid, s.userid) } }
  if (udb.req?.includes(uid)) db.ref.u[s.userid].req = udb.req.filter((k) => k !== uid)
  const mdb = db.ref.u[uid]
  if (!mdb.req || !mdb.req.includes(s.userid)) return { code: 404, data: { user: getUser(uid, s.userid) } }
  db.ref.u[uid].req = mdb.req.filter((k) => k !== s.userid)
  const cdb = db.ref.c
  const oldfriendkey = Object.keys(cdb).find((k) => {
    return cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === s.userid)
  })

  const friendkey = oldfriendkey || `${s.userid}u${uid}`

  if (!cdb[friendkey])
    db.ref.c[friendkey] = {
      u: [uid, s.userid],
      // f: 1,
      t: "user"
    }
  if (cdb[friendkey].f != 1) db.ref.c[friendkey].f = 1
  db.ref.c[friendkey].ts = Date.now()
  db.save("u", "c")

  zender(uid, s.userid, "acceptfriend", { user: getUser(s.userid, uid) })

  sendPushNotification(s.userid, {
    title: `@${mdb.uname}`,
    text: `Kirimin - Request Accepted - @${mdb.uname}`,
    tag: "new-friend-accepted",
    url: `/app?user=${uid}`
  })

  return { code: 200, data: { user: getUser(uid, s.userid), room: convertUser(s.userid) } }
}
export function ignorefriend(uid: string, s: { userid: string }): IRepTempB {
  const udb = db.ref.u[s.userid]
  if (!udb) return { code: 404 }
  if (udb.req?.includes(uid)) db.ref.u[s.userid].req = udb.req.filter((key) => key !== uid)
  const mdb = db.ref.u[uid]
  if (mdb.req?.includes(s.userid)) db.ref.u[uid].req = mdb.req.filter((key) => key !== s.userid)
  db.save("u")

  zender(uid, s.userid, "ignorefriend", { user: getUser(s.userid, uid) })
  return { code: 200, data: { user: getUser(uid, s.userid) } }
}

export function badgesEdit(uid: string, userid: string, badges: number[]): IRepTempB {
  if (badges instanceof Array === false) return { code: 400 }
  if (!db.ref.u[uid] || !db.ref.u[uid].b || !db.ref.u[uid].b.find((badge) => badge === 1)) {
    return { code: 403, msg: "FORBIDDEN" }
  }
  if (!db.ref.u[userid]) return { code: 404 }
  const validBadge = [2, 3, 4, 5]
  badges = badges.filter((badge) => validBadge.find((validBadge) => validBadge === badge))
  if (badges.length < 1) {
    if (db.ref.u[userid].b) delete db.ref.u[userid].b
  } else {
    if (!db.ref.u[userid].b) db.ref.u[userid].b = []
    db.ref.u[userid].b = badges
  }
  db.save("u")
  zender(uid, userid, "newbadges", { badges })
  return { code: 200, data: { badges } }
}
