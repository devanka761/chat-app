import db from "../main/db"
import { convertGroup } from "../main/helper"
import { IRepTempB } from "../types/validate.types"
export function getInvite(uid: string | undefined, invite_id: string): IRepTempB {
  const cdb = db.ref.c

  const gkey = Object.keys(cdb).find((k) => {
    return cdb[k].t === "group" && cdb[k].l && cdb[k].l === invite_id
  })
  if (!gkey) return { code: 404 }
  const group = convertGroup(gkey)
  const joined = cdb[gkey].u.find((usr) => usr === (uid || "null")) ? true : false
  const members = cdb[gkey].u.length

  return { code: 200, data: { group, joined, members } }
}
export function acceptInvite(): IRepTempB {
  return { code: 200 }
}
