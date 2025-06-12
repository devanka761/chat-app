import fs from "fs"
import db from "../main/db"

export function userFile(imgsrc: string): string | null {
  if (!fs.existsSync(`./dist/stg/user/${imgsrc}`)) return null
  return `./dist/stg/user/${imgsrc}`
}
export function roomFile(uid: string, roomid: string, filename: string): string | null {
  const isAllowed = roomid === "community" || (db.ref.g[roomid] || db.ref.c[roomid]).u.find((usr) => usr === uid)
  if (!isAllowed) return null
  if (!fs.existsSync(`./dist/stg/room/${roomid}`)) return null
  if (!fs.existsSync(`./dist/stg/room/${roomid}/${filename}`)) return null
  return `./dist/stg/room/${roomid}/${filename}`
}
