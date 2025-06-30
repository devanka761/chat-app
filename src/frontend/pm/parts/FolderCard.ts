import { kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import userState from "../../main/userState"
import db from "../../manager/db"
import { TChatsTypeF } from "../../types/room.types"
import Chats from "../center/Chats"

export default class FolderCard {
  readonly role: string
  public isLocked: boolean
  public chats: Chats
  private el: HTMLDivElement
  public name: HTMLElement
  public eunread: HTMLElement | null | undefined
  private typeName: TChatsTypeF
  private num?: number
  constructor(s: { chats: Chats; typeName: TChatsTypeF; num?: number }) {
    this.role = "foldercard"
    this.isLocked = false
    this.chats = s.chats
    this.typeName = s.typeName
    this.num = s.num
  }
  createElement(): void {
    this.name = kel("i", "name", { e: lang[`FOLDER_${this.typeName}`] })
    this.el = kel("div", "card", { e: this.name })
  }
  clickListener(): void {
    this.el.onclick = () => this.chats.setTypeList(this.typeName)
  }
  highlight(): void {
    this.el.classList.add("on")
  }
  off(): void {
    this.el.classList.remove("on")
  }
  updateUnread(): void {
    if (this.typeName === "all") return
    const cdb =
      this.typeName === "unread"
        ? db.c.filter((k) => {
            return k.m && k.m.length >= 1
          })
        : db.c.filter((k) => k.r.type === this.typeName && k.m && k.m.length >= 1)
    const curUnread = cdb.filter((k) => k.m.find((msg) => msg.userid !== db.me.id && msg.type !== "call" && msg.type !== "deleted" && (!msg.readers || !msg.readers.find((usr) => usr === db.me.id))))
    this.unread = curUnread.length
  }
  set unread(num: number) {
    const tab = userState.tab
    if (tab) tab.update("chats")
    if (num < 1) {
      if (this.eunread && this.el.contains(this.eunread)) this.el.removeChild(this.eunread)
      return
    }

    if (!this.eunread) {
      this.eunread = kel("i", "num")
    }
    if (!this.el.contains(this.eunread)) this.el.append(this.eunread)

    this.eunread.innerHTML = num.toString()
  }
  get json() {
    return { type: this.typeName, unread: this.num }
  }
  get html(): HTMLDivElement {
    return this.el
  }
  run(): this {
    this.createElement()
    this.updateUnread()
    this.clickListener()
    return this
  }
}
