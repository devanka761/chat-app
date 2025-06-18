process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
import fs from "fs"
import express, { Application, NextFunction, Request, Response } from "express"
import session from "express-session"
import SessionFileStore, { FileStore } from "session-file-store"
import { ExpressPeerServer } from "peer"
import authRouter from "./routes/auth.route"
import accountRouter from "./routes/account.route"
import profileRouter from "./routes/profile.route"
import roomRouter from "./routes/room.route"
import fileRouter from "./routes/file.route"
import cfg from "./main/cfg"
import { peerKey } from "./main/helper"
import db from "./main/db"
import { sessionUserBinder } from "./main/binder"

if (!fs.existsSync("./dist")) fs.mkdirSync("./dist")
if (!fs.existsSync("./dist/sessions")) {
  fs.mkdirSync("./dist/sessions")
  console.log("Sessions Reloaded!")
}
db.load()

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
app.use("/x/room", roomRouter)
app.use("/file", fileRouter)

app.get("/app", (req: Request, res: Response) => {
  res.render("app")
  return
})

app.get("/", (req: Request, res: Response) => {
  res.render("home")
  return
})

const appService = app.listen(PORT, () => {
  console.log(`ONLINE >> http://localhost:${PORT}/app`)
  console.log(`PEERS >> http://localhost:${PORT}/cloud/${peerKey}/peers`)
})

const server = ExpressPeerServer(appService, {
  key: peerKey,
  allow_discovery: true
})

server.on("error", console.error)
// server.on("message", (c, msg) => {
//   // console.log(c.getId(), msg)
// })
server.on("connection", (c) => {
  console.log("connected", c.getId())
  c.send(JSON.stringify({ data: "hehehe" }))
})
app.use("/cloud", server)

app.use("/", (req: Request, res: Response) => {
  res.status(404).json({ ok: false, code: 404, msg: "NOT_FOUND" })
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

  console.error(err)

  res.status(500).json({
    ok: false,
    code: 500,
    msg: "ERROR"
  })
})
