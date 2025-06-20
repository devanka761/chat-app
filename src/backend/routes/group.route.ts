import express, { Request, Response, Router } from "express"
import { createGroup } from "../controller/group.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import validate from "../main/validate"

const router: Router = express.Router()

router.use(cdUser, isUser, express.json({ limit: "100KB" }))

router.post("/create", (req: Request, res: Response) => {
  if (!validate(["name"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }

  const createdGroup = rep(createGroup(req.user?.id as string, req.body))
  res.status(createdGroup.code).json(createdGroup)
})

export default router
