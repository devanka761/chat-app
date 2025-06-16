import express, { Request, Response, Router } from "express"
import { setBio, setDisplayname, setImage, setUsername } from "../controller/account.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import validate from "../main/validate"

const router: Router = express.Router()

router.use(cdUser, isUser, express.json({ limit: "10MB" }))

router.post("/set-username", (req: Request, res: Response) => {
  if (!validate(["uname"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setUname = rep(setUsername(<string>req.user?.id, req.body))
  res.status(setUname.code).json(setUname)
})

router.post("/set-displayname", (req: Request, res: Response) => {
  if (!validate(["dname"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setDname = rep(setDisplayname(<string>req.user?.id, req.body))
  res.status(setDname.code).json(setDname)
})
router.post("/set-bio", (req: Request, res: Response) => {
  if (!validate(["bio"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setAbout = rep(setBio(<string>req.user?.id, req.body))
  res.status(setAbout.code).json(setAbout)
})
router.post("/set-img", (req: Request, res: Response) => {
  if (!validate(["img", "name"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setImg = rep(setImage(<string>req.user?.id, req.body))
  res.status(setImg.code).json(setImg)
})

export default router
