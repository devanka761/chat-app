import express, { Router, Request, Response } from "express"
import { rep } from "../main/helper"
import { getPosts } from "../controller/post.controller"
import { cdUser, isUser } from "../main/middlewares"

const router: Router = express.Router()

router.use(isUser, cdUser, express.json({ limit: "100KB" }))

router.get("/", (req: Request, res: Response) => {
  const allposts = rep(getPosts(req.user?.id as string))
  res.status(allposts.code).json(allposts)
})

export default router
