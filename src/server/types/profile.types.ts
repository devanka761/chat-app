export interface UserProfile {
  id: string
  image?: string
  username: string
  displayname: string
  bio?: string
  badges?: number[]
  isFriend?: number
}

export interface GroupProfile extends UserProfile {
  link?: string
  owner?: string
  type?: "private" | "public" | "global"
}
