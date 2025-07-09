import { epm, kel } from "../../helper/kel"
import { lang } from "../../helper/lang"
import modal from "../../helper/modal"
import noAccount from "../../helper/noAccount"
import userState from "../../main/userState"
import db from "../../manager/db"
import CallBuilder from "../../properties/CallBuilder"
import { IMessageF, IUserF } from "../../types/db.types"
import { PrimaryClass } from "../../types/userState.types"

export default class Calls implements PrimaryClass {
  private el: HTMLDivElement
  isLocked: boolean
  role: string
  king?: "center" | "content" | undefined
  private card_list: HTMLDivElement
  constructor() {
    this.isLocked = false
    this.role = "calls"
    this.king = "center"
  }
  private createElement(): void {
    this.el = kel("div", "Chats pmcenter")
    this.card_list = kel("div", "card-list")
    this.el.append(this.card_list)
  }
  private writeCallList(): void {
    const cdb: { message: IMessageF; users: IUserF[] }[] = []
    const chatlist = db.c
      .filter((ch) => ch.r.type === "user")
      .map((ch) => {
        return { message: ch.m, users: ch.u }
      })
    chatlist.forEach((chats) => {
      chats.message
        .filter((ch) => ch.type === "call")
        .forEach((msg) => {
          cdb.push({ message: msg, users: chats.users })
        })
    })
    cdb.forEach((chat) => this.addToList(chat))
    this.writeIfEmpty(cdb)
  }
  addToList(s: { message: IMessageF; users: IUserF[] }): void {
    const user = s.users.find((usr) => usr.id !== db.me.id) || noAccount()
    const call = new CallBuilder({ chat: s.message, user, parent: this })
    this.card_list.prepend(call.html)
    this.writeIfEmpty([s])
  }
  private writeIfEmpty(cdb: { message: IMessageF; users: IUserF[] }[]): void {
    const oldNomore: HTMLParagraphElement | null = this.el.querySelector(".nomore")
    if (cdb.length < 1) {
      if (oldNomore) return
      const nomore = kel("p", "nomore", { e: `${lang.CHTS_NOCHAT}<br/>${lang.CALL_PLS}` })
      this.card_list.prepend(nomore)
    } else {
      if (oldNomore) oldNomore.remove()
    }
  }
  update(): void {}
  async destroy(instant?: boolean): Promise<void> {
    this.el.classList.add("out")
    if (!instant) await modal.waittime()
    this.isLocked = false
    this.el.remove()
  }
  run(): void {
    userState.center = this
    this.createElement()
    epm().append(this.el)
    this.writeCallList()
  }
}
