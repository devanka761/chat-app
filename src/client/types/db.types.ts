import { UserProfile } from "../../server/types/profile.types"
import { IMessageWriter } from "./message.types"

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
export interface ChatDB extends IMessageWriter {
  id: string
  userid: string
  timestamp: number
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
