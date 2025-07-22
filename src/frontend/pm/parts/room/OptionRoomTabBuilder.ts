import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import modal from "../../../helper/modal"
import userState from "../../../main/userState"
import optionlist from "./_optionRoomTabList"
import RoomTab from "./RoomTab"

export default class OptionRoomTabBuilder {
  public el: HTMLDivElement
  public isLocked: boolean
  private tab: RoomTab
  private top: HTMLDivElement
  constructor(s: { tab: RoomTab; top: HTMLDivElement }) {
    this.top = s.top
    this.tab = s.tab
    this.init()
  }
  createElement(): void {
    this.isLocked = false
    this.el = kel("div", "options")
  }
  async writeOptions(): Promise<void> {
    optionlist.forEach((btn) => {
      const elnav = kel("div", `btn btn-${btn.id}`)
      elnav.append(kel("i", btn.c), kel("span", null, { e: " " + lang[btn.txt] }))
      this.el.append(elnav)
      elnav.onclick = async () => {
        if (this.isLocked) return
        if (userState.center?.role === btn.id) return
        if (userState.content?.role === btn.id) return
        if (userState.center?.isLocked) return
        if (userState.content?.isLocked) return
        this.isLocked = true
        await btn.run(this.tab.room)
        this.isLocked = false
      }
    })
    await modal.waittime(250)
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
    await modal.waittime(250)
    this.isLocked = false
    this.top.removeChild(this.el)
    this.el.remove()
    this.tab.closeOptions()
  }
  init(): void {
    this.isLocked = true
    this.createElement()
    this.top.append(this.el)
    this.writeOptions()
  }
  run(): this {
    this.init()
    return this
  }
}
