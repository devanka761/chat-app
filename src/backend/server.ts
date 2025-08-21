process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
import fs from "fs"
import express, { NextFunction, Request, Response } from "express"
import expressWs from "express-ws"
import session from "express-session"
import SessionFileStore, { FileStore } from "session-file-store"
import socketRouter from "./routes/socket.route"
import authRouter from "./routes/auth.route"
import accountRouter from "./routes/account.route"
import profileRouter from "./routes/profile.route"
import groupRouter from "./routes/group.route"
import roomRouter from "./routes/room.route"
import fileRouter from "./routes/file.route"
import inviteRouter from "./routes/invite.route"
import postsRouter from "./routes/posts.route"
import cfg from "./main/cfg"
import { sessionUserBinder } from "./main/binder"
import { terminateAllCalls } from "./controller/call.controller"
import { startModelRemover } from "./controller/genai.controller"
import logger from "./main/logger"
import { getServerReady } from "./main/prepare"
import { version } from "../config/version.json"

const deps = JSON.parse(fs.readFileSync("./dist/db/deps.json", "utf-8") || "{}")

console.log("--------")
if (!fs.existsSync("./dist")) fs.mkdirSync("./dist")
if (!fs.existsSync("./dist/sessions")) {
  fs.mkdirSync("./dist/sessions")
  logger.info("Sessions Reloaded!")
  console.log("--------")
}
getServerReady()

terminateAllCalls()

const { app } = expressWs(express())

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

socketRouter(app)
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

app.get("/", (req: Request, res: Response) => {
  res.render("home", { version, ...deps })
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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }
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
  return
})

app.listen(PORT, () => {
  startModelRemover()
  console.log("--------")
  logger.success(`HOMEPAGE >> http://localhost:${PORT}`)
  logger.success(`APP >> http://localhost:${PORT}/app`)
  logger.success("Running ✔✔✔")
  console.log(" ")
  console.log(" ")
  console.log("Kirimin Chat App is licensed under")
  console.log("The GNU General Public License v3.0")
  console.log(" ")
  console.log("https://www.gnu.org/licenses/gpl-3.0.html#license-text")
})
