import { IMessageTempF } from "../types/db.types"
import { IWritterF } from "../types/message.types"

export function convertMessage(uid: string, s: IWritterF): IMessageTempF {
  return {
    userid: uid,
    timestamp: s.timestamp || Date.now(),
    edited: s.edit ? Date.now() : undefined,
    reply: s.reply,
    text: s.text,
    type: s.type,
    source: s.filesrc
  }
}
