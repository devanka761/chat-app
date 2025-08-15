// import "webrtc-adapter"
import Auth from "../pages/Auth"
import userState from "./userState"

export default class Init {
  run(): void {
    userState.load()
    const selColor = userState.color === "light" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", selColor)
    new Auth().run()
  }
}
