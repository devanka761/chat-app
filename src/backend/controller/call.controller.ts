import { convertUser, normalizeMessage } from "../main/helper"
import zender from "../main/zender"
import Call from "../models/Call.Model"
import Chat from "../models/Chat.Model"
import Message from "../models/Message.Model"
import { CallType, ICall } from "../types/call.types"
import { getUser } from "./profile.controller"

async function setToMessage(callKey: string, data: ICall): Promise<boolean> {
  const usr1 = data.owner
  const usr2 = data.users.find((usr) => usr.id !== usr1)?.id
  if (!usr1 || !usr2) return false

  const chat = await Chat.findOne({ type: "user", users: { $all: [usr1, usr2] }, friend: true })
  if (!chat) return false

  const messageExists = await Message.findOne({ id: callKey, roomId: chat.id })

  const message = await Message.findOneAndUpdate(
    {
      id: callKey,
      roomId: chat.id
    },
    {
      $set: {
        ts: Date.now(),
        user: usr1,
        roomId: chat.id,
        call: CallType.Voice,
        type: "call",
        duration: data.startAt >= 1 ? Date.now() - data.startAt : data.startAt,
        readers: [usr2]
      }
    },
    {
      upsert: true,
      new: true
    }
  )

  const updateType = messageExists ? "editmessage" : "sendmessage"

  const chatData = { ...normalizeMessage(callKey, message.toJSON()) }

  zender(usr1, usr1, updateType, {
    chat: chatData,
    roomdata: await convertUser(usr2),
    users: await Promise.all(chat.users.map(async (usr) => await getUser(usr1, usr))),
    force: true
  })
  zender(usr1, usr2, updateType, {
    chat: chatData,
    roomdata: await convertUser(usr1),
    users: await Promise.all(chat.users.map(async (usr) => await getUser(usr2, usr)))
  })
  return true
}

export async function forceExitCall(uid: string): Promise<void> {
  const calls = await Call.find({ users: uid })
  if (!calls || calls.length < 1) return

  calls.forEach(async (call) => {
    setToMessage(call.id, call)
    const usr = call.users.find((usr) => usr.id !== uid)?.id
    if (usr) zender(uid, usr, "hangup", { user: await getUser(usr, uid) })

    await call.deleteOne()
  })
}

export async function createCallKey(uid: string, targetid: string): Promise<string | null> {
  const callExists = await Call.findOne({ users: { $all: [{ id: uid }, { id: targetid }] } })
  if (callExists) return null

  const callKey = Date.now().toString(34)
  const call = new Call({
    id: callKey,
    owner: uid,
    users: [
      { id: uid, joined: true },
      { id: targetid, joined: false }
    ],
    startAt: 0,
    type: CallType.Voice
  })

  const canSend = await setToMessage(callKey, call)
  if (!canSend) return null

  await call.save()

  return callKey
}

export async function createAnswer(uid: string, senderid: string, callKey: string): Promise<boolean> {
  const call = await Call.findOne({ id: callKey, users: [{ id: uid, joined: true }] })
  if (!call) return false

  const noCall = !call.users.find((usr) => usr.id === uid) || !call.users.find((usr) => usr.id === senderid)
  if (noCall) return false

  await call.updateOne({ $set: { startAt: Date.now(), users: call.users.map((usr) => ({ id: usr.id, joined: true })) } })

  return true
}

export async function rejectCall(uid: string, senderid: string, callKey: string): Promise<void> {
  const call = await Call.findOne({ id: callKey, users: { $all: [{ id: uid }, { id: senderid }] } })
  if (!call) return

  await call.updateOne({ $set: { startAt: -1 } })
}

export async function terminateAllCalls(): Promise<void> {
  const calls = await Call.find().lean()

  calls.forEach(async (call) => await forceExitCall(call.owner))
}
