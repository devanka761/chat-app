import { PushSubscription } from "web-push"

export interface IUser {
  id: string
  image?: string
  username: string
  displayname: string
  bio?: string
  badges?: number[]
  socket?: string
  push: PushSubscription
  req?: string[]
  lastUsername?: number
  lastDisplayname?: number
  lastBio?: number
}
