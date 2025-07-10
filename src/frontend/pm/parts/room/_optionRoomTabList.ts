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
    run: async () => {
      modal.alert({ ic: "helmet-safety", msg: "UNDER DEVELOPMENT" })
    }
  }
]
