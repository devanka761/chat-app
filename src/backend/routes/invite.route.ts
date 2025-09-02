import express, { Request, Response, Router } from "express"
import { getInvite } from "../controller/invite.controller"
import { cdUser } from "../main/middlewares"
import { rep } from "../main/helper"

const router: Router = express.Router()

router.use(cdUser)

router.get("/:invite_id", async (req: Request, res: Response) => {
  const isJsonRequest = req.headers.accept?.includes("application/json") || req.headers["x-requested-with"] === "XMLHttpRequest"

  const { invite_id } = req.params
  const getInv = rep(await getInvite(req.user?.id, invite_id))
  if (isJsonRequest) {
    res.status(getInv.code).json(getInv)
  } else {
    res.render("invite", { group: getInv.data.group, members: getInv.data.members })
  }
  return
})

export default router
