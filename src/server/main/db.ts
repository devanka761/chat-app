import fs from "fs"
import { Databases, DBPerKey, User } from "../types/db.types"

const dirpath: string = "./dist/db"
const stgpath: string = "./dist/stg"

const filefolders: string[] = ["user", "group"]

class DevankaLocal {
  public ref: Databases
  constructor() {
    this.ref = { u: {}, t: {}, c: {}, g: {}, p: {}, v: {} }
  }
  load(): void {
    if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath)
    if (!fs.existsSync(stgpath)) fs.mkdirSync(stgpath)
    for (const filefolder of filefolders) {
      if (!fs.existsSync(`${dirpath}/${filefolder}`)) fs.mkdirSync(`${dirpath}/${filefolder}`)
      console.info(`Folder - ${filefolder} - Updated!`)
    }
    Object.keys(this.ref)
      .filter((file) => !["t", "v"].includes(file))
      .forEach((file) => {
        const fileKey = file as keyof Databases
        if (!fs.existsSync(`${dirpath}/${fileKey}.json`)) {
          fs.writeFileSync(`${dirpath}/${fileKey}.json`, JSON.stringify(this.ref[fileKey]), "utf-8")
        }
        const filebuffer = fs.readFileSync(`${dirpath}/${fileKey}.json`, "utf-8")
        this.ref[fileKey] = JSON.parse(filebuffer)
        if (fileKey === "u") {
          Object.keys(this.ref[fileKey]).forEach((objkey) => {
            const k = objkey as keyof User
            if (this.ref[fileKey][k].peer) delete this.ref[fileKey][k].peer
            if (this.ref[fileKey][k].zzz) delete this.ref[fileKey][k].zzz
          })
        }
        console.info(`Data - ${fileKey} - Loaded!`)
        this.save(file)
      })
  }
  fileGet(filekey: string, filefolder: string) {
    if (!fs.existsSync(`${dirpath}/${filefolder}/${filekey}.json`)) return null
    const userBuffer = fs.readFileSync(`${dirpath}/${filefolder}/${filekey}.json`, "utf-8")
    return JSON.parse(userBuffer)
  }
  fileSet(filekey: string, filefolder: string, newfiledata: DBPerKey) {
    if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath)
    if (!fs.existsSync(`${dirpath}/${filefolder}`)) fs.mkdirSync(`${dirpath}/${filefolder}`)
    fs.writeFileSync(`${dirpath}/${filefolder}/${filekey}.json`, JSON.stringify(newfiledata), "utf-8")
  }
  save(...args: string[]): void {
    if (args.length < 1) {
      args = Object.keys(this.ref).filter((file) => !["t", "v"].includes(file))
    }
    for (const arg of args) {
      const s = arg as keyof Databases
      fs.writeFileSync(`${dirpath}/${s}.json`, JSON.stringify(this.ref[s]), "utf-8")
    }
  }
}
export default new DevankaLocal()
