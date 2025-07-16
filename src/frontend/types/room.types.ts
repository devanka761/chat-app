export type TRoomVoiceF = string

export interface IRoomFileF {
  name: string
  src: string
}
export interface IRoomFormF {
  rep?: string
  voice?: TRoomVoiceF
  file?: IRoomFileF
}
export type TRoomTypeF = "user" | "group"
export type TChatsTypeF = "all" | "user" | "group" | "unread"
export type TFriendsTypeF = "friend" | "request"

export type TStatusIcon = {
  [key in TStatusText]: string
}
export type TStatusText = "pending" | "sent" | "read" | "failed"
