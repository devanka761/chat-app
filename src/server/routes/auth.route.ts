import express, { Request, Response, Router } from "express"
import * as hauth from "../controller/auth.controller"
import { rep } from "../main/helper"
import { cdUser } from "../main/middlewares"
import hoauth from "../controller/oauth.controller"
import { PayloadData } from "../types/validate.types"
import { TempUserData, ValidProviders } from "../types/binder.types"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.get("/isUser", (req: Request, res: Response) => {
  const isLogged = hauth.isLogged(req.user?.id)
  res.status(isLogged.code).json(isLogged)
})

router.post("/sign-in", (req: Request, res: Response) => {
  const signIn = rep(hauth.login(req.body))
  res.status(signIn.code).json(signIn)
})

router.post("/verify", (req: Request, res: Response) => {
  const verifyUser = rep(hauth.verify(req.body))
  if (!verifyUser.ok) {
    res.status(verifyUser.code).json(verifyUser)
    return
  }
  const payloadInfo = verifyUser.data as PayloadData
  const userInfo = payloadInfo.user ? (payloadInfo.user as PayloadData) : null
  const userData = userInfo ? (userInfo.data as TempUserData) : null
  if (verifyUser.code === 200 && userInfo && userData) {
    req.user = {
      id: <string>userInfo.id,
      data: {
        id: <string | number>userData.id,
        email: <string>userData.email,
        provider: <ValidProviders>userData.provider
      }
    }
  }
  res.status(verifyUser.code).json(verifyUser)
})

router.get("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/app")
  })
})

router.get("/:provider/callback", async (req: Request, res: Response) => {
  const { provider } = req.params
  if (!hoauth.isProviderValid(provider)) {
    res.status(400).json({ ok: false, code: 400 })
    return
  }
  if (req.query?.error) {
    res.status(400).json({ ok: false, code: 400 })
    return
  }
  if (!req.query?.code) {
    res.status(400).json({ ok: false, code: 400 })
    return
  }
  const user = await hoauth.user({ provider, code: req.query.code as string })
  if (!user || user.error) {
    res.status(400).json({ ok: false, code: 400 })
    return
  }
  const verifyUser = rep(
    hauth.processThirdParty({
      user: user.data as PayloadData,
      provider: user.provider as string
    })
  )
  if (!verifyUser.ok || verifyUser.code !== 200) {
    res.status(verifyUser.code).json(verifyUser)
    return
  }
  const payloadInfo = verifyUser.data as PayloadData
  const userInfo = payloadInfo.user as PayloadData
  const userData = userInfo.data as TempUserData
  req.user = {
    id: <string>userInfo.id,
    data: {
      id: <string | number>userData.id,
      email: <string>userData.email,
      provider: <ValidProviders>userData.provider
    }
  }
  res.redirect("/app")
})

router.get("/:provider", cdUser, (req: Request, res: Response) => {
  const { provider } = req.params
  if (!hoauth.isProviderValid(provider)) {
    res.status(400).json({ ok: false, code: 400 })
    return
  }
  res.redirect(hoauth.auth(provider as "github" | "google" | "discord"))
})

export default router
