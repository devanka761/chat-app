import adap from "../../main/adaptiveState"
import Chats from "../center/Chats"
import Find from "../center/Find"
import Friends from "../center/Friends"

export default [
  {
    id: "find",
    txt: "APP_SEARCH",
    c: "fa-solid fa-magnifying-glass",
    run: async () => {
      adap.swipe(new Find())
    }
  },
  {
    id: "chats",
    txt: "APP_CHATS",
    c: "fa-solid fa-comments",
    run: async () => {
      adap.swipe(new Chats())
    }
  },
  {
    id: "friends",
    txt: "APP_FRIENDS",
    c: "fa-solid fa-address-book",
    run: async () => {
      adap.swipe(new Friends())
    }
  }
]
