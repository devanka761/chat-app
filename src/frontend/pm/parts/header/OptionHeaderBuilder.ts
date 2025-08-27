import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import waittime from "../../../helper/waittime"
import userState from "../../../main/userState"
import { PrimaryClass } from "../../../types/userState.types"
import _optionlist from "./_optionlist"
import HeaderBar from "./HeaderBar"

export default class OptionHeaderBuilder {
  public el: HTMLDivElement
  public isLocked: boolean
  private header: HeaderBar
  constructor(s: { header: HeaderBar }) {
    this.header = s.header
  }
  createElement(): void {
    this.isLocked = false
    this.el = kel("div", "header-options")
  }
  async writeOptions(): Promise<void> {
    _optionlist.forEach((btn) => {
      const elnav = kel("div", `btn btn-${btn.id}`)

      const centerClass = userState.center as PrimaryClass
      if (centerClass.role === btn.id) {
        elnav.classList.add("selected")
      } else if ((!centerClass || !centerClass.role) && btn.id === "chats") {
        elnav.classList.add("selected")
      }
      elnav.append(kel("i", btn.c), kel("span", null, { e: " " + lang[btn.txt] }))
      this.el.append(elnav)
      elnav.onclick = async () => {
        if (this.isLocked) return
        if (userState.center?.role === btn.id) return
        if (userState.content?.role === btn.id) return
        if (userState.center?.isLocked) return
        if (userState.content?.isLocked) return
        this.isLocked = true
        await btn.run()
        this.isLocked = false
      }
    })
    await waittime(250)
    this.isLocked = false
    this.clickListener()
  }
  clickListener(): void {
    window.addEventListener("click", () => this.close(), { once: true })
  }
  get html(): HTMLDivElement {
    return this.el
  }
  async close(): Promise<void> {
    this.isLocked = true
    this.el.classList.add("out")
    await waittime(250)
    this.isLocked = false
    this.header.closeOption()
  }
  init(): void {
    this.isLocked = true
    this.createElement()
    this.writeOptions()
  }
  run(): this {
    this.init()
    return this
  }
}
