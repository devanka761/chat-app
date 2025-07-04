import adap from "../../main/adaptiveState"
import Calls from "../center/Calls"
import Chats from "../center/Chats"
import Find from "../center/Find"
import Friends from "../center/Friends"
import Posts from "../content/Posts"

export default [
  {
    id: "find",
    txt: "APP_SEARCH",
    c: "fa-solid fa-magnifying-glass",
    run: () => {
      adap.swipe(new Find())
    }
  },
  {
    id: "chats",
    txt: "APP_CHATS",
    c: "fa-solid fa-comments",
    run: () => {
      adap.swipe(new Chats())
    }
  },
  {
    id: "friends",
    txt: "APP_FRIENDS",
    c: "fa-solid fa-address-book",
    run: () => {
      adap.swipe(new Friends())
    }
  },
  {
    id: "calls",
    txt: "APP_CALLS",
    c: "fa-solid fa-phone",
    run: () => {
      adap.swipe(new Calls())
    }
  },
  {
    id: "posts",
    txt: "APP_POSTS",
    c: "fa-solid fa-camera-polaroid",
    noactive: true,
    run: () => {
      adap.swipe(new Posts())
    }
  }
]
