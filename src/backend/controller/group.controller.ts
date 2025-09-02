import fs from "fs"
import { IChatsF, IUserF } from "../../frontend/types/db.types"
import { convertGroup, normalizeMessage, rNumber } from "../main/helper"
import { IRepTempB } from "../types/validate.types"
import { getUser } from "./profile.controller"
import zender from "../main/zender"
import { KirAIRoom, KirAIUser } from "../../frontend/helper/AccountKirAI"
import Chat from "../models/Chat.Model"
import Metadata from "../models/Metadata.Model"
import Message, { IMessageDocument } from "../models/Message.Model"

export async function createGroup(uid: string, s: { name: string }): Promise<IRepTempB> {
  const hasMany = await Chat.find({ owner: uid }).lean()
  if (hasMany.length >= 2) return { code: 400, msg: "GRPS_OWN_MAX" }

  s.name = s.name.trim()

  if (s.name.length > 35) return { code: 400, msg: "GRPS_DNAME_LENGTH" }

  const metadataDoc = await Metadata.findOneAndUpdate({ id: "761" }, { $inc: { groups: 1 } })

  const chat_id = "6" + rNumber(5).toString() + (metadataDoc?.groups?.toString() || "1")
  const invite_link = rNumber(1) + (Number(chat_id) + rNumber(6)).toString(36).substring(1) + Date.now().toString(36)

  const roomData = new Chat({
    id: chat_id,
    users: [uid],
    owner: uid,
    name: s.name.trim(),
    type: "group",
    link: invite_link
  })

  await roomData.save()

  const groupData: IChatsF = {
    m: [],
    u: [await getUser(uid, uid)],
    r: await convertGroup(chat_id)
  }

  return { code: 200, data: { roomid: chat_id, group: groupData } }
}

export async function setGroupname(uid: string, s: { gname: string; id: string }): Promise<IRepTempB> {
  const group = await Chat.findOne({ id: s.id })
  if (!group) return { code: 404, msg: "GRPS_404" }

  if (!group.owner || group.owner !== uid) return { code: 403, msg: "GRPS_OWNER_FEATURE" }
  if (group.lastName && group.lastName > Date.now()) {
    return { code: 429, msg: "GRPS_DNAME_COOLDOWN", data: { timestamp: group.lastName } }
  }
  s.gname = s.gname.trim()

  if (s.gname === group.name) return { code: 200, data: { text: s.gname } }
  if (s.gname.length > 35) return { code: 400, msg: "GRPS_DNAME_LENGTH" }

  await group.updateOne({ $set: { name: s.gname, lastName: Date.now() + 1000 * 60 * 60 * 24 * 7 } })

  return { code: 200, data: { text: s.gname } }
}

export async function setImg(uid: string, s: { img: string; name: string; id: string }): Promise<IRepTempB> {
  const group = await Chat.findOne({ id: s.id, type: "group" })

  if (!group) return { code: 404, msg: "GRPS_404" }

  if (!group.owner || group.owner !== uid) return { code: 403, msg: "GRPS_OWNER_FEATURE" }

  const dataurl = decodeURIComponent(s.img)
  const buffer = Buffer.from(dataurl.split(",")[1], "base64")
  if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }

  const fpath = "./dist/stg/group"

  if (!fs.existsSync(fpath)) fs.mkdirSync(fpath)

  if (group.image) {
    if (fs.existsSync(`${fpath}/${group.image}`)) fs.rmSync(`${fpath}/${group.image}`)
  }

  const imgExt = /\.([a-zA-Z0-9]+)$/
  const imgName = `${s.id}_${Date.now().toString(35)}.${s.name.match(imgExt)?.[1]}`
  fs.writeFileSync(`${fpath}/${imgName}`, buffer)

  await group.updateOne({ $set: { image: imgName } })

  return { code: 200, data: { text: imgName } }
}

export async function resetLink(uid: string, s: { id: string }): Promise<IRepTempB> {
  const { id } = s

  const group = await Chat.findOne({ id, type: "group" })
  if (!group) return { code: 404, msg: "GRPS_404" }

  if (!group.owner || group.owner !== uid) return { code: 403, msg: "GRPS_OWNER_FEATURE" }

  const invite_link = rNumber(1) + (Number(id) + rNumber(6)).toString(36).substring(1) + Date.now().toString(36)
  await group.updateOne({ $set: { link: invite_link } })

  return { code: 200, data: { text: invite_link } }
}

export async function setLeave(uid: string, roomid: string): Promise<IRepTempB> {
  const group = await Chat.findOne({ id: roomid, type: "group" })
  if (!group) return { code: 200, msg: "GRPS_404" }

  if (roomid === "696969") return { code: 200, msg: "GLOBAL_OK" }

  if (group.owner === uid) return setDisband(uid, roomid)

  if (!group.users.find((usr) => usr === uid)) return { code: 400 }

  await group.updateOne({ $pull: { users: uid } })

  group.users.forEach((usr) => {
    zender(uid, usr, "memberleave", { groupid: roomid })
  })

  return { code: 200 }
}

async function setDisband(uid: string, roomid: string): Promise<IRepTempB> {
  const group = await Chat.findOne({ id: roomid, type: "group" })
  if (!group) return { code: 404, msg: "GRPS_404" }
  if (group.owner !== uid) return { code: 400, msg: "GRPS_OWNER_FEATURE" }

  const roompath = "./dist/stg/room"
  const mediapath = `${roompath}/${group.key}`
  const grouppath = "./dist/stg/group"

  if (fs.existsSync(roompath) || group.key || fs.existsSync(mediapath)) {
    fs.rmSync(mediapath, { recursive: true, force: true })
  }

  if (fs.existsSync(grouppath) && group.image && fs.existsSync(`${grouppath}/${group.image}`)) {
    fs.rmSync(`${grouppath}/${group.image}`, { recursive: true, force: true })
  }

  await Message.deleteMany({ roomId: group.id })

  group.users.forEach((usr) => {
    zender(uid, usr, "memberkick", { groupid: roomid })
  })

  await group.deleteOne()

  return { code: 200 }
}

export async function kickMember(uid: string, userid: string, roomid: string): Promise<IRepTempB> {
  const group = await Chat.findOne({ id: roomid, type: "group" })

  if (!group) return { code: 404, msg: "GRPS_404" }

  if (group.owner !== uid) return { code: 403, msg: "GRPS_OWNER_FEATURE" }

  if (!group.users.find((usr) => usr === userid)) return { code: 404, msg: "FIND_NOTFOUND" }

  await group.updateOne({ $pull: { users: userid } })

  group.users.forEach((usr) => {
    zender(userid, usr, "memberleave", { groupid: roomid })
  })

  return { code: 200 }
}

export async function getGroup(uid: string, groupid: string): Promise<IChatsF | null> {
  const group = await Chat.findOne({ id: groupid, type: "group" })
  if (!group) return null

  const message = (await Message.find({ roomId: groupid }).sort({ ts: -1 }).limit(1000)) || []

  const chats: IChatsF = {
    r: await convertGroup(groupid),
    u: await Promise.all(group.users.map(async (usr) => await getUser(uid, usr))),
    m: message.map((msg) => {
      return normalizeMessage(msg.id, msg.toJSON())
    })
  }

  return chats
}

export async function joinGroup(uid: string, groupid: string, link: string): Promise<IRepTempB> {
  const group = await Chat.findOne({ id: groupid, type: "group" })

  if (!group || !group.link || group.link !== link) return { code: 404, msg: "INV_NOT_FOUND_DESC" }

  if (groupid === "696969" || link === "zzzzzz") return await getGlobalChats(uid)

  if (group.users.find((usr) => usr === uid)) return { code: 200, data: await getGroup(uid, groupid) }

  if (group.users.length >= 10) {
    return { code: 404, msg: "GRPS_MEMBER_LIMIT" }
  }

  group.users.forEach(async (usr) => {
    zender(uid, usr, "memberjoin", { groupid, user: await getUser(usr, uid) })
  })

  await group.updateOne({ $push: { users: uid } })

  return { code: 200, data: await getGroup(uid, groupid) }
}

export function getGlobalMembers(uid: string, chatsdb: IMessageDocument[]): string[] {
  const usersIds: string[] = []

  chatsdb.forEach((msg) => {
    if (!usersIds.find((usr) => usr === msg.user)) usersIds.push(msg.user)
  })

  if (!usersIds.find((usr) => usr === uid)) usersIds.push(uid)

  return usersIds
}

export async function getGlobalChats(uid: string): Promise<IRepTempB> {
  const messages = await Message.find({ roomId: "696969" }).sort({ ts: -1 }).limit(1000)
  if (!messages) return { code: 404, msg: "GRPS_404" }

  const users: IUserF[] = await Promise.all(getGlobalMembers(uid, messages).map(async (usr) => await getUser(uid, usr)))

  const data: IChatsF = {
    u: users,
    r: await convertGroup("696969"),
    m: messages.map((msg) => {
      return normalizeMessage(msg.id, msg.toJSON())
    })
  }

  return { code: 200, data }
}
export async function getAIChats(uid: string): Promise<IRepTempB> {
  const messages = await Message.find({ roomId: `ai${uid}` })
    .sort({ ts: -1 })
    .limit(1000)

  const users: IUserF[] = [KirAIUser, await getUser(uid, uid)]

  const data: IChatsF = {
    u: users,
    r: KirAIRoom,
    m: messages.map((msg) => {
      return normalizeMessage(msg.id, msg.toJSON())
    })
  }

  return { code: 200, data }
}
