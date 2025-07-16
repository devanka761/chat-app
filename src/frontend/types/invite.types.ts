import { IRoomDataF } from "./db.types"
import { TRoomTypeF } from "./room.types"

export interface IGetInvite {
  data: IRoomDataF
  members: number
  joined: boolean
  type: TRoomTypeF
}
