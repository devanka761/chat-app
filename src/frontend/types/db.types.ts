import { TRoomTypeF } from "./room.types"

export interface EmailProvider {
  provider: string
  email: string
}

export interface SocketDB {
  id: string
  host: string
}

export interface MeDB {
  id: string
  username: string
  displayname: string
  email?: EmailProvider[]
  badges?: number[]
  bio?: string
  image?: string
  req?: IUserF[]
}

export interface IUserF {
  id: string
  username: string
  displayname: string
  badges?: number[]
  bio?: string
  image?: string
  isFriend?: number
}
export type MessageTypeF = "text" | "image" | "video" | "audio" | "file" | "deleted" | "call" | "voice" | "think"

export type CallTypeF = "incoming" | "outgoing" | "rejected" | "missed" | "now"
// > 0, > 0, -1, 0, -2
export interface IMessageTempF {
  userid: string
  timestamp: number
  text?: string
  type?: MessageTypeF
  duration?: number
  edited?: number
  reply?: string
  source?: string
}
export interface IMessageF extends IMessageTempF {
  id: string
  readers?: string[]
}
export interface IChatKeyF {
  [key: string]: IMessageF
}
export interface IRoomDataF {
  owner?: string
  id: string
  long: string
  short: string
  image?: string
  badges?: number[]
  type: TRoomTypeF
  link?: string
}
export interface IChatsF {
  r: IRoomDataF
  u: IUserF[]
  m: IMessageF[]
}
export interface Databases {
  me: MeDB
  c: IChatsF[]
  version: number
}
