import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import noMessage from "../../../helper/noMessage"
import xhr from "../../../helper/xhr"
import userState from "../../../main/userState"
import db from "../../../manager/db"
import Chats from "../../center/Chats"
import Room from "../../content/Room"

export default [
  {
    id: "room-tab-export",
    txt: "ROOM_OPT_TAB_EXPORT",
    c: "fa-solid fa-file-export fa-fw",
    run: async (_room: Room) => {
      modal.alert({ ic: "helmet-safety", msg: "UNDER DEVELOPMENT" })
    }
  },
  {
    id: "room-tab-clear",
    txt: "ROOM_OPT_TAB_CLEAR",
    c: "fa-solid fa-do-not-enter fa-fw",
    run: async (room: Room) => {
      const text = room.data.type === "group" ? `Group/${room.data.id}` : `Chat/${room.data.short}`
      const confDeleteA = await modal.confirm({
        msg: lang.ROOM_CLEAR_CONF
      })
      if (!confDeleteA) return
      const confDeleteB = await modal.prompt({
        msg: lang.ROOM_CLEAR_TYPE.replace("{TEXT}", text),
        okx: lang.ROOM_OPT_TAB_CLEAR.toUpperCase()
      })
      if (!confDeleteB || confDeleteB !== text) {
        await modal.alert(lang.ROOM_CLEAR_CANCELED)
        return
      }
      const historyCleared = await modal.loading(xhr.post(`/x/room/clear/${room.data.type}/${room.data.id}`))
      if (!historyCleared || !historyCleared.ok) {
        await modal.alert(lang[historyCleared.msg] || lang.ERROR)
        return
      }
      const cdb = db.c.find((k) => k.r.id === room.data.id)
      if (cdb) cdb.m = []
      if (userState.center && userState.center.role === "chats") {
        const chatCenter = userState.center as Chats
        chatCenter.update({
          chat: noMessage(),
          roomdata: room.data,
          users: room.users
        })
      }
      room.field.list.entries.forEach((msg) => {
        msg.html.remove()
        room.field.list.remove(msg.id)
      })
    }
  }
]
