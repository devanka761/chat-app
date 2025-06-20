import swiper from "../../manager/swiper"
import userState from "../../main/userState"
import Account from "../content/Account"
import Settings from "../content/Settings"

export default [
  {
    id: "account",
    txt: "APP_ACCOUNT",
    c: "fa-solid fa-user fa-fw",
    run: async () => {
      swiper(new Account(), userState.currcontent)
    }
  },
  {
    id: "setting",
    txt: "APP_SETTINGS",
    c: "fa-solid fa-gear fa-fw",
    run: async () => {
      swiper(new Settings(), userState.currcontent)
    }
  }
  // {
  //   id: "new-group",
  //   txt: "APP_CREATE_GROUP",
  //   c: "fa-solid fa-users fa-fw",
  //   run: async () => {}
  // }
]
