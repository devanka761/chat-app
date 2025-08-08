import readline from "readline"
import fs from "fs"
import db from "./main/db"
import logger from "./main/logger"
import { IMessageKeyB } from "./types/db.types"

const cmdstr = "DELETE ALL"

function waittime(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function clearChats(): Promise<void> {
  const cdb = db.ref.c
  logger.info("Getting Chats Info")
  const chats = Object.keys(cdb).filter((k) => k !== "696969")
  const groups = chats.filter((k) => cdb[k].t === "group")
  const privates = chats.filter((k) => cdb[k].t === "user")
  await waittime(3000)
  console.log("--------")
  logger.success(`Found ${chats.length} chat rooms`)
  logger.success(`With '${groups.length}' Groups and '${privates.length}' DMs`)
  const roompath = "./dist/stg/room"
  const dbpath = "./dist/db/room"
  const grouppath = "./dist/stg/group"
  await waittime(500)

  if (groups.length >= 1) {
    console.log("--------")
    logger.info("Deleting Group")
    logger.info("I = Group Image")
    logger.info("M = Media File")
    logger.info("F = Fully Deleted")
    await waittime()
    console.log("--------")
    for (let i = 0; i < groups.length; i++) {
      const key = cdb[groups[i]].c
      const mediapath = `${roompath}/${key}`

      const idx = (i + 1).toString()
      const strLength = groups.length.toString().length
      const curIdx = idx.padStart(strLength, "0")

      if (fs.existsSync(roompath) || key || fs.existsSync(mediapath)) {
        fs.rmSync(mediapath, { recursive: true, force: true })
        logger.info(`[${curIdx}/${groups.length}] ${groups[i]} - M`)
      }

      if (fs.existsSync(grouppath) && cdb[groups[i]].i && fs.existsSync(`${grouppath}/${cdb[groups[i]].i}`)) {
        fs.rmSync(`${grouppath}/${cdb[groups[i]].i}`, { recursive: true, force: true })
        logger.info(`[${curIdx}/${groups.length}] ${groups[i]} - I`)
      }

      const chatpath = `./dist/db/room/${key}.json`
      if (fs.existsSync(dbpath) && key && fs.existsSync(chatpath)) {
        fs.rmSync(chatpath, { recursive: true, force: true })
        logger.info(`[${curIdx}/${groups.length}] ${groups[i]} - F`)
      }
      delete db.ref.c[groups[i]]
      await waittime(100)
    }
    await waittime(400)
  }
  if (privates.length >= 1) {
    console.log("--------")
    logger.info("Deleting Private DMs")
    logger.info("M = Media File")
    logger.info("F = Fully Deleted")
    await waittime()
    console.log("--------")
    for (let i = 0; i < privates.length; i++) {
      const key = cdb[privates[i]].c
      const nameKey = privates[i].replace("u", " & ")
      const mediapath = `${roompath}/${key}`

      const idx = (i + 1).toString()
      const strLength = privates.length.toString().length
      const curIdx = idx.padStart(strLength, "0")

      if (fs.existsSync(roompath) || key || fs.existsSync(mediapath)) {
        fs.rmSync(mediapath, { recursive: true, force: true })
        logger.info(`[${curIdx}/${privates.length}] ${nameKey} - M`)
      }

      const chatpath = `./dist/db/room/${key}.json`
      if (fs.existsSync(dbpath) && key && fs.existsSync(chatpath)) {
        fs.rmSync(chatpath, { recursive: true, force: true })
        logger.info(`[${curIdx}/${privates.length}] ${nameKey} - F`)
      }
      delete db.ref.c[privates[i]]
      await waittime(100)
    }
    await waittime(400)
  }
  db.save("c")
  console.log("--------")
  logger.success("Chat Rooms Cleared")
  await waittime(500)
  console.log("--------")
}

async function clearUntouched(): Promise<void> {
  logger.info("Getting Unused Rooms")
  await waittime(3000)
  const roompath = "./dist/db/room"
  const mediapath = "./dist/stg/room"
  if (!fs.existsSync(mediapath)) fs.mkdirSync(mediapath)
  const roomFolders = fs.readdirSync(roompath)
  const dbchatFiles = Object.values(db.ref.c).map((cdb) => cdb.c || "none")
  const roomTrashes = roomFolders.filter((folder) => !dbchatFiles.find((k) => folder === `${k}.json` || folder === `${k}.json.save`))
  console.log("--------")
  logger.success(`Found '${roomTrashes.length}' Unused Rooms`)
  if (roomTrashes.length >= 1) {
    await waittime(500)
    console.log("--------")
    logger.info("Deleting Unused Rooms")
    await waittime()
    console.log("--------")
    for (let i = 0; i < roomTrashes.length; i++) {
      const chatpath = `${roompath}/${roomTrashes[i]}`
      if (fs.existsSync(chatpath)) {
        const idx = (i + 1).toString()
        const strLength = roomTrashes.length.toString().length
        const curIdx = idx.padStart(strLength, "0")
        fs.rmSync(chatpath, { recursive: true, force: true })
        logger.info(`[${curIdx}/${roomTrashes.length}] ${roomTrashes[i].split(".")[0]}`)
      }
      await waittime(100)
    }
    await waittime(400)
    console.log("--------")
    logger.success("Unused Rooms Cleared")
  }

  await waittime(500)
  console.log("--------")
  logger.info("Getting Unused Media")
  await waittime(3000)
  const mediaFolders = fs.readdirSync(mediapath)
  const mediaTrashes = mediaFolders.filter((folder) => !dbchatFiles.find((k) => folder === k))
  console.log("--------")
  logger.success(`Found '${mediaTrashes.length}' Unused Media`)
  if (mediaTrashes.length >= 1) {
    await waittime(500)
    console.log("--------")
    logger.info("Deleting Unused Media")
    await waittime()
    console.log("--------")
    for (let i = 0; i < mediaTrashes.length; i++) {
      const chatpath = `${mediapath}/${mediaTrashes[i]}`
      if (fs.existsSync(chatpath)) {
        const idx = (i + 1).toString()
        const strLength = mediaTrashes.length.toString().length
        const curIdx = idx.padStart(strLength, "0")
        fs.rmSync(chatpath, { recursive: true, force: true })
        logger.info(`[${curIdx}/${mediaTrashes.length}] ${mediaTrashes[i].split(".")[0]}`)
      }
      await waittime(100)
    }
    await waittime(400)
    console.log("--------")
    logger.success("Unused Media Cleared")
  }
  await waittime(500)
  console.log("--------")
}

async function clearUsers(): Promise<void> {
  logger.info("Getting Users Info")
  const udb = db.ref.u
  const pdb = db.ref.p
  const permaUsers: { [key: string]: boolean } = {}
  await waittime(3000)
  const uids = Object.keys(udb)
  uids.forEach((k) => (permaUsers[k] = false))
  console.log("--------")
  logger.success(`Found ${uids.length} users`)
  await waittime(500)
  console.log("--------")
  logger.info("Checking Global Posts Participants")
  await waittime(3000)
  const posters = Object.keys(pdb)
  const comments = []
  posters.forEach((k) => {
    permaUsers[pdb[k].u] = true
    if (pdb[k].c) {
      const commenters = Object.keys(pdb[k].c)
      commenters.forEach((kc) => {
        if (pdb[k].c) {
          permaUsers[pdb[k].c[kc].u] = true
          comments.push(kc)
        }
      })
    }
  })
  console.log("--------")
  logger.success(`Found ${posters.length} Posts`)
  logger.success(`Found ${comments.length} Comments`)
  await waittime(500)
  console.log("--------")
  logger.info("Checking Global Chat Participants")
  await waittime(3000)

  const cdb = db.ref.c["696969"]
  console.log("--------")
  if (cdb && cdb.c) {
    const dbchat: IMessageKeyB = db.fileGet(cdb.c, "room") || {}
    const chatObj = Object.keys(dbchat)
    chatObj.forEach((k) => (permaUsers[dbchat[k].u] = true))
    logger.success(`Found ${chatObj.length} Messages`)
  } else {
    logger.success(`Skipped: Global Chat has no participant`)
  }
  await waittime(500)
  console.log("--------")
  logger.info("Calculating Users")
  await waittime(3000)
  console.log("--------")
  const nonDormant = Object.keys(permaUsers).filter((user) => permaUsers[user] === true)
  const dormantUsers = Object.keys(permaUsers).filter((user) => permaUsers[user] !== true)
  logger.success(`Excluded: ${nonDormant.length}/${uids.length} Non-Dormant Accounts`)
  logger.success(`Included: ${dormantUsers.length}/${uids.length} Dormant Accounts`)

  await waittime(500)
  console.log("--------")
  logger.info(`Deleting ${dormantUsers.length} Dormant Accounts`)
  await waittime()
  console.log("--------")
  for (let i = 0; i < dormantUsers.length; i++) {
    const user = db.ref.u[dormantUsers[i]]
    const username = user.uname
    delete db.ref.u[dormantUsers[i]]
    const idx = (i + 1).toString()
    const strLength = dormantUsers.length.toString().length
    const curDormant = idx.padStart(strLength, "0")
    logger.info(`[ ${curDormant}/${dormantUsers.length} ] ${username} - ${dormantUsers[i]}`)
    await waittime(25)
  }
  await waittime(500)
  db.save("u")
  console.log("--------")
  logger.success(`${dormantUsers.length} Accounts Deleted`)
  await waittime(2000)
  console.log("--------")
  console.log(" ")
  console.log(" ")
  logger.success("DONE!")
  console.log(" ")
  console.log(" ")
  await waittime(2000)
}

async function cleardatabase(): Promise<void> {
  db.load()
  await waittime()
  console.log("--------")
  await clearChats()
  await clearUntouched()
  await clearUsers()
}

async function askQuestion() {
  console.log("This actions will deletes all Private Chats, all Group Chats, and all users that have never participated in Global Chat and Global Posts.")
  console.log("--------")
  console.log(`Type '${cmdstr}' to continue`)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question(">> ", async (dbname: string) => {
    console.log("--------")
    if (dbname.toLowerCase() === cmdstr.toLowerCase()) {
      logger.info("Reading Database")
      await waittime()
      console.log("--------")
      cleardatabase()
    } else {
      logger.info("Aborting ...")
      await waittime()
      logger.success("Aborted")
    }
    rl.close()
  })
}

askQuestion()
