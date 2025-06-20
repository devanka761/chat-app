import { kel } from "../../helper/kel"
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
    this.name = kel("i", "name", { e: this.typeName })
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
  set unread(num: number) {
    if (num < 1) {
      if (this.eunread) this.el.removeChild(this.eunread)
      return
    }

    if (!this.eunread) {
      this.eunread = kel("i", "num")
      this.el.append(this.eunread)
    }

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
    this.clickListener()
    return this
  }
}
