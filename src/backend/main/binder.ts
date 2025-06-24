import { Request, Response, NextFunction } from "express"
import "express-session"
import { IUserSessionB } from "../types/binder.types"

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string
      data: IUserSessionB
    }
  }
}

export const sessionUserBinder = (req: Request, res: Response, next: NextFunction) => {
  Object.defineProperty(req, "user", {
    get() {
      return req.session.user
    },
    set(user) {
      req.session.user = user
    },
    configurable: true,
    enumerable: true
  })

  next()
}

declare module "express" {
  interface Request {
    user?: {
      id: string
      data: IUserSessionB
    }
  }
}
