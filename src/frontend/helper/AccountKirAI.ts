import { IRoomDataF, IUserF } from "../types/db.types"

export function KirAIRoom(): IRoomDataF {
  return {
    id: "420",
    long: "Kirimin AI",
    short: "kirai",
    type: "user",
    badges: [5]
  }
}
export function KirAIUser(): IUserF {
  return {
    id: "420",
    username: "kirai",
    displayname: "Kirimin AI",
    bio: "Kirimin Chat Bot",
    isFriend: 1,
    badges: [5]
  }
}
