import { IChatsF } from "../../frontend/types/db.types"
import db from "../main/db"
import { convertGroup, convertUser } from "../main/helper"
import { IChatB } from "../types/db.types"
import { IRepTempB } from "../types/validate.types"

export function createGroup(uid: string, s: { name: string }): IRepTempB {
  const cdb = db.ref.c
  const hasMany = Object.keys(cdb).filter((k) => cdb[k].o === uid)
  if (hasMany.length >= 2) return { code: 400, msg: "GRPS_OWN_MAX" }

  s.name = s.name.trim()

  if (s.name.length > 35) return { code: 400, msg: "GRPS_DNAME_LENGTH" }

  const chat_id = "g" + Date.now().toString(36)

  const roomData: IChatB = {
    u: [uid],
    o: uid,
    n: s.name.trim(),
    t: "group",
    c: chat_id
  }
  db.ref.c[chat_id] = { ...roomData }
  db.save("c")
  db.fileSet(chat_id, "room", {})
  const groupData: IChatsF = {
    m: [],
    u: [],
    r: convertGroup(chat_id)
  }

  return { code: 200, data: { isFirst: true, roomid: chat_id, group: groupData } }
}
