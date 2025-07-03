import { IChatsF, MeDB, SocketDB } from "../../frontend/types/db.types"

export interface IAccountB {
  me?: MeDB
  c?: IChatsF[]
  socket?: SocketDB
  v?: number
}
