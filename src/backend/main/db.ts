import fs from "fs"
import { Databases, IUserB } from "../types/db.types"
import logger from "./logger"

const dirpath: string = "./dist/db"
const stgpath: string = "./dist/stg"

const filefolders: string[] = ["room", "kirai"]

const foldernames: { [key: string]: string } = {
  room: "Chat Rooms",
  kirai: "Kirimin AI"
}

const dbnames: { [key: string]: string } = {
  u: "Users",
  t: "Temporary Auth Datum",
  c: "Chats",
  p: "Posts",
  v: "Calls",
  k: "Kirimin Metadata"
}

class DevankaLocal {
  public ref: Databases
  constructor() {
    this.ref = { u: {}, t: {}, c: {}, p: {}, v: {}, k: { publicKey: "0", privateKey: "0" } }
  }
  load(): void {
    if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath)
    if (!fs.existsSync(stgpath)) fs.mkdirSync(stgpath)
    for (const filefolder of filefolders) {
      if (!fs.existsSync(`${dirpath}/${filefolder}`)) fs.mkdirSync(`${dirpath}/${filefolder}`)
      logger.success(`Folder Updated >> ${foldernames[filefolder]}`)
    }
    console.log("--------")
    Object.keys(this.ref)
      .filter((file) => !["t"].includes(file))
      .forEach((file) => {
        const fileKey = file as keyof Databases
        if (!fs.existsSync(`${dirpath}/${fileKey}.json`)) {
          fs.writeFileSync(`${dirpath}/${fileKey}.json`, JSON.stringify(this.ref[fileKey]), "utf-8")
        }
        const filebuffer = fs.readFileSync(`${dirpath}/${fileKey}.json`, "utf-8")
        this.ref[fileKey] = JSON.parse(filebuffer)
        if (fileKey === "u") {
          Object.keys(this.ref[fileKey]).forEach((objkey) => {
            const k = objkey as keyof IUserB
            if (this.ref[fileKey][k].socket) delete this.ref[fileKey][k].socket
            if (this.ref[fileKey][k].zzz) delete this.ref[fileKey][k].zzz
          })
        }
        logger.success(`Data Loaded >> ${dbnames[fileKey]}`)
        this.save(file)
      })
    this.checkGlobal()
  }
  private checkGlobal(): void {
    if (!this.ref.c["696969"]) {
      this.ref.c["696969"] = {
        t: "group",
        u: [],
        b: [5],
        c: "696969",
        n: "Global",
        o: "-1"
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileGet(filekey: string, filefolder: string): any {
    if (!fs.existsSync(`${dirpath}/${filefolder}/${filekey}.json`)) return null
    const userBuffer = fs.readFileSync(`${dirpath}/${filefolder}/${filekey}.json`, "utf-8")
    return JSON.parse(userBuffer)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fileSet(filekey: string, filefolder: string, newfiledata: any): void {
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
