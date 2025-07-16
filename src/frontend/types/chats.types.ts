import { IMessageF, IRoomDataF } from "../../frontend/types/db.types"

export interface ChatCard {
  related: IRoomDataF
  last: IMessageF
  unread: number
}
