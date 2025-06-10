import { ChatsDB, MeDB, PeerDB } from "../../client/types/db.types"

export type AccountDB = {
  me?: MeDB
  c?: ChatsDB[]
  peer?: PeerDB
}
