import { Zender } from "../types/validate.types"
import db from "./db"
import { rNumber } from "./helper"

export default function zender(uid: string, userid: string, type: string, s: { [key: string]: string | number | boolean }): void {
  const udb = db.ref.u[userid]
  if (!udb || !udb.peer) return
  const data: Zender = {
    key: `${uid}_${Date.now().toString()}_${rNumber(3)}`,
    from: uid,
    type: type,
    ...s
  }
  if (!udb.zzz) db.ref.u[userid].zzz = []
  db.ref.u[userid].zzz?.push(data)
}
