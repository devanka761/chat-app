import { Request, Response, NextFunction } from "express"
import Account from "../models/Account.Model"

const userCDs = new Map()

export function cdUser(req: Request, res: Response, next: NextFunction) {
  // const uid = req.user?.id || "unknown"
  const user_ips: string | string[] = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.headers["cf-connecting-ip"] || req.socket.remoteAddress || "unknown"

  let ip: string = ""
  if (typeof user_ips === "string") {
    ip = user_ips
  } else {
    ip = user_ips[0]
  }

  const uid = req.user?.id ? req.user.id : ip

  if (userCDs.has(uid) && userCDs.get(uid) > Date.now()) {
    res.status(429).json({ ok: false, code: 429, msg: "TO_MANY_REQUEST" })
    return
  }

  if (userCDs.has(uid)) userCDs.delete(uid)
  userCDs.set(uid, Date.now() + 1000)
  next()
}
export function isUser(req: Request, res: Response, next: NextFunction) {
  const accountExists = Account.findOne({ where: { id: req.user?.id } })

  if (!req.user?.id || !accountExists) {
    res.status(401).json({ ok: false, code: 401, msg: "UNAUTHORIZED" })
    return
  }
  next()
}
