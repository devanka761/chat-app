import fs from "fs"
import db from "../main/db"
import { IRepTempB } from "../types/validate.types"
import { IPostB, IPostF, TPostsF } from "../../frontend/types/posts.types"
import { getUser } from "./profile.controller"
import { Post } from "../types/db.types"
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

  const dataurl = decodeURIComponent(s.file)
  const buffer = Buffer.from(dataurl.split(",")[1], "base64")
  if (buffer.length > 3500000) return { code: 413, msg: "ACC_FILE_LIMIT" }

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
