import express, { Router, Request, Response } from "express"
import { rep } from "../main/helper"
import { getPosts, uploadPost } from "../controller/post.controller"
import { cdUser, isUser } from "../main/middlewares"

const router: Router = express.Router()

router.use(isUser, cdUser)

router.post("/new-post", express.json({ limit: "10MB" }), (req: Request, res: Response) => {
  const newPost = rep(uploadPost(req.user?.id as string, req.body))
  res.status(newPost.code).json(newPost)
  return
})

router.get("/", express.json({ limit: "100KB" }), (req: Request, res: Response) => {
  const allposts = rep(getPosts(req.user?.id as string))
  res.status(allposts.code).json(allposts)
})

export default router
