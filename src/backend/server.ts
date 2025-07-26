process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
import fs from "fs"
import express, { Application, NextFunction, Request, Response } from "express"
import { WebSocketServer } from "ws"
import session from "express-session"
import SessionFileStore, { FileStore } from "session-file-store"
import authRouter from "./routes/auth.route"
import accountRouter from "./routes/account.route"
import profileRouter from "./routes/profile.route"
import groupRouter from "./routes/group.route"
import roomRouter from "./routes/room.route"
import fileRouter from "./routes/file.route"
import inviteRouter from "./routes/invite.route"
import postsRouter from "./routes/posts.route"
import cfg from "./main/cfg"
import db from "./main/db"
import { sessionUserBinder } from "./main/binder"
import { TRelay } from "./types/relay.types"
import relay from "./main/relay"
import { parse } from "url"
import processSocketMessages from "./controller/socket.controller"
import { forceExitCall, terminateAllCalls } from "./controller/call.controller"
import serverConfig from "../config/server.config.json"
import { startModelRemover } from "./controller/genai.controller"
import webhookSender from "./main/webhook"
import logger from "./main/logger"
console.clear()
console.log("--------")
if (!fs.existsSync("./dist")) fs.mkdirSync("./dist")
if (!fs.existsSync("./dist/sessions")) {
  fs.mkdirSync("./dist/sessions")
  logger.info("Sessions Reloaded!")
  console.log("--------")
}
db.load()
if (!db.ref.k.v) {
  db.ref.k.v = 1
  db.save("k")
}

if (serverConfig.update) {
  db.ref.k.v++
  db.save("k")
}

terminateAllCalls()

const app: Application = express()

const SessionFileStorage: FileStore = SessionFileStore(session)

app.use(
  session({
    secret: cfg.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30, sameSite: "strict" },
    store: new SessionFileStorage({ path: "./dist/sessions", logFn() {} })
  })
)

app.use(sessionUserBinder)

app.use(express.static("public"))
app.set("view engine", "ejs")

const PORT: number = cfg.APP_PORT as number

app.use("/x/auth", authRouter)
app.use("/x/account", accountRouter)
app.use("/x/profile", profileRouter)
app.use("/x/group", groupRouter)
app.use("/x/room", roomRouter)
app.use("/x/posts", postsRouter)
app.use("/file", fileRouter)
app.use("/invite", inviteRouter)

app.get("/app", (req: Request, res: Response) => {
  res.render("app")
  return
})

app.get("/terms", (req: Request, res: Response) => {
  res.render("terms")
  return
})
app.get("/privacy", (req: Request, res: Response) => {
  res.render("privacy")
  return
})

app.get("/core-api", (req: Request, res: Response) => {
  res.json({ ok: true, code: 200, msg: "COMING SOON!", data: { status: "This Page Is Under Maintenance" } })
  return
})

app.get("/", (req: Request, res: Response) => {
  res.render("home")
  return
})

app.use("/", (req: Request, res: Response) => {
  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"
  if (req.method.toLowerCase() === "get" && !isJsonRequest) {
    res.status(404).render("404")
    return
  }
  res.status(404).json({ ok: false, code: 404, msg: "Your requested data is not found", error: "Not Found" })
  return
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.too.large") {
    res.status(413).json({
      ok: false,
      code: 413,
      msg: "CONTENT_TOO_LARGE"
    })
    return
  }

  logger.error(err)

  res.status(500).json({
    ok: false,
    code: 500,
    msg: "ERROR"
  })
  return
})

const server = app.listen(PORT, () => {
  startModelRemover()
  console.log("--------")
  logger.success(`HOMEPAGE >> http://localhost:${PORT}`)
  logger.success(`APP >> http://localhost:${PORT}/app`)
  logger.success("Done ✔✔✔")
  console.log("")
})

const wss = new WebSocketServer({ server })

wss.on("connection", (ws, req) => {
  const { query } = parse(req.url!, true)
  const clientId = query.id?.toString()
  if (!clientId) {
    logger.info("❌ Connection rejected: no client ID")
    ws.close()
    return
  }

  const udb = db.ref.u
  const userExist = Object.keys(udb).find((k) => udb[k].socket === clientId)
  if (!userExist) {
    logger.info(`❌ Connection rejected: client with id ${clientId} is not found`)
    ws.close()
    return
  }

  const client: TRelay = relay.add(clientId, ws)
  logger.info(`Online   ${userExist} ${client.id}`)

  webhookSender.userLog({ userid: userExist, online: true })

  ws.on("error", (err: Error) => {
    logger.error(err)
  })

  ws.on("message", (data) => {
    const userid = Object.keys(db.ref.u).find((k) => db.ref.u[k].socket === client.id)
    if (!userid) return
    try {
      const msg = JSON.parse(data.toString())
      processSocketMessages({ ...msg, from: clientId, uid: userid })
    } catch (err) {
      logger.error("Failed to parse JSON: " + err)
    }
  })

  ws.on("close", () => {
    webhookSender.userLog({ userid: userExist, online: false })
    const userid = Object.keys(db.ref.u).find((k) => db.ref.u[k].socket === client.id)
    if (userid) {
      delete db.ref.u[userid].socket
      forceExitCall(userid)
    }

    relay.remove(client.id)
    logger.info(`Offline  ${userExist} ${client.id}`)
  })
})
