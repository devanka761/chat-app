import { IChatsF, MeDB, PeerDB, SocketDB } from "../../frontend/types/db.types"

export interface IAccountB {
  me?: MeDB
  c?: IChatsF[]
  peer?: PeerDB
  socket?: SocketDB
}
