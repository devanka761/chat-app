import express, { Request, Response, Router } from "express"
import { createGroup, resetLink, setGroupname, setImg, setLeave } from "../controller/group.controller"
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
  return
})

router.post("/set-groupname", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  if (!validate(["gname", "id"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setGname = rep(setGroupname(<string>req.user?.id, req.body))
  res.status(setGname.code).json(setGname)
  return
})

router.post("/set-img", express.json({ limit: "10MB" }), (req: Request, res: Response) => {
  if (!validate(["img", "name", "id"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setImage = rep(setImg(<string>req.user?.id, req.body))
  res.status(setImage.code).json(setImage)
  return
})
router.post("/reset-link", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  if (!validate(["id"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setImage = rep(resetLink(<string>req.user?.id, req.body))
  res.status(setImage.code).json(setImage)
  return
})

router.post("/leave/:id", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  const { id } = req.params
  const leaveGroup = rep(setLeave(<string>req.user?.id, id))
  res.status(leaveGroup.code).json(leaveGroup)
  return
})

export default router
