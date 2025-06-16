import { Request, Response, NextFunction } from "express"
import "express-session"
import { IMondinObject, ISessionUserB } from "../../interfaces/binder.interfaces"

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string
      data: ISessionUserB
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
      data: ISessionUserB
    }
  }
}

declare module "peer" {
  interface IMessage {
    kirimin: IMondinObject
  }
}
