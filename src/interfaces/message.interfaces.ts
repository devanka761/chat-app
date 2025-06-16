import { MessageType } from "../types/messages.types"

export interface IWriteF {
  userid?: string
  text?: string
  type?: MessageType
  edit?: string
  reply?: string
  filesrc?: string
  filename?: string
}

export interface RoomData {
  id: string
  long: string
  short: string
  owner: string
  image: string
  badges: number[]
}
