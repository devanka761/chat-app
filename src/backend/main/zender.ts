import User from "../models/User.Model"
import { IZender } from "../types/validate.types"
import { rNumber } from "./helper"
import relay from "./relay"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Zend = { [key: string]: any }

export default async function zender(uid: string, userid: string, type: string, s?: Zend): Promise<boolean> {
  if (userid === uid && (!s || !s.force)) return true
  const user = await User.findOne({ id: userid })
  if (!user || !user.socket) return false

  const data: IZender = {
    key: `${uid}-${Date.now().toString(36)}_${rNumber(3)}`,
    from: uid,
    type: type,
    ...s
  }
  delete data.force
  const client = relay.get(user.socket)
  if (!client) return false
  client.socket.send(JSON.stringify(data))
  return true
}
