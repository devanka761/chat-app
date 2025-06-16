import { MessageType } from "../types/messages.types"
import { RoomData } from "./message.interfaces"

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

export interface IMeF {
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
export interface IMessageTempF {
  userid: string
  timestamp?: number
  text?: string
  type?: MessageType
  edited?: number
  reply?: string
  source?: string
}
export interface IMessageF extends IMessageTempF {
  id: string
  userid: string
  timestamp: number
  readers?: string[]
}
export interface IChatsF {
  r?: RoomData
  u: IUserF[]
  c: IMessageF[]
}
export interface DatabasesF {
  me: IMeF
  c: IChatsF[]
  unread: {
    g?: (string | number | boolean)[]
    c?: (string | number | boolean)[]
    r?: (string | number | boolean)[]
  }
  peer: PeerDB
}
