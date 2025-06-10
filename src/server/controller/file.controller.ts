import fs from "fs"

export function userFile(imgsrc: string) {
  if (!fs.existsSync(`./dist/stg/user/${imgsrc}`)) return null
  return `./dist/stg/user/${imgsrc}`
}
