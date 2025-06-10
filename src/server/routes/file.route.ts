import express, { Request, Response, Router } from "express"
import * as hfile from "../controller/file.controller"
import { isUser } from "../main/middlewares"

// set-username set-displayname set-bio set-img
const router: Router = express.Router()

router.use(isUser)

router.get("/user/:imgsrc", (req: Request, res: Response) => {
  const { imgsrc } = req.params
  const file = hfile.userFile(imgsrc)
  if (file) return res.sendFile(file, { root: "./" })
  res.sendStatus(404)
})

export default router
