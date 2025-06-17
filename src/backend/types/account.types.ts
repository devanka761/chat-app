import { IChatsF, MeDB, PeerDB } from "../../frontend/types/db.types"

export interface IAccountB {
  me?: MeDB
  c?: IChatsF[]
  peer?: PeerDB
}
