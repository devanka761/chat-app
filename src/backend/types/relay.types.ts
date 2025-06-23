import { WebSocket } from "ws"

export type TRelay = {
  id: string
  socket: WebSocket
}
