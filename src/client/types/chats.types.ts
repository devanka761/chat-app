import { ChatDB, UserDB } from "./db.types"

export type ChatType = "text" | "audio" | "image" | "video" | "call" | "file" | "deleted" | "voice"
export interface ChatUser {
  username: string
  id: string
  photo?: string
  badges?: number[]
}
export interface ChatLastChat {
  userid: string
  text?: string
  type: ChatType
  timestamp: number
  watch: string[]
}
export interface ChatCard {
  user: UserDB
  lastchat: ChatDB
  unread: number
}
