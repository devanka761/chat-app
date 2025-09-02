import fs from "fs"
import { IRepTempB } from "../types/validate.types"
import { ICommentB, ICommentF, IPostB, IPostF, TCommentsF, TPostsF } from "../../frontend/types/posts.types"
import { getUser } from "./profile.controller"
import { rNumber } from "../main/helper"
import { IPost } from "../types/post.types"
import Post, { IPostDocument } from "../models/Post.Model"
import User from "../models/User.Model"
import { IComment } from "../types/comment.types"
import PostComment from "../models/Comment.Model"

async function getPost(uid: string, post: IPostDocument): Promise<IPostF | null> {
  return {
    id: post.id,
    user: await getUser(uid, post.user),
    ts: post.ts,
    img: post.image,
    likes: post.likes?.length || 0,
    comments: await PostComment.countDocuments({ to: post.id }),
    text: post.text,
    liked: post.likes?.find((usr) => usr === uid) ? true : false
  }
}
export async function getPosts(uid: string): Promise<IRepTempB> {
  const posts = await Post.find().sort({ ts: -1 })

  const postlist: TPostsF = await Promise.all(
    posts.map(async (post) => {
      return {
        id: post.id,
        user: await getUser(uid, post.user),
        ts: post.ts,
        img: post.image,
        likes: post.likes?.length || 0,
        comments: await PostComment.countDocuments({ to: post.id }),
        text: post.text,
        liked: post.likes?.find((usr) => usr === uid) ? true : false
      }
    })
  )

  return { code: 200, data: postlist }
}

export async function uploadPost(uid: string, s: Partial<IPostB>): Promise<IRepTempB> {
  if (!s.file || typeof s.file !== "string") return { code: 400, msg: "POST_NO_FILE" }
  if (!s.name || typeof s.name !== "string") return { code: 400, msg: "POST_NO_FILE" }
  if (s.text && typeof s.text !== "string") s.text = ""
  if (s.text) {
    s.text = s.text.trim()
    if (s.text.length < 1) s.text = null
  }
  s.name = s.name.trim().replace(/\s/g, "_")

  const dataurl = decodeURIComponent(s.file)
  const buffer = Buffer.from(dataurl.split(",")[1], "base64")
  if (buffer.length > 2500000) return { code: 413, msg: "ACC_FILE_LIMIT" }

  const postPath = "./dist/stg/post"
  if (!fs.existsSync(postPath)) fs.mkdirSync(postPath)
  const filename: string = rNumber(2).toString(36) + Date.now().toString(36) + s.name

  fs.writeFileSync(`${postPath}/${filename}`, buffer)

  const postkey = Date.now().toString(36)

  const postData: IPost = { user: uid, ts: Date.now(), image: filename, id: postkey }
  if (s.text) postData.text = s.text

  const post = new Post(postData)
  await post.save()

  return { code: 200, data: await getPost(uid, post) }
}

export async function deletePost(uid: string, postid: string): Promise<IRepTempB> {
  const post = await Post.findOne({ id: postid })
  const user = await User.findOne({ id: uid, badges: { $in: [1] } })
  if (!post) return { code: 404, msg: "POSTS_NOT_FOUND" }
  if (post.user !== uid && !user) return { code: 404, msg: "POSTS_NOT_FOUND" }

  const filepath = `./dist/stg/post/${post.image}`
  if (fs.existsSync(filepath)) fs.rmSync(filepath)

  await post.deleteOne()

  return { code: 200, data: { postid } }
}

export async function getAllComments(uid: string, postid: string): Promise<IRepTempB> {
  const commentsDocs = await PostComment.find({ to: postid })

  const comments: TCommentsF = await Promise.all(
    commentsDocs.map(async (cmt) => {
      return {
        id: cmt.id,
        user: await getUser(uid, cmt.user),
        text: cmt.text,
        ts: cmt.ts
      }
    })
  )

  return { code: 200, data: comments }
}
export async function setNewComment(uid: string, postid: string, s: Partial<ICommentB>): Promise<IRepTempB> {
  if (!s || !s.text) return { code: 400, msg: "POST_COMMENT_LENGTH" }
  s.text = s.text.trim()
  if (s.text.length < 1 || s.text.length > 300) return { code: 400, msg: "POST_COMMENT_LENGTH" }

  const post = await Post.findOne({ id: postid })
  if (!post) return { code: 404, msg: "POSTS_NOT_FOUND" }

  const cmt_id = "c" + Date.now().toString(36)

  const commentData: IComment = {
    id: cmt_id,
    to: postid,
    user: uid,
    ts: Date.now(),
    text: s.text
  }

  const postComment = new PostComment(commentData)
  await postComment.save()

  const data: ICommentF = {
    id: cmt_id,
    text: commentData.text,
    ts: commentData.ts,
    user: await getUser(uid, uid)
  }

  return { code: 200, data }
}

export async function deleteComment(uid: string, postid: string, commentid: string): Promise<IRepTempB> {
  const comment = await PostComment.findOne({ id: commentid, to: postid, user: uid })
  const user = await User.findOne({ id: uid, badges: { $in: [1] } })
  if (!comment) return { code: 404, msg: "CMT_NOT_FOUND" }
  if (!user) return { code: 404, msg: "CMT_NOT_FOUND" }
  await comment.deleteOne()

  return { code: 200 }
}
