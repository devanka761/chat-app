import { TRoomTypeF } from "./room.types"

export interface EmailProvider {
  provider: string
  email: string
}

export interface PeerDB {
  peerid: string
  peerConfig: {
    host: string
    port?: number
    key: string
    path: string
    config?: {
      iceServers: [
        { urls: string },
        {
          urls: string
          username: string
          credential: string
        }
      ]
    }
  }
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
export type MessageTypeF = "text" | "image" | "video" | "audio" | "file" | "deleted" | "call" | "voice"

export interface IMessageTempF {
  userid: string
  timestamp: number
  text?: string
  type?: MessageTypeF
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
  id: string
  long: string
  short: string
  image?: string
  badges?: number[]
  type: TRoomTypeF
}
export interface IChatsF {
  r: IRoomDataF
  u: IUserF[]
  m: IMessageF[]
}
export interface Databases {
  me: MeDB
  c: IChatsF[]
  unread: {
    g?: (string | number | boolean)[]
    c?: (string | number | boolean)[]
    r?: (string | number | boolean)[]
  }
}
