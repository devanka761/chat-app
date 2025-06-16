import express, { Request, Response, Router } from "express"
import * as hroom from "../controller/room.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import { IRoomFind } from "../../client/types/room.types"

const router: Router = express.Router()

router.use(cdUser, isUser)

router.post("/sendMessage/:chat_type/:chat_id", express.json({ limit: "10mb" }), (req: Request, res: Response) => {
  if (req.params.chat_type !== "user" && req.params.chat_type !== "group") {
    res.status(404).json({ ok: false, msg: "ROOM_TYPE_NOT_FOUND" })
    return
  }
  const roomFind: IRoomFind = { type: req.params.chat_type, id: req.params.chat_id }
  const sendMessage = rep(hroom.sendMessage(req.user?.id as string, roomFind, req.body))
  res.status(sendMessage.code).json(sendMessage)
})
router.post("/delMessage/:chat_type/:chat_id/:message_id", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  if (req.params.chat_type !== "user" && req.params.chat_type !== "group") {
    res.status(404).json({ ok: false, msg: "ROOM_TYPE_NOT_FOUND" })
    return
  }
  const { chat_type, chat_id, message_id } = req.params
  // const roomFind: IRoomFind = { type: req.params.chat_type, id: req.params.chat_id }
  const delMessage = rep(hroom.delMessage(req.user?.id as string, chat_type, chat_id, message_id))
  res.status(delMessage.code).json(delMessage)
})

export default router
