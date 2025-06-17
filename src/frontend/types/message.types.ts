import { MessageTypeF } from "./db.types"

export interface IWritterF {
  userid?: string
  timestamp?: number
  text?: string
  type?: MessageTypeF
  edit?: string
  reply?: string
  filesrc?: string
  filename?: string
}

export type MessageOptionType = "profile" | "reply" | "edit" | "retry" | "delete" | "cancel"
