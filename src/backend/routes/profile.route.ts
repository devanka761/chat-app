import express, { Request, Response, Router } from "express"
import { acceptfriend, addfriend, cancelfriend, ignorefriend, searchUser, unfriend } from "../controller/profile.controller"
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
  const profAdd = rep(addfriend(<string>req.user?.id, req.body))
  res.status(profAdd.code).json(profAdd)
})
router.post("/unfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const profRemove = rep(unfriend(<string>req.user?.id, req.body))
  res.status(profRemove.code).json(profRemove)
})
router.post("/cancelfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const profCancel = rep(cancelfriend(<string>req.user?.id, req.body))
  res.status(profCancel.code).json(profCancel)
})
router.post("/acceptfriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const profAccept = rep(acceptfriend(<string>req.user?.id, req.body))
  res.status(profAccept.code).json(profAccept)
})
router.post("/ignorefriend", (req: Request, res: Response) => {
  if (!validate(["userid"], req.body)) {
    res.status(400).json(rep({ code: 400 }))
    return
  }
  const profIgnore = rep(ignorefriend(<string>req.user?.id, req.body))
  res.status(profIgnore.code).json(profIgnore)
})

router.get("/search/:search_id", (req: Request, res: Response) => {
  const profSearch = rep(searchUser(<string>req.user?.id, req.params.search_id))
  res.status(profSearch.code).json(profSearch)
})

export default router
