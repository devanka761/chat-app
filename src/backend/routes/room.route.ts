import express, { Request, Response, Router } from "express"
import { delMessage, getGlobalChats, sendMessage } from "../controller/room.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import {} from "../../frontend/types/room.types"

const router: Router = express.Router()

router.use(cdUser, isUser)

router.post("/sendMessage/:chat_type/:chat_id", express.json({ limit: "10mb" }), async (req: Request, res: Response) => {
  if (req.params.chat_type !== "user" && req.params.chat_type !== "group") {
    res.status(404).json({ ok: false, msg: "ROOM_TYPE_NOT_FOUND" })
    return
  }

  const { chat_type, chat_id } = req.params
  const setroom = rep(await sendMessage(req.user?.id as string, chat_id, chat_type, req.body))
  res.status(setroom.code).json(setroom)
  return
})
router.post("/delMessage/:chat_type/:chat_id/:message_id", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  if (req.params.chat_type !== "user" && req.params.chat_type !== "group") {
    res.status(404).json({ ok: false, msg: "ROOM_TYPE_NOT_FOUND" })
    return
  }
  const { chat_type, chat_id, message_id } = req.params
  const setroom = rep(delMessage(req.user?.id as string, chat_id, chat_type, message_id))
  res.status(setroom.code).json(setroom)
  return
})
router.get("/get-global", express.json({ limit: "200KB" }), (req: Request, res: Response) => {
  const globalchat = rep(getGlobalChats(req.user?.id as string))

  res.status(globalchat.code).json(globalchat)
})

export default router
