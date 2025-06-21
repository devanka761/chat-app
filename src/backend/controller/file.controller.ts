import fs from "fs"
import db from "../main/db"
import { TRoomTypeF } from "../../frontend/types/room.types"

export function userFile(imgsrc: string): string | null {
  if (!fs.existsSync(`./dist/stg/user/${imgsrc}`)) return null
  return `./dist/stg/user/${imgsrc}`
}
export function groupFile(uid: string, imgsrc: string): string | null {
  const groupid = imgsrc.split("_")[0]
  const cdb = db.ref.c[groupid]
  if (!cdb) return null
  if (!cdb.u.find((usr) => usr === uid)) return null

  if (!fs.existsSync(`./dist/stg/group/${imgsrc}`)) return null
  return `./dist/stg/group/${imgsrc}`
}

export function roomFile(uid: string, roomtype: TRoomTypeF, roomid: string, filename: string): string | null {
  const cdb = db.ref.c

  const roomkey =
    roomtype === "user"
      ? Object.keys(cdb).find((k) => {
          return cdb[k].t === "user" && cdb[k].u.find((usr) => usr === uid) && cdb[k].u.find((usr) => usr === roomid)
        })
      : Object.keys(cdb).find((k) => cdb[k].t === "group" && k === roomid && cdb[k].u.find((usr) => usr === uid))

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
