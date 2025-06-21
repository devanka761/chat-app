import express, { Request, Response, Router } from "express"
import { createGroup, setGroupname, setImg } from "../controller/group.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import validate from "../main/validate"

const router: Router = express.Router()

router.use(cdUser, isUser)

router.post("/create", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  if (!validate(["name"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }

  const createdGroup = rep(createGroup(req.user?.id as string, req.body))
  res.status(createdGroup.code).json(createdGroup)
})

router.post("/set-groupname", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  if (!validate(["gname", "id"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setGname = rep(setGroupname(<string>req.user?.id, req.body))
  res.status(setGname.code).json(setGname)
})

router.post("/set-img", express.json({ limit: "10MB" }), (req: Request, res: Response) => {
  if (!validate(["img", "name", "id"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setImage = rep(setImg(<string>req.user?.id, req.body))
  res.status(setImage.code).json(setImage)
})

export default router
