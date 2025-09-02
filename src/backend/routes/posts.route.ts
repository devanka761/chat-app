import express, { Router, Request, Response } from "express"
import { rep } from "../main/helper"
import { deleteComment, deletePost, getAllComments, getPosts, setNewComment, uploadPost } from "../controller/posts.controller"
import { cdUser, isUser } from "../main/middlewares"

const router: Router = express.Router()

router.use(isUser, cdUser)

router.post("/new-post", express.json({ limit: "10MB" }), async (req: Request, res: Response) => {
  const newPost = rep(await uploadPost(req.user?.id as string, req.body))
  res.status(newPost.code).json(newPost)
  return
})

router.post("/delete-post/:postid", express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { postid } = req.params
  const removePost = rep(await deletePost(req.user?.id as string, postid))

  res.status(removePost.code).json(removePost)
  return
})

router.post("/comment/add/:postid", express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { postid } = req.params
  const addComment = rep(await setNewComment(req.user?.id as string, postid, req.body))
  res.status(addComment.code).json(addComment)
  return
})

router.post("/comment/delete/:postid/:commentid", express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { postid, commentid } = req.params
  const delComment = rep(await deleteComment(req.user?.id as string, postid, commentid))
  res.status(delComment.code).json(delComment)
  return
})
router.get("/comments/:postid", express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const { postid } = req.params
  const getComments = rep(await getAllComments(req.user?.id as string, postid))
  res.status(getComments.code).json(getComments)
  return
})

router.get("/", express.json({ limit: "100KB" }), async (req: Request, res: Response) => {
  const allposts = rep(await getPosts(req.user?.id as string))
  res.status(allposts.code).json(allposts)
  return
})

export default router
