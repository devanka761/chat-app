import { CallType, ICallType } from "./call.types"

export type IMessageType = "text" | "image" | "video" | "audio" | "file" | "deleted" | "call" | "voice" | "think"

export enum MessageType {
  Text = "text",
  Image = "image",
  Video = "video",
  Audio = "audio",
  File = "file",
  Deleted = "deleted",
  Call = "call",
  Voice = "voice",
  Think = "think"
}

export interface IMessage {
  id: string
  roomId: string
  user: string
  ts: number
  readers?: string[]
  text?: string
  type?: MessageType | IMessageType
  edited?: number
  source?: string
  deleted?: boolean
  replyTo?: string
  duration?: number
  call?: CallType | ICallType
}
