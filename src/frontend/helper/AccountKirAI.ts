import { IRoomDataF, IUserF } from "../types/db.types"

export const KirAIRoom: IRoomDataF = {
  id: "420",
  long: "Kirimin AI",
  short: "kirai",
  type: "user",
  image: "kirai_user.png",
  badges: [6]
}
export const KirAIUser: IUserF = {
  id: "420",
  username: "kirai",
  displayname: "Kirimin AI",
  bio: "Kirimin Chat Bot",
  image: "kirai_user.png",
  isFriend: 0,
  badges: [6]
}
