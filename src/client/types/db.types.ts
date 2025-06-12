import {} from "../../server/types/db.types"
import { UserProfile } from "../../server/types/profile.types"
import { IMessageWriterType } from "./message.types"

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
  req?: UserProfile[]
}

export interface UserDB {
  id: string
  username: string
  displayname: string
  badges?: number[]
  bio?: string
  image?: string
  isFriend?: number
}
export interface CIChatObject {
  userid: string
  timestamp: number
  text?: string
  type?: IMessageWriterType
  edited?: number
  reply?: string
  source?: string
}
export interface ChatDB extends CIChatObject {
  id: string
  userid: string
  timestamp: number
  readers?: string[]
}
export interface IChatCl {
  [key: string]: ChatDB
}
export interface ChatsDB {
  id: string
  u: UserDB[]
  c: ChatDB[]
}
export interface Databases {
  me: MeDB
  c: ChatsDB[]
  unread: {
    g?: (string | number | boolean)[]
    c?: (string | number | boolean)[]
    r?: (string | number | boolean)[]
  }
}
