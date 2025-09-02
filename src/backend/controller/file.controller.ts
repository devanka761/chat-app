import fs from "fs"
import { TRoomTypeF } from "../../frontend/types/room.types"
import Chat from "../models/Chat.Model"
import Post from "../models/Post.Model"

export function userFile(imgsrc: string): string | null {
  if (!fs.existsSync(`./dist/stg/user/${imgsrc}`)) return null
  return `./dist/stg/user/${imgsrc}`
}
export async function groupFile(uid: string, imgsrc: string): Promise<string | null> {
  const groupid = imgsrc.split("_")[0]
  const groupExists = Chat.findOne({ id: groupid })
  if (!groupExists) return null
  // if (!cdb.u.find((usr) => usr === uid)) return null

  if (!fs.existsSync(`./dist/stg/group/${imgsrc}`)) return null
  return `./dist/stg/group/${imgsrc}`
}

export async function roomFile(uid: string, roomtype: TRoomTypeF, roomid: string, filename: string): Promise<string | null> {
  let roomkey: string | null = null

  if (roomtype === "user") {
    const chat = await Chat.findOne({
      type: "user",
      users: { $all: [uid, roomid] }
    }).lean()
    if (chat) roomkey = chat.id
  } else {
    if (roomid === "696969") {
      roomkey = "696969"
    } else {
      const chat = await Chat.findOne({
        id: roomid,
        type: "group",
        users: uid
      }).lean()
      if (chat) roomkey = chat.id
    }
  }

  if (!roomkey) return null
  if (!fs.existsSync(`./dist/stg/room/${roomkey}`)) return null
  if (!fs.existsSync(`./dist/stg/room/${roomkey}/${filename}`)) return null
  return `./dist/stg/room/${roomkey}/${filename}`
}
export function langFile(langid: string) {
  const langpath = `./public/locales/${langid}.json`
  if (!fs.existsSync(langpath)) return null
  return langpath
}

export async function postFile(postid: string, filename: string): Promise<string | null> {
  const postExists = await Post.findOne({ id: postid })
  if (!postExists) return null

  const filepath = `./dist/stg/post/${filename}`
  if (!fs.existsSync(filepath)) return null

  return filepath
}
