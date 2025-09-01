import { PushSubscription } from "web-push"

export interface IUser {
  id: string
  image?: string
  username: string
  displayName: string
  bio?: string
  badges?: number[]
  socket?: string
  push: PushSubscription
  req?: string[]
  lastUsername?: number
  lastDisplayName?: number
  lastBio?: number
}
