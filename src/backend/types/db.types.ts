import { MessageTypeF } from "../../frontend/types/db.types"
import { TRoomTypeF } from "../../frontend/types/room.types"
import { IUserTempB } from "./binder.types"
import { SivalKeyType } from "./validate.types"

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
  zzz?: SivalKeyType[]
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

interface PostCommentObject {
  u: string
  txt: string
  ts: string
}

export interface Post {
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

export type Databases = {
  u: { [key: string]: IUserB }
  t: { [key: string]: TemporaryAuth }
  c: { [key: string]: IChatB }
  p: { [key: string]: Post }
  v: { [key: string]: Call }
  k: { v?: number; g?: number }
}
