import db from "../main/db"
import { IRepTempB } from "../types/validate.types"
import { TPostsF } from "../../frontend/types/posts.types"
import { getUser } from "./profile.controller"

export function getPosts(uid: string): IRepTempB {
  const pdb = db.ref.p

  const postlist: TPostsF = Object.keys(pdb).map((k) => {
    return {
      id: k,
      user: getUser(uid, pdb[k].u),
      ts: pdb[k].ts,
      img: pdb[k].img,
      likes: pdb[k].l?.length || 0,
      comments: Object.keys(pdb[k].c ?? {}).length,
      text: pdb[k].txt,
      liked: pdb[k].l?.includes(uid) ? true : false
    }
  })

  return { code: 200, data: postlist }
}
