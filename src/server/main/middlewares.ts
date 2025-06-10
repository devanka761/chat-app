import { Request, Response, NextFunction } from "express"
import db from "./db"

const userCDs = new Map()

export function cdUser(req: Request, res: Response, next: NextFunction) {
  const uid = req.user?.id || "unknown"

  if (userCDs.has(uid) && userCDs.get(uid) > Date.now()) {
    res.json({ ok: false, code: 429, msg: "TO_MANY_REQUEST" })
    return
  }

  if (userCDs.has(uid)) userCDs.delete(uid)
  userCDs.set(uid, Date.now() + 1000)
  next()
}
export function isUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.id || !db.ref.u[req.user.id].data) {
    res.json({ code: 401, msg: "UNAUTHORIZED" })
    return
  }
  next()
  // if (req.user?.id) {
  //   if (db.ref.u[req.user.id]?.data) return next()
  //   res.json({ code: 401, msg: "UNAUTHORIZED" })
  // }
  // res.json({ code: 401, msg: "UNAUTHORIZED" })
}
