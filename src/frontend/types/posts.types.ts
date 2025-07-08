import { IUserF } from "./db.types"

export interface ICommentF {
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
