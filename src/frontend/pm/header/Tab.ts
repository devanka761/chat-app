import { eroot, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import userState from "../../main/userState"
import db from "../../manager/db"
import { PrimaryClass } from "../../types/userState.types"
import HeaderBar from "./HeaderBar"
import _navlist from "./_navlist"

export default class Tab implements PrimaryClass {
  readonly role: string
  public isLocked: boolean
  private el: HTMLDivElement
  private box: HTMLDivElement
  private list: { [key: string]: HTMLDivElement }
  constructor() {
    this.role = "tab"
    this.isLocked = false
    this.list = {}
  }
  private createElement(): void {
    this.box = kel("div", "box")
    this.el = kel("div", "nav", { e: this.box })
  }
  private writeNav(): void {
    _navlist.forEach((btn) => {
      const elnav = kel("div", `btn nav-${btn.id}`)

      const centerClass = userState.center as PrimaryClass
      if (centerClass.role === btn.id) {
        elnav.classList.add("selected")
      } else if ((!centerClass || !centerClass.role) && btn.id === "chats") {
        elnav.classList.add("selected")
      }
      elnav.append(kel("i", btn.c), kel("p", null, { e: lang[btn.txt] }))
      this.box.append(elnav)
      this.list[btn.id] = elnav
      elnav.onclick = async () => {
        if (this.isLocked) return
        if (userState.center?.role === btn.id) return
        if (userState.content?.role === btn.id) return
        if (userState.center?.isLocked) return
        if (userState.content?.isLocked) return
        this.isLocked = true
        await btn.run()
        this.el.querySelectorAll(".selected").forEach((elod) => elod.classList.remove("selected"))
        elnav.classList.add("selected")
        const headerbar = userState.header as HeaderBar
        headerbar.AppName = lang[btn.txt]
        this.isLocked = false
      }
    })
  }
  enable(role: string): void {
    const currnav = this.box.querySelector(`.btn nav-${role}`)
    if (currnav) {
      this.box.querySelectorAll(".selected").forEach((elod) => elod.classList.remove("selected"))
      currnav.classList.add("selected")
    }
  }
  update(tabname?: string): void {
    if (tabname && this[`${tabname}Unseen`]) {
      this[`${tabname}Unseen`]()
      return
    }
    this.chatsUnseen()
    this.friendsUnseen()
  }
  private chatsUnseen(): void {
    const unseen = db.c.find((k) => k.m.find((msg) => msg.userid !== db.me.id && (!msg.readers || msg.readers.find((usr) => usr !== db.me.id))))
    this.writeUnseen("chats", unseen ? true : false)
  }
  private friendsUnseen(): void {
    const unseen = db.me.req && db.me.req.length >= 1
    this.writeUnseen("friends", unseen)
  }
  private writeUnseen(tab: string, unseen?: boolean): void {
    // this.writeUnseen()
    if (unseen && this.list[tab]) {
      this.list[tab].classList.add("unseen")
    } else if (this.list[tab]) {
      this.list[tab].classList.remove("unseen")
    }
  }
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.tab = this
    this.createElement()
    eroot().append(this.el)
    this.writeNav()
    this.update()
  }
}
