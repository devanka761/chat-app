import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"

export default [
  {
    id: "room-tab-export",
    txt: "ROOM_OPT_TAB_EXPORT",
    c: "fa-solid fa-file-export fa-fw",
    run: async () => {
      modal.alert({ ic: "helmet-safety", msg: "UNDER DEVELOPMENT" })
    }
  },
  {
    id: "room-tab-export",
    txt: "ROOM_OPT_TAB_CLEAR",
    c: "fa-solid fa-do-not-enter fa-fw",
    run: async (text?: string) => {
      if (!text) return
      const confDeleteA = await modal.confirm({
        msg: lang.ROOM_CLEAR_CONF
      })
      if (!confDeleteA) return
      const confDeleteB = await modal.prompt({
        msg: lang.ROOM_CLEAR_TYPE.replace("{TEXT}", text)
      })
      if (!confDeleteB || confDeleteB !== text) {
        await modal.alert(lang.ROOM_CLEAR_CANCELED)
        return
      }
      modal.alert({ ic: "helmet-safety", msg: "UNDER DEVELOPMENT" })
    }
  }
]
