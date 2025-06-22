import { eroot, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"
import _navlist from "./_navlist"
import HeaderBar from "./HeaderBar"

export class Nav implements PrimaryClass {
  readonly role: string
  public isLocked: boolean
  private el: HTMLDivElement
  private list: { [key: string]: HTMLDivElement }
  constructor() {
    this.role = "nav"
    this.isLocked = false
    this.list = {}
  }
  private createElement(): void {
    this.el = kel("div", "nav")
  }
  private writeNav(): void {
    _navlist.forEach((btn) => {
      const elnav = kel("div", `btn nav-${btn.id}`)

      const centerClass = <PrimaryClass>userState.currcenter
      if (centerClass.role === btn.id) {
        elnav.classList.add("selected")
      } else if ((!centerClass || !centerClass.role) && btn.id === "chats") {
        elnav.classList.add("selected")
      }
      elnav.append(kel("i", btn.c), kel("p", null, { e: lang[btn.txt] }))
      this.el.append(elnav)
      this.list[btn.id] = elnav
      elnav.onclick = async () => {
        if (this.isLocked) return
        if (userState.currcenter?.role === btn.id) return
        if (userState.currcontent?.role === btn.id) return
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
  private writeUnseen(): void {
    this.unseenChats()
  }
  private unseenChats(): void {
    const unseen = db.c.find((k) => k.m.find((msg) => msg.userid !== db.me.id && (!msg.readers || msg.readers.find((usr) => usr !== db.me.id))))
    this.update("chats", unseen ? true : false)
  }
  update(tab: string, unseen?: boolean): void {
    if (unseen && this.list[tab]) {
      this.list[tab].classList.add("unseen")
    } else if (this.list[tab]) {
      this.list[tab].classList.remove("unseen")
    }
  }
  async destroy(): Promise<void> {}
  run(): void {
    userState.tab = this
    this.createElement()
    eroot().append(this.el)
    this.writeNav()
    this.writeUnseen()
  }
}

const Tab = new Nav()
export default Tab
