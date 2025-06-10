import { UserDB } from "./db.types"

export type IMessageWriterVoice = string

export interface IMessageWriterFiles {
  name: string
  src: string
}

export type IMessageWriterType = "text" | "image" | "video" | "audio" | "file" | "deleted" | "call" | "voice"

export interface IMessageWriter {
  userid?: string
  timestamp?: number
  watch?: string[]
  text?: string
  type?: IMessageWriterType
  edit?: string
  edittime?: number
  reply?: string
  filesrc?: string
  filename?: string
}

export interface IMessageEmbed {
  id: string
  user: UserDB
  type?: IMessageWriterType
  media?: string
  deleted?: boolean
  text?: string
}
export interface IMessageBuilder extends IMessageWriter {
  roomid: string
  id: string
  user: UserDB
  embed?: IMessageEmbed
}
