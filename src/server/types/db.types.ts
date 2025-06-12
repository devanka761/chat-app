import { IMessageWriterType } from "../../client/types/message.types"
import { PossibleData, TempUserData, TempUserDatum, UserUID } from "./binder.types"

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
  data: TempUserData
}

export interface User {
  id: string
  img?: string
  uname?: string
  dname?: string
  bio?: string
  b?: number[]
  data: TempUserDatum
  peer?: string
  zzz?: PossibleData[]
  req?: UserUID[]
  lu?: number
  ld?: number
  lb?: number
}

export interface ChatObject {
  u: UserUID
  ts: number
  w?: string[]
  txt?: string
  ty?: IMessageWriterType
  e?: number
  i?: string
  d?: boolean
  r?: string
  v?: string
  vc?: 1 | 0
  rj?: 1 | 0
}
export interface IChatDBAPI {
  [key: string]: ChatObject
}
export interface Chat {
  u: UserUID[]
  f?: 1 | 0
  c?: string
  // c?: { [key: string]: ChatObject }
}

export interface Group extends Chat {
  o: string
  n: string
  i?: string
  t?: string
  b?: number[]
  l?: string
}

interface PostCommentObject {
  u: UserUID
  txt: string
  ts: string
}

export interface Post {
  u: UserUID
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
  u: Array<{ id: UserUID; j: boolean }>
}

export type Databases = {
  u: { [key: string]: User }
  t: { [key: string]: TemporaryAuth }
  c: { [key: string]: Chat }
  g: { [key: string]: Group }
  p: { [key: string]: Post }
  v: { [key: string]: Call }
}
