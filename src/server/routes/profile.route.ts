import express, { Request, Response, Router } from "express"
import * as hprofile from "../controller/profile.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import validate from "../main/validate"
// import validate from "../main/validate"

const router: Router = express.Router()

router.use(cdUser, isUser, express.json({ limit: "100KB" }))

router.post("/addfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) res.json(rep({ code: 400 }))
  const addfriend = rep(hprofile.addfriend(<string>req.user?.id, req.body))
  res.status(addfriend.code).json(addfriend)
})
router.post("/unfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) res.json(rep({ code: 400 }))
  const unfriend = rep(hprofile.unfriend(<string>req.user?.id, req.body))
  res.status(unfriend.code).json(unfriend)
})
router.post("/cancelfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) res.json(rep({ code: 400 }))
  const cancelfriend = rep(hprofile.cancelfriend(<string>req.user?.id, req.body))
  res.status(cancelfriend.code).json(cancelfriend)
})
router.post("/acceptfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) res.json(rep({ code: 400 }))
  const acceptfriend = rep(hprofile.acceptfriend(<string>req.user?.id, req.body))
  res.status(acceptfriend.code).json(acceptfriend)
})
router.post("/ignorefriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) res.json(rep({ code: 400 }))
  const ignorefriend = rep(hprofile.ignorefriend(<string>req.user?.id, req.body))
  res.status(ignorefriend.code).json(ignorefriend)
})

router.get("/search/:search_id", (req: Request, res: Response) => {
  const searchUser = rep(hprofile.searchUser(<string>req.user?.id, req.params.search_id))
  res.status(searchUser.code).json(searchUser)
})

export default router
