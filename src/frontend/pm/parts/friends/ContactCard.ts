import { kel } from "../../../helper/kel"
import { lang } from "../../../helper/lang"
import userState from "../../../main/userState"
import db from "../../../manager/db"
import { TFriendsTypeF } from "../../../types/room.types"
import Friends from "../../center/Friends"

export default class ContactCard {
  readonly role: string
  public isLocked: boolean
  public friends: Friends
  private el: HTMLDivElement
  public name: HTMLElement
  public eunread: HTMLElement | null | undefined
  private typeName: TFriendsTypeF
  constructor(s: { friends: Friends; typeName: TFriendsTypeF; num?: number }) {
    this.role = "foldercard"
    this.isLocked = false
    this.friends = s.friends
    this.typeName = s.typeName
  }
  createElement(): void {
    this.name = kel("i", "name", { e: lang[`CONTACT_${this.typeName}`] })
    this.el = kel("div", "card", { e: this.name })
  }
  clickListener(): void {
    this.el.onclick = () => this.friends.setTypeList(this.typeName)
  }
  highlight(): void {
    this.el.classList.add("on")
  }
  off(): void {
    this.el.classList.remove("on")
  }
  updateUnread(): void {
    if (this.typeName !== "request") return
    this.unread = db.me.req?.length || 0
  }
  set unread(num: number) {
    const tab = userState.tab
    if (tab) tab.update("friends")
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
  get type(): string {
    return this.typeName
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
