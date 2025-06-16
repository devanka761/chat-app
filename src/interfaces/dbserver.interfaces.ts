/* eslint-disable @typescript-eslint/no-explicit-any */
// import { IMessageWriterType } from "../../client/types/message.types"
import { MessageType, RoomType } from "../types/messages.types"
import { IAuthUserB } from "./binder.interfaces"

export interface TemporaryAuth {
  email: string
  otp: {
    code: string | number
    expiry: number
  }
  rate: number
  cd?: number
}

export interface UserProcess {
  id?: string
  data: IAuthUserB
}

export interface IUserB {
  id: string
  img?: string
  uname?: string
  dname?: string
  bio?: string
  b?: number[]
  data: IAuthUserB[]
  peer?: string
  zzz?: any[]
  req?: string[]
  lu?: number
  ld?: number
  lb?: number
}

export interface IMessageB {
  u: string
  ts: number
  w?: string[]
  txt?: string
  ty?: MessageType
  e?: number
  i?: string
  d?: boolean
  r?: string
  v?: string
  vc?: 1 | 0
  rj?: 1 | 0
}
export interface IChatKeyB {
  [key: string]: IMessageB
}
export interface IChatsB {
  u: string[]
  o?: string
  n?: string
  i?: string
  t: RoomType
  b?: number[]
  l?: string
  f?: 1 | 0
  c?: string[]
}

interface PostCommentObject {
  u: string
  txt: string
  ts: string
}

export interface IPostB {
  u: string
  ts: string
  i: string
  l?: string[]
  txt?: string
  c?: { [key: string]: PostCommentObject }
}

export interface Call {
  t: 1 | 0
  o: number
  st: 0
  u: Array<{ id: string; j: boolean }>
}

export type DatabasesB = {
  u: { [key: string]: IUserB }
  t: { [key: string]: TemporaryAuth }
  c: { [key: string]: IChatsB }
  p: { [key: string]: IPostB }
  v: { [key: string]: Call }
}
