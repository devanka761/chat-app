import express, { Request, Response, Router } from "express"
import { groupFile, langFile, postFile, roomFile, userFile } from "../controller/file.controller"
import { isUser } from "../main/middlewares"

const router: Router = express.Router()

router.get("/locales/:langid", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  const { langid } = req.params
  const file = langFile(langid)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.status(404).json({ ok: false, code: 404, msg: "NOT_FOUND" })
  return
})

router.use(isUser)

router.get("/user/:imgsrc", (req: Request, res: Response) => {
  const { imgsrc } = req.params
  const file = userFile(imgsrc)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.sendStatus(404)
  return
})
router.get("/group/:imgsrc", (req: Request, res: Response) => {
  const { imgsrc } = req.params
  const file = groupFile(<string>req.user?.id, imgsrc)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.sendStatus(404)
  return
})
router.get("/media/:roomtype/:roomid/:filename", (req: Request, res: Response) => {
  const { roomid, roomtype, filename } = req.params
  if (roomtype !== "user" && roomtype !== "group") {
    res.sendStatus(404)
    return
  }
  const file = roomFile(<string>req.user?.id, roomtype, roomid, filename)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.sendStatus(404)
  return
})
router.get("/post/:postid/:postimg", (req: Request, res: Response) => {
  const { postid, postimg } = req.params
  const file = postFile(postid, postimg)
  if (file) {
    res.sendFile(file, { root: "./" })
    return
  }
  res.sendStatus(404)
  return
})

export default router
