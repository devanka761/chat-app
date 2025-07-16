import { WebSocket } from "ws"

export type TRelay = {
  id: string
  socket: WebSocket
}

export type TSocketMessageB = {
  [key: string]: string | number | boolean | null
}

export type TSocketHandlerB = {
  [key: string]: (uid: string, from: string, data: TSocketMessageB) => void
}
export interface ISocketB {
  type: string
  from: string
  uid: string
}
