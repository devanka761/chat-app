import { IMessageF } from "../types/db.types"

export default function noMessage(): IMessageF {
  return {
    id: "-1",
    timestamp: -1,
    userid: "-1",
    text: ""
  }
}
