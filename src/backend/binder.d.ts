import { type WebSocket } from "ws"
import { IAccountCookie } from "./types/account.types"

declare module "express-ws" {
  interface WebSocketWithHeartbeat extends WebSocket {
    isAlive: boolean
  }
}

declare module "express-session" {
  interface SessionData {
    user?: IAccountCookie
  }
}

declare module "express" {
  interface Request {
    user?: IAccountCookie
  }
}

export {}
