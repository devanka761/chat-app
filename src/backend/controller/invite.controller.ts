import { convertGroup } from "../main/helper"
import Chat from "../models/Chat.Model"
import { IRepTempB } from "../types/validate.types"
export async function getInvite(uid: string | undefined, invite_id: string): Promise<IRepTempB> {
  const room = await Chat.findOne({ link: invite_id, type: "group" })
  if (!room) {
    return { code: 404, data: { room: null, joined: false, members: 0 }, msg: "INV_NOT_FOUND" }
  }

  const group = await convertGroup(room.id)
  const joined = room.users.find((usr) => usr === (uid || "null")) ? true : false
  const members = room.id === "696969" ? Infinity : room.users.length

  return { code: 200, data: { group, joined, members } }
}
