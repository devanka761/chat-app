import express, { Request, Response, Router } from "express"
import { roomFile, userFile } from "../controller/file.controller"
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

export default router
