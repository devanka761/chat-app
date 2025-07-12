import fs from "fs"
import db from "../main/db"
import { IRepTempB } from "../types/validate.types"
import { ICommentB, ICommentF, IPostB, IPostF, TCommentsF, TPostsF } from "../../frontend/types/posts.types"
import { getUser } from "./profile.controller"
import { Post, PostCommentObject } from "../types/db.types"
import { rNumber } from "../main/helper"

function getPost(uid: string, postid: string): IPostF {
  const pdb = db.ref.p[postid]

  return {
    id: postid,
    user: getUser(uid, pdb.u),
    ts: pdb.ts,
    img: pdb.img,
    likes: pdb.l?.length || 0,
    comments: Object.keys(pdb.c ?? {}).length,
    text: pdb.txt,
    liked: pdb.l?.includes(uid) ? true : false
  }
}
export function getPosts(uid: string): IRepTempB {
  const pdb = db.ref.p
  const postlist: TPostsF = Object.keys(pdb).map((k) => getPost(uid, k))

  return { code: 200, data: postlist }
}

export function uploadPost(uid: string, s: Partial<IPostB>): IRepTempB {
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

  const postData: Post = { u: uid, ts: Date.now(), img: filename }
  if (s.text) postData.txt = s.text

  const postkey = Date.now().toString(36)
  db.ref.p[postkey] = postData
  db.save("p")
  return { code: 200, data: getPost(uid, postkey) }
}

export function deletePost(uid: string, postid: string): IRepTempB {
  const pdb = db.ref.p[postid]
  if (!pdb) return { code: 404, msg: "POSTS_NOT_FOUND" }
  if (pdb.u !== uid) return { code: 404, msg: "POSTS_NOT_FOUND" }

  const filepath = `./dist/stg/post/${pdb.img}`
  if (fs.existsSync(filepath)) fs.rmSync(filepath)
  delete db.ref.p[postid]
  db.save("p")

  return { code: 200, data: { postid } }
}

export function getAllComments(uid: string, postid: string): IRepTempB {
  const pdb = db.ref.p[postid]
  if (!pdb) return { code: 404, msg: "POSTS_NOT_FOUND" }

  const dbcomments = pdb.c || {}

  const comments: TCommentsF = Object.keys(dbcomments).map((k) => {
    return {
      id: k,
      user: getUser(uid, dbcomments[k].u),
      text: dbcomments[k].txt,
      ts: dbcomments[k].ts
    }
  })
  return { code: 200, data: comments }
}
export function setNewComment(uid: string, postid: string, s: Partial<ICommentB>): IRepTempB {
  const pdb = db.ref.p[postid]
  if (!pdb) return { code: 404, msg: "POSTS_NOT_FOUND" }
  if (!s || !s.text) return { code: 400, msg: "POST_COMMENT_LENGTH" }
  s.text = s.text.trim()
  if (s.text.length < 1 || s.text.length > 300) return { code: 400, msg: "POST_COMMENT_LENGTH" }

  const cmt_id = "c" + Date.now().toString(36)

  const comment: PostCommentObject = {
    u: uid,
    ts: Date.now(),
    txt: s.text
  }

  if (!db.ref.p[postid].c) db.ref.p[postid].c = {}
  db.ref.p[postid].c[cmt_id] = comment

  const data: ICommentF = {
    id: cmt_id,
    text: comment.txt,
    ts: comment.ts,
    user: getUser(uid, uid)
  }

  return { code: 200, data }
}
