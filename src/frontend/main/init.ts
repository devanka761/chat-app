// import "webrtc-adapter"
import Auth from "../pages/Auth"
import userState from "./userState"
import highlighter from "../helper/highlighter"

export default class Init {
  run(): void {
    highlighter()
    userState.load()
    const selColor = userState.color === "light" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", selColor)
    new Auth().run()
  }
}
