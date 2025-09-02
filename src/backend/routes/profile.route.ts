import express, { Request, Response, Router } from "express"
import { acceptfriend, addfriend, badgesEdit, cancelfriend, ignorefriend, searchUser, unfriend } from "../controller/profile.controller"
import { rep } from "../main/helper"
import { cdUser, isUser } from "../main/middlewares"
import validate from "../main/validate"

const router: Router = express.Router()

router.use(cdUser, isUser, express.json({ limit: "100KB" }))

router.post("/addfriend", async (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(await addfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/unfriend", async (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(await unfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/cancelfriend", async (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(await cancelfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/acceptfriend", async (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(await acceptfriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})
router.post("/ignorefriend", async (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const setfriend = rep(await ignorefriend(<string>req.user?.id, req.body))
  res.status(setfriend.code).json(setfriend)
  return
})

router.get("/search/:search_id", async (req: Request, res: Response) => {
  const setfriend = rep(await searchUser(<string>req.user?.id, req.params.search_id))
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
