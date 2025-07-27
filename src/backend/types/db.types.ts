import { Chat } from "@google/genai"
import { MessageTypeF } from "../../frontend/types/db.types"
import { TRoomTypeF } from "../../frontend/types/room.types"
import { IUserTempB } from "./binder.types"

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
  data: IUserTempB
}

export interface IUserB {
  id: string
  img?: string
  uname: string
  dname: string
  bio?: string
  b?: number[]
  data: IUserTempB[]
  socket?: string
  zzz?: PushSubscription
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
  ty?: MessageTypeF
  e?: number
  i?: string
  d?: boolean
  r?: string
  dur?: number
  vc?: 1 | 0
}

export interface IChatB {
  u: string[]
  f?: 1 | 0
  c?: string
  o?: string
  n?: string
  i?: string
  t: TRoomTypeF
  b?: number[]
  l?: string
  lg?: number
  ts?: number
}

export type IMessageKeyB = {
  [key: string]: IMessageB
}

export interface PostCommentObject {
  u: string
  txt: string
  ts: number
}

export interface PostCommentKeyObject {
  [key: string]: PostCommentObject
}

export interface Post {
  u: string
  ts: number
  img: string
  l?: string[]
  txt?: string
  c?: PostCommentKeyObject
}

export interface Call {
  t: 1 | 0
  o: string
  st: number
  u: Array<{ id: string; j: boolean }>
}

export type Databases = {
  u: { [key: string]: IUserB }
  t: { [key: string]: TemporaryAuth }
  c: { [key: string]: IChatB }
  p: { [key: string]: Post }
  v: { [key: string]: Call }
  k: { v?: number; g?: number; publicKey: string; privateKey: string }
}

export type AIChat = {
  model: Chat
  rate: number
  ts: number
}
