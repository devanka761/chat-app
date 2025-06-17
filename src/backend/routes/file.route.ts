import express, { Request, Response, Router } from "express"
import { langFile, roomFile, userFile } from "../controller/file.controller"
import { isUser } from "../main/middlewares"

const router: Router = express.Router()

router.use(isUser)

router.get("/user/:imgsrc", (req: Request, res: Response) => {
  const { imgsrc } = req.params
  const file = userFile(imgsrc)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.sendStatus(404)
})
router.get("/media/:roomid/:filename", (req: Request, res: Response) => {
  const { roomid, filename } = req.params
  const file = roomFile(<string>req.user?.id, roomid, filename)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.sendStatus(404)
})

router.get("/locales/:langid", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  const { langid } = req.params
  const file = langFile(langid)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.status(404).json({ ok: false, code: 404, msg: "NOT_FOUND" })
})
export default router
