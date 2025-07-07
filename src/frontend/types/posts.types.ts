import { IUserF } from "./db.types"

export interface ICommentF {
  user: IUserF
  ts: number
  text: string
}

export interface IPostF {
  user: IUserF
  ts: number
  img: string
  text?: string
  likes: number
  comments: number
}

export type TPostsF = IPostF[]
export type TCommentsF = ICommentF[]
