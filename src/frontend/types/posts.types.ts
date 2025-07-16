import { IUserF } from "./db.types"

export interface ICommentF {
  id: string
  user: IUserF
  ts: number
  text: string
}

export interface IPostF {
  id: string
  user: IUserF
  ts: number
  img: string
  text?: string
  likes: number
  comments: number
  liked: boolean
}

export type TPostsF = IPostF[]
export type TCommentsF = ICommentF[]

export interface IPostB {
  file: string
  name: string
  text?: string | null
}

export interface ICommentB {
  text: string
}
