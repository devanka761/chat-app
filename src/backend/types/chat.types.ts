export type IChatType = "user" | "group"

export enum ChatType {
  User = "user",
  Group = "group"
}

export interface IChat {
  id: string
  users: string[]
  friend?: boolean
  key?: string
  owner?: string
  name?: string
  image?: string
  type: ChatType | IChatType
  badges?: number[]
  link?: string
  lastName?: number
  ts?: number
}
