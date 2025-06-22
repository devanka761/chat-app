import { Request, Response, NextFunction } from "express"
import db from "./db"

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
