import express, { Request, Response, Router } from "express"
import { delMessage, sendMessage } from "../controller/room.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"

const router: Router = express.Router()

router.use(cdUser, isUser)

router.post("/sendMessage/:chat_type/:chat_id", express.json({ limit: "10mb" }), (req: Request, res: Response) => {
  if (req.params.chat_type !== "user" && req.params.chat_type !== "group") {
    res.status(404).json({ ok: false, msg: "ROOM_TYPE_NOT_FOUND" })
    return
  }
  const { chat_type, chat_id } = req.params
  const sendMsg = rep(sendMessage(req.user?.id as string, chat_type, chat_id, req.body))
  res.status(sendMsg.code).json(sendMsg)
})
router.post("/delMessage/:chat_type/:chat_id/:message_id", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  if (req.params.chat_type !== "user" && req.params.chat_type !== "group") {
    res.status(404).json({ ok: false, msg: "ROOM_TYPE_NOT_FOUND" })
    return
  }
  const { chat_type, chat_id, message_id } = req.params
  const delMsg = rep(delMessage(req.user?.id as string, chat_type, chat_id, message_id))
  res.status(delMsg.code).json(delMsg)
})

export default router
