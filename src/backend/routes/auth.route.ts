import express, { Request, Response, Router } from "express"
import { authLogin, authVerify, isUserLogged, processThirdParty } from "../controller/auth.controller"
import { rep } from "../main/helper"
import { cdUser } from "../main/middlewares"
import { getOAuthUrl, getOAuthUser, isProviderValid } from "../controller/oauth.controller"
import { IUserCookieB } from "../types/binder.types"

const router: Router = express.Router()

router.use(express.json({ limit: "100KB" }))

router.get("/isUser", (req: Request, res: Response) => {
  const isLogged = rep(isUserLogged(req.user?.id))
  res.status(isLogged.code).json(isLogged)
  return
})

router.post("/sign-in", (req: Request, res: Response) => {
  const signIn = rep(authLogin(req.body))
  res.status(signIn.code).json(signIn)
  return
})

router.post("/verify", (req: Request, res: Response) => {
  const verifyUser = rep(authVerify(req.body))
  if (!verifyUser.ok) {
    res.status(verifyUser.code).json(verifyUser)
    return
  }
  const userData = verifyUser.data.user as IUserCookieB
  if (verifyUser.code === 200 && userData) {
    req.user = {
      id: userData.id.toString(),
      data: {
        id: userData.data.id.toString(),
        email: userData.data.email,
        provider: userData.data.provider
      }
    }
  }
  res.status(verifyUser.code).json(verifyUser)
  return
})

router.get("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/app")
    return
  })
})

router.get("/:provider/callback", async (req: Request, res: Response) => {
  const { provider } = req.params
  if (!provider) {
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
  const user = await getOAuthUser({ provider, code: req.query.code as string })
  if (!user || user.error) {
    res.status(400).json({ ok: false, code: 400 })
    return
  }
  const verifyUser = rep(
    processThirdParty({
      user: user.data,
      provider: user.provider
    })
  )
  if (!verifyUser.ok || verifyUser.code !== 200) {
    res.status(verifyUser.code).json(verifyUser)
    return
  }
  const userData = verifyUser.data.user as IUserCookieB
  req.user = {
    id: userData.id,
    data: {
      id: userData.data.id,
      email: userData.data.email,
      provider: userData.data.provider
    }
  }
  const redirectUrl = "/app" + (verifyUser.data.first ? "?first=1" : "")
  res.redirect(redirectUrl)
  return
})

router.get("/:provider", cdUser, (req: Request, res: Response) => {
  const { provider } = req.params
  if (!isProviderValid(provider)) {
    res.status(400).json({ ok: false, code: 400 })
    return
  }
  res.redirect(getOAuthUrl(provider as "github" | "google" | "discord"))
  return
})

export default router
