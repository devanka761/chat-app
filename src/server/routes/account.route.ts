import express, { Request, Response, Router } from "express"
import * as haccount from "../controller/account.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import validate from "../main/validate"

// set-username set-displayname set-bio set-img
const router: Router = express.Router()

router.use(cdUser, isUser, express.json({ limit: "10MB" }))

router.post("/set-username", (req: Request, res: Response) => {
  if (!validate(["uname"], req.body)) res.json(rep({ code: 400 }))
  const setUsername = rep(haccount.setUsername(<string>req.user?.id, req.body))
  res.status(setUsername.code).json(setUsername)
})

router.post("/set-displayname", (req: Request, res: Response) => {
  if (!validate(["dname"], req.body)) res.json(rep({ code: 400 }))
  const setDisplayname = rep(haccount.setDisplayname(<string>req.user?.id, req.body))
  res.status(setDisplayname.code).json(setDisplayname)
})
router.post("/set-bio", (req: Request, res: Response) => {
  if (!validate(["bio"], req.body)) res.json(rep({ code: 400 }))
  const setBio = rep(haccount.setBio(<string>req.user?.id, req.body))
  res.status(setBio.code).json(setBio)
})
router.post("/set-img", (req: Request, res: Response) => {
  if (!validate(["img", "name"], req.body)) res.json(rep({ code: 400 }))
  const setImg = rep(haccount.setImg(<string>req.user?.id, req.body))
  res.status(setImg.code).json(setImg)
})

export default router
