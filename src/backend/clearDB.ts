import readline from "readline"
import fs from "fs"
import db from "./main/db"

const cleardatabase: { [key: string]: () => void } = {
  chat: () => {
    db.ref.c = {}
    db.save("c")
    if (fs.existsSync("./dist/db/room")) {
      fs.rmSync("./dist/db/room", { recursive: true, force: true })
    }
    if (fs.existsSync("./dist/stg/room")) {
      fs.rmSync("./dist/stg/room", { recursive: true, force: true })
    }
    console.log("DB Chat Cleared!")
  }
}

function askQuestion() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question("dbname: ", (dbname: string) => {
    dbname = dbname.toLowerCase()
    if (cleardatabase[dbname]) {
      cleardatabase[dbname]()
    } else {
      console.log("DB " + dbname + " not found")
    }
    rl.close()
  })
}

askQuestion()
