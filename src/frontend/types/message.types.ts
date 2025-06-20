import { IMessageF, MessageTypeF } from "./db.types"

export type msgValidTypes = ["audio", "file", "video", "image", "voice"]

export interface IWritterFileF {
  src: string
  name: string
  isVoice?: boolean
}

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

export type MessageOptionType = "profile" | "copy" | "download" | "reply" | "edit" | "retry" | "delete" | "cancel"

export interface IMessageUpdateF {
  isFirst: boolean
  roomid: string
  chat: IMessageF
}
