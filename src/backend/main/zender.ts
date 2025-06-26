import { IZender } from "../types/validate.types"
import db from "./db"
import { rNumber } from "./helper"
import relay from "./relay"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Zend = { [key: string]: any }

export default function zender(uid: string, userid: string, type: string, s?: Zend): boolean {
  const udb = db.ref.u[userid]
  if (userid === uid) return true
  if (!udb || !udb.socket) return false
  const data: IZender = {
    key: `${uid}-${Date.now().toString(36)}_${rNumber(3)}`,
    from: uid,
    type: type,
    ...s
  }
  const client = relay.get(udb.socket)
  if (!client) return false
  client.socket.send(JSON.stringify(data))
  return true
}
