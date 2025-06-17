import culement from "../../helper/culement"
import kelement from "../../helper/kelement"
import { lang } from "../../helper/lang"
import userState from "../../main/userState"
import { PrimaryClass } from "../../types/userState.types"
import _navlist from "./_navlist"
import HeaderBar from "./HeaderBar"

export default class Nav implements PrimaryClass {
  readonly id: string
  public isLocked: boolean
  private el: HTMLDivElement
  constructor() {
    this.id = "nav"
    this.isLocked = false
  }
  private createElement(): void {
    this.el = kelement("div", "nav")
  }
  private writeNav(): void {
    _navlist.forEach((btn) => {
      const elnav = kelement("div", `btn nav-${btn.id}`)

      const centerClass = <PrimaryClass>userState.currcenter
      if (centerClass.id === btn.id) {
        elnav.classList.add("selected")
      } else if ((!centerClass || !centerClass.id) && btn.id === "chats") {
        elnav.classList.add("selected")
      }
      elnav.append(kelement("i", btn.c), kelement("p", null, { e: lang[btn.txt] }))
      this.el.append(elnav)
      elnav.onclick = async () => {
        if (this.isLocked) return
        if (userState.currcenter?.id === btn.id) return
        if (userState.currcontent?.id === btn.id) return
        if (userState.currcenter?.isLocked) return
        if (userState.currcontent?.isLocked) return
        this.isLocked = true
        await btn.run()
        this.el.querySelectorAll(".selected").forEach((elod) => elod.classList.remove("selected"))
        elnav.classList.add("selected")
        HeaderBar.AppName = lang[btn.txt]
        this.isLocked = false
      }
    })
  }
  update(): void {}
  async destroy(): Promise<void> {}
  run(): void {
    userState.tab = this
    this.createElement()
    culement.app().append(this.el)
    this.writeNav()
  }
}
