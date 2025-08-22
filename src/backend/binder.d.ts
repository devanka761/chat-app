import { type WebSocket } from "ws"
import { IUserSessionB } from "./types/binder.types"

declare module "express-ws" {
  interface WebSocketWithHeartbeat extends WebSocket {
    isAlive: boolean
  }
}

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string
      data: IUserSessionB
    }
  }
}

declare module "express" {
  interface Request {
    user?: {
      id: string
      data: IUserSessionB
    }
  }
}

export {}
