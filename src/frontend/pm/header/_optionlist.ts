import swiper from "../../manager/swiper"
import userState from "../../main/userState"
import Account from "../content/Account"
import Settings from "../content/Settings"
import modal from "../../helper/modal"
import { lang } from "../../helper/lang"
import xhr from "../../helper/xhr"
import { IChatsF } from "../../types/db.types"
import db from "../../manager/db"
import noMessage from "../../helper/noMessage"

export default [
  {
    id: "new-group",
    txt: "APP_CREATE_GROUP",
    c: "fa-solid fa-plus fa-fw",
    run: async () => {
      const groupName = await modal.prompt({
        ic: "pencil-mechanical",
        msg: lang.GRPS_DNAME
      })
      if (!groupName) return
      const createdGroup = await modal.loading(xhr.post("/x/group/create", { name: groupName }))
      if (!createdGroup || !createdGroup.ok) {
        return await modal.alert(lang[createdGroup.msg] || lang.ERROR)
      }

      const group: IChatsF = createdGroup.data.group
      db.c.push(group)
      if (userState.center?.role === "chats") {
        userState.center.update({
          chat: noMessage(),
          users: group.u,
          roomid: createdGroup.data.roomid,
          isFirst: true,
          roomdata: group.r
        })
      }
    }
  },
  {
    id: "account",
    txt: "APP_ACCOUNT",
    c: "fa-solid fa-circle-user fa-fw",
    run: async () => {
      swiper(new Account(), userState.currcontent)
    }
  },
  {
    id: "settings",
    txt: "APP_SETTINGS",
    c: "fa-solid fa-gear fa-fw",
    run: async () => {
      swiper(new Settings(), userState.currcontent)
    }
  }
]
