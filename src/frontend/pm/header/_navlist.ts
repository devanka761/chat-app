import userState from "../../main/userState"
import swiper from "../../manager/swiper"
import Chats from "../center/Chats"
import Find from "../center/Find"
import Friends from "../center/Friends"

export default [
  {
    id: "find",
    txt: "APP_SEARCH",
    c: "fa-solid fa-magnifying-glass",
    run: async () => {
      swiper(new Find(), userState.currcenter)
    }
  },
  {
    id: "chats",
    txt: "APP_CHATS",
    c: "fa-solid fa-comments",
    run: async () => {
      swiper(new Chats(), userState.currcenter)
    }
  },
  {
    id: "friends",
    txt: "APP_FRIENDS",
    c: "fa-solid fa-address-book",
    run: async () => {
      swiper(new Friends(), userState.currcenter)
    }
  }
]
