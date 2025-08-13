import express, { Request, Response, Router } from "express"
import { acceptfriend, addfriend, badgesEdit, cancelfriend, ignorefriend, searchUser, unfriend } from "../controller/profile.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import validate from "../main/validate"
// import validate from "../main/validate"

const router: Router = express.Router()

router.use(cdUser, isUser, express.json({ limit: "100KB" }))

router.post("/addfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(addfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/unfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(unfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/cancelfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(cancelfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/acceptfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(acceptfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/ignorefriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(ignorefriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})

router.get("/search/:search_id", (req: Request, res: Response) => {
  const setfriend = rep(searchUser(<string>req.user?.id, req.params.search_id))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/badges/:userid", (req: Request, res: Response) => {
  const { userid } = req.params
  const setnewbadges = rep(badgesEdit(req.user?.id as string, userid, req.body.badges))
  res.status(setnewbadges.code).json(setnewbadges)
  return
})
export default router
