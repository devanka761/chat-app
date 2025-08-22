import { Request, Response, NextFunction } from "express"
import "express-session"

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
