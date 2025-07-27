import { IChatsF, MeDB, SocketDB } from "../../frontend/types/db.types"

export interface IAccountB {
  me?: MeDB
  c?: IChatsF[]
  socket?: SocketDB
  v?: number
  publicKey: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  peer?: any | null
}
