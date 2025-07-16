import db from "../main/db"
import { convertUser, normalizeMessage } from "../main/helper"
import zender from "../main/zender"
import { Call, IMessageB, IMessageKeyB } from "../types/db.types"
import { getUser } from "./profile.controller"

function setToMessage(callKey: string, data: Call): boolean {
  const cdb = db.ref.c
  const usr1 = data.o
  const usr2 = data.u.find((usr) => usr.id !== usr1)?.id
  if (!usr1 || !usr2) return false
  const chatkey = Object.keys(cdb).find((k) => {
    return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === usr1) && cdb[k].u.find((usr) => usr === usr2)
  })
  if (!chatkey) return false
  if (!cdb[chatkey].f) return false
  if (!cdb[chatkey].c) db.ref.c[chatkey].c = chatkey
  const dbOld = (db.fileGet(chatkey, "room") || {}) as IMessageKeyB
  const newChat: IMessageB = {
    ts: Date.now(),
    u: usr1,
    vc: 0,
    ty: "call",
    dur: data.st >= 1 ? Date.now() - data.st : data.st,
    w: [usr2]
  }

  const updateType = dbOld[callKey] ? "editmessage" : "sendmessage"

  dbOld[callKey] = newChat
  db.fileSet(chatkey, "room", dbOld)
  const chatData = { ...normalizeMessage(callKey, dbOld[callKey]) }

  zender(usr1, usr1, updateType, {
    chat: chatData,
    roomdata: convertUser(usr2),
    users: cdb[chatkey].u.map((usr) => getUser(usr1, usr)),
    force: true
  })
  zender(usr1, usr2, updateType, {
    chat: chatData,
    roomdata: convertUser(usr1),
    users: cdb[chatkey].u.map((usr) => getUser(usr2, usr))
  })
  return true
}

export function forceExitCall(uid: string): void {
  const vdb = db.ref.v
  const callKeys = Object.keys(vdb).filter((k) => {
    return vdb[k].u.find((usr) => usr.id === uid)
  })
  if (callKeys.length < 1) return
  callKeys.forEach((k) => {
    setToMessage(k, vdb[k])
    const usr = vdb[k].u.find((usr) => usr.id !== uid)?.id
    if (usr) zender(uid, usr, "hangup", { user: getUser(usr, uid) })
    delete db.ref.v[k]
    db.save("v")
  })
}

export function createCallKey(uid: string, targetid: string): string | null {
  const vdb = db.ref.v
  const hasKey = Object.keys(vdb).find((k) => vdb[k].u.find((usr) => usr.id === uid))
  if (hasKey) return null
  const callKey = Date.now().toString(34)
  db.ref.v[callKey] = {
    o: uid,
    t: 0,
    st: 0,
    u: [
      { id: uid, j: true },
      { id: targetid as string, j: false }
    ]
  }
  const canSend = setToMessage(callKey, { ...db.ref.v[callKey], st: -2 })
  if (!canSend) {
    delete db.ref.v[callKey]
    return null
  }

  db.save("v")
  return callKey
}

export function createAnswer(uid: string, senderid: string, callKey: string): boolean {
  const vdb = db.ref.v
  const hasKey = Object.keys(vdb).find((k) => vdb[k].u.find((usr) => usr.id === uid && usr.j === true))
  if (hasKey) return false
  if (!vdb[callKey]) return false
  const noCall = !vdb[callKey].u.find((usr) => usr.id === uid) || !vdb[callKey].u.find((usr) => usr.id === senderid)
  if (noCall) return false
  db.ref.v[callKey].st = Date.now()
  const userCall = db.ref.v[callKey].u.find((usr) => usr.id === uid)
  if (!userCall) return false
  userCall.j = true
  db.save("v")

  return true
}

export function rejectCall(uid: string, senderid: string, callKey: string): void {
  const vdb = db.ref.v
  if (!vdb[callKey]) return
  db.ref.v[callKey].st = -1
  db.save("v")
}

export function terminateAllCalls(): void {
  const vdb = db.ref.v
  Object.keys(vdb).forEach((k) => forceExitCall(vdb[k].o))
}
