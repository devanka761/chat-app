export type RoomVoiceContent = string
export interface RoomFileContent {
  name: string
  src: string
}
export interface RoomFormContent {
  rep?: string
  voice?: RoomVoiceContent
  file?: RoomFileContent
}
export type RoomType = "user" | "group"
export interface RoomDetail {
  type: RoomType
  id: string
  name: { short: string; full: string }
  img?: string
  badges?: number[]
}

export type TStatusIcon = {
  [key in TStatusText]: string
}
export type TStatusText = "pending" | "sent" | "read" | "failed"

export interface IRoomFind {
  type: RoomType
  id: string
}
